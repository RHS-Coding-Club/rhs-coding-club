import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  sql,
} from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { Role } from '#/lib/roles'
import { hasRole } from '#/lib/roles'
import {
  ANNOUNCE_WINDOW_MS,
  DIFFICULTY_LABEL,
  canSubmit,
  challengeState,
  fromClubWallTime,
  nextWeekNo,
} from '#/lib/schemas/challenges'
import type {
  ChallengeFormInput,
  ReviewDecision,
  SubmitSolutionInput,
} from '#/lib/schemas/challenges'
import { recipientsFor, sendEmails } from './email'
import type { EmailMessage } from './email'
import { prefsFooter, renderEmail, siteUrl } from './email-templates'
import { settlePoints } from './points'
import { getSetting } from './settings'

// Weekly challenges and their submissions. A challenge is a draft until it
// has a publishedAt, scheduled while that is in the future, and live after.
// Each member gets one submission row per challenge; officers review it, and
// a pass settles the challenge's points on the ledger (sourceId = the
// submission id), so a later fail or reopen reverses exactly that grant.

/** A rule the caller broke (shown to the user as-is). */
export class ChallengeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChallengeError'
  }
}

const c = schema.challenge
const s = schema.submission

const passCount = sql<number>`count(case when ${s.status} = 'pass' then 1 end)`.mapWith(
  Number,
)
const pendingCount =
  sql<number>`count(case when ${s.status} = 'pending' then 1 end)`.mapWith(Number)

const liveWhere = (now: Date) => and(isNotNull(c.publishedAt), lte(c.publishedAt, now))

// ---------- Public reads ----------

/**
 * Every live challenge, newest week first, with its solve count. When
 * `userId` is given, `mine` maps challenge id to that user's status.
 */
export async function listLiveChallenges(db: Db, now: Date, userId?: string | null) {
  const rows = await db
    .select({
      id: c.id,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      points: c.points,
      weekNo: c.weekNo,
      publishedAt: c.publishedAt,
      solves: passCount,
    })
    .from(c)
    .leftJoin(s, eq(s.challengeId, c.id))
    .where(liveWhere(now))
    .groupBy(c.id)
    .orderBy(desc(c.weekNo), desc(c.publishedAt))

  // "This week" is the newest live challenge; it gets its samples for the feature card.
  const first = rows.at(0)
  const samples = first
    ? await db.query.challenge.findFirst({
        where: eq(c.id, first.id),
        columns: { sampleInput: true, sampleOutput: true },
      })
    : undefined
  const featured = first ? { ...first, ...samples } : null

  const mine: Record<string, 'pending' | 'pass' | 'fail'> = {}
  if (userId && rows.length > 0) {
    const subs = await db
      .select({ challengeId: s.challengeId, status: s.status })
      .from(s)
      .where(eq(s.userId, userId))
    for (const r of subs) mine[r.challengeId] = r.status
  }
  return { challenges: rows, featured, mine }
}

export type LiveChallenge = Awaited<
  ReturnType<typeof listLiveChallenges>
>['challenges'][number]

/**
 * One challenge for the detail page, or null when the viewer may not see it:
 * drafts and scheduled challenges exist only for officers (as a preview).
 */
export async function getChallengeForViewer(
  db: Db,
  id: string,
  viewer: { id: string; role: Role } | null,
  now: Date,
) {
  const row = await db.query.challenge.findFirst({
    where: eq(c.id, id),
    columns: {
      id: true,
      title: true,
      description: true,
      prompt: true,
      difficulty: true,
      sampleInput: true,
      sampleOutput: true,
      points: true,
      weekNo: true,
      publishedAt: true,
    },
  })
  if (!row) return null
  const state = challengeState(row.publishedAt, now)
  const isOfficer = hasRole(viewer?.role, 'officer')
  if (state !== 'live' && !isOfficer) return null

  const [solves, mine] = await Promise.all([
    db
      .select({ n: count() })
      .from(s)
      .where(and(eq(s.challengeId, id), eq(s.status, 'pass'))),
    viewer
      ? db.query.submission.findFirst({
          where: and(eq(s.challengeId, id), eq(s.userId, viewer.id)),
          columns: {
            id: true,
            language: true,
            platform: true,
            url: true,
            code: true,
            status: true,
            feedback: true,
            reviewedAt: true,
            submittedAt: true,
          },
        })
      : Promise.resolve(undefined),
  ])

  return {
    challenge: row,
    state,
    preview: state !== 'live',
    solves: solves[0]?.n ?? 0,
    mine: mine ?? null,
  }
}

export type ChallengeDetail = NonNullable<
  Awaited<ReturnType<typeof getChallengeForViewer>>
>

// ---------- Submitting ----------

/**
 * Creates or replaces the user's submission. Resubmitting while pending or
 * failed overwrites the row and puts it back in the queue (feedback and the
 * previous review are cleared); a passed submission is locked.
 */
export async function submitSolution(
  db: Db,
  userId: string,
  input: SubmitSolutionInput,
  now = new Date(),
) {
  const ch = await db.query.challenge.findFirst({
    where: eq(c.id, input.challengeId),
    columns: { id: true, publishedAt: true },
  })
  if (!ch || challengeState(ch.publishedAt, now) !== 'live') {
    throw new ChallengeError('That challenge is not open for submissions.')
  }

  const existing = await db.query.submission.findFirst({
    where: and(eq(s.challengeId, ch.id), eq(s.userId, userId)),
    columns: { id: true, status: true },
  })
  if (existing && !canSubmit(existing.status)) {
    throw new ChallengeError('You already passed this one. Nice work.')
  }

  const values = {
    language: input.language,
    platform: input.platform,
    url: input.url,
    code: input.code?.trim() ? input.code : null,
    status: 'pending' as const,
    feedback: null,
    reviewedBy: null,
    reviewedAt: null,
    submittedAt: now,
    updatedAt: now,
  }
  const rows = await db
    .insert(s)
    .values({ challengeId: ch.id, userId, ...values })
    .onConflictDoUpdate({
      target: [s.challengeId, s.userId],
      set: values,
      // Never reopen a pass, even if one landed between the read and write.
      setWhere: ne(s.status, 'pass'),
    })
    .returning({ id: s.id, status: s.status })
  const saved = rows.at(0)
  if (!saved) throw new ChallengeError('You already passed this one. Nice work.')
  return { id: saved.id, status: saved.status, resubmitted: Boolean(existing) }
}

// ---------- Reviewing ----------

/**
 * Records an officer's decision and settles points: pass grants the
 * challenge's current points, fail or reopen (pending) settles to 0, which
 * reverses an earlier pass. The status is written first so the badge engine
 * (which counts passed submissions) sees the new state.
 */
export async function reviewSubmission(
  db: Db,
  input: { id: string; status: ReviewDecision; feedback?: string; reviewerId: string },
  now = new Date(),
) {
  const row = await db
    .select({
      id: s.id,
      userId: s.userId,
      challengeId: s.challengeId,
      title: c.title,
      points: c.points,
    })
    .from(s)
    .innerJoin(c, eq(c.id, s.challengeId))
    .where(eq(s.id, input.id))
    .get()
  if (!row) throw new ChallengeError('That submission no longer exists.')

  const reopened = input.status === 'pending'
  await db
    .update(s)
    .set({
      status: input.status,
      feedback: input.feedback?.trim() ? input.feedback.trim() : null,
      reviewedBy: reopened ? null : input.reviewerId,
      reviewedAt: reopened ? null : now,
      updatedAt: now,
    })
    .where(eq(s.id, row.id))

  const { delta, awarded } = await settlePoints(db, {
    userId: row.userId,
    source: 'submission',
    sourceId: row.id,
    amount: input.status === 'pass' ? row.points : 0,
    note: `Challenge: ${row.title}`,
    createdBy: input.reviewerId,
  })
  return { status: input.status, delta, awarded }
}

/** The review queue: pending first (oldest first), then everything else, newest first. */
export async function listSubmissionsForReview(
  db: Db,
  filter: { status?: 'pending' | 'pass' | 'fail'; challengeId?: string } = {},
) {
  return db
    .select({
      id: s.id,
      status: s.status,
      language: s.language,
      platform: s.platform,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      challengeId: c.id,
      challengeTitle: c.title,
      weekNo: c.weekNo,
      difficulty: c.difficulty,
      points: c.points,
      userId: schema.user.id,
      userName: schema.user.name,
      userEmail: schema.user.email,
      userImage: schema.user.image,
      userAvatarKey: schema.user.avatarKey,
    })
    .from(s)
    .innerJoin(c, eq(c.id, s.challengeId))
    .innerJoin(schema.user, eq(schema.user.id, s.userId))
    .where(
      and(
        filter.status ? eq(s.status, filter.status) : undefined,
        filter.challengeId ? eq(s.challengeId, filter.challengeId) : undefined,
      ),
    )
    .orderBy(
      sql`case when ${s.status} = 'pending' then 0 else 1 end`,
      sql`case when ${s.status} = 'pending' then ${s.submittedAt} else -${s.submittedAt} end`,
    )
    .limit(500)
}

export type ReviewRow = Awaited<ReturnType<typeof listSubmissionsForReview>>[number]

/** Everything the reviewer needs for one submission. */
export async function getSubmissionDetail(db: Db, id: string) {
  const row = await db
    .select({
      id: s.id,
      status: s.status,
      language: s.language,
      platform: s.platform,
      url: s.url,
      code: s.code,
      feedback: s.feedback,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      reviewedBy: s.reviewedBy,
      challengeId: c.id,
      challengeTitle: c.title,
      weekNo: c.weekNo,
      difficulty: c.difficulty,
      points: c.points,
      userId: schema.user.id,
      userName: schema.user.name,
      userEmail: schema.user.email,
      userImage: schema.user.image,
      userAvatarKey: schema.user.avatarKey,
    })
    .from(s)
    .innerJoin(c, eq(c.id, s.challengeId))
    .innerJoin(schema.user, eq(schema.user.id, s.userId))
    .where(eq(s.id, id))
    .get()
  if (!row) return null
  const reviewer = row.reviewedBy
    ? await db.query.user.findFirst({
        where: eq(schema.user.id, row.reviewedBy),
        columns: { name: true },
      })
    : undefined
  return { ...row, reviewerName: reviewer?.name ?? null }
}

export type SubmissionDetail = NonNullable<
  Awaited<ReturnType<typeof getSubmissionDetail>>
>

// ---------- Officer authoring ----------

/** Every challenge with submission counts, newest week first. */
export async function listChallengesForAdmin(db: Db) {
  const [rows, points] = await Promise.all([
    db
      .select({
        id: c.id,
        title: c.title,
        description: c.description,
        difficulty: c.difficulty,
        points: c.points,
        weekNo: c.weekNo,
        publishedAt: c.publishedAt,
        announcedAt: c.announcedAt,
        submissions: count(s.id),
        pending: pendingCount,
        solves: passCount,
      })
      .from(c)
      .leftJoin(s, eq(s.challengeId, c.id))
      .groupBy(c.id)
      .orderBy(desc(c.weekNo), desc(c.createdAt)),
    getSetting(db, 'points'),
  ])
  return {
    challenges: rows,
    nextWeekNo: nextWeekNo(rows.map((r) => r.weekNo)),
    points: { easy: points.easy, medium: points.medium, hard: points.hard },
  }
}

export async function getChallengeForAdmin(db: Db, id: string) {
  const row = await db.query.challenge.findFirst({ where: eq(c.id, id) })
  if (!row) return null
  const counts = await db
    .select({ submissions: count(s.id), solves: passCount })
    .from(s)
    .where(eq(s.challengeId, id))
  const n = counts.at(0)
  return { ...row, submissions: n?.submissions ?? 0, solves: n?.solves ?? 0 }
}

/** The publish time a form's publish choice resolves to. */
function resolvePublishedAt(
  input: Pick<ChallengeFormInput, 'publishMode' | 'publishAt'>,
  current: Date | null,
  now: Date,
): Date | null {
  if (input.publishMode === 'draft') return null
  if (input.publishMode === 'now') {
    // Already live: keep the original go-live time.
    return current && current <= now ? current : now
  }
  const at = input.publishAt ? fromClubWallTime(input.publishAt) : null
  if (!at) throw new ChallengeError('Pick a valid date and time to schedule it.')
  return at
}

/**
 * Creates or updates a challenge. Editing points never re-settles passes
 * that already happened. Returns whether it just went live, so the caller
 * can announce it right away.
 */
export async function saveChallenge(
  db: Db,
  input: ChallengeFormInput,
  officerId: string,
  now = new Date(),
) {
  const current = input.id
    ? await db.query.challenge.findFirst({
        where: eq(c.id, input.id),
        columns: { id: true, publishedAt: true },
      })
    : undefined
  if (input.id && !current) throw new ChallengeError('That challenge no longer exists.')

  const publishedAt = resolvePublishedAt(input, current?.publishedAt ?? null, now)
  const values = {
    title: input.title.trim(),
    description: input.description.trim(),
    prompt: input.prompt,
    difficulty: input.difficulty,
    points: input.points,
    weekNo: input.weekNo,
    sampleInput: input.sampleInput.trim() ? input.sampleInput : null,
    sampleOutput: input.sampleOutput.trim() ? input.sampleOutput : null,
    publishedAt,
    updatedAt: now,
  }

  let id: string
  if (current) {
    await db.update(c).set(values).where(eq(c.id, current.id))
    id = current.id
  } else {
    const [row] = await db
      .insert(c)
      .values({ ...values, createdBy: officerId })
      .returning({ id: c.id })
    id = row.id
  }
  const wasLive = challengeState(current?.publishedAt, now) === 'live'
  const isLive = challengeState(publishedAt, now) === 'live'
  return { id, state: challengeState(publishedAt, now), wentLive: isLive && !wasLive }
}

/** Quick publish from the table: go live now, or back to draft. */
export async function setChallengePublished(
  db: Db,
  id: string,
  mode: 'now' | 'draft',
  now = new Date(),
) {
  const current = await db.query.challenge.findFirst({
    where: eq(c.id, id),
    columns: { id: true, publishedAt: true },
  })
  if (!current) throw new ChallengeError('That challenge no longer exists.')
  const publishedAt = resolvePublishedAt({ publishMode: mode }, current.publishedAt, now)
  await db.update(c).set({ publishedAt, updatedAt: now }).where(eq(c.id, id))
  const wentLive =
    challengeState(publishedAt, now) === 'live' &&
    challengeState(current.publishedAt, now) !== 'live'
  return { id, state: challengeState(publishedAt, now), wentLive }
}

/**
 * Deletes a challenge and (by cascade) its submissions. Points from passed
 * submissions are reversed first, since their source no longer exists.
 */
export async function deleteChallenge(db: Db, id: string, officerId: string) {
  const passed = await db
    .select({ id: s.id, userId: s.userId })
    .from(s)
    .where(and(eq(s.challengeId, id), eq(s.status, 'pass')))
  // Fail them first so the badge engine no longer counts them.
  if (passed.length > 0) {
    await db
      .update(s)
      .set({ status: 'fail' })
      .where(
        inArray(
          s.id,
          passed.map((p) => p.id),
        ),
      )
  }
  for (const p of passed) {
    await settlePoints(db, {
      userId: p.userId,
      source: 'submission',
      sourceId: p.id,
      amount: 0,
      note: 'Challenge deleted',
      createdBy: officerId,
    })
  }
  const deleted = await db.delete(c).where(eq(c.id, id)).returning({ id: c.id })
  if (deleted.length === 0) throw new ChallengeError('That challenge no longer exists.')
  return { id, reversed: passed.length }
}

// ---------- Announcements (cron + publish now) ----------

function announcementFor(ch: {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  weekNo: number
}) {
  const difficulty = DIFFICULTY_LABEL[ch.difficulty].toLowerCase()
  const content = renderEmail({
    preheader: ch.description,
    heading: `Week ${ch.weekNo}: ${ch.title}`,
    paragraphs: [
      `This week's challenge is up. It is rated ${difficulty} and worth ${ch.points} points.`,
      ch.description,
      'Solve it in any language, then submit a link to your code. An officer reviews it and the points land on the leaderboard.',
    ],
    cta: { label: 'Open the challenge', href: siteUrl(`/challenges/${ch.id}`) },
    ...prefsFooter(),
  })
  return { subject: `New challenge: ${ch.title}`, ...content }
}

/**
 * Emails members about challenges that went live within the last 7 days and
 * were never announced, then marks them announced. Each challenge is claimed
 * with a conditional update before sending, so overlapping runs (the cron and
 * a "Publish now" click) never mail the same challenge twice.
 */
export async function announceChallenges(db: Db, now: Date) {
  const due = await db
    .select({
      id: c.id,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      points: c.points,
      weekNo: c.weekNo,
    })
    .from(c)
    .where(
      and(
        liveWhere(now),
        isNull(c.announcedAt),
        gt(c.publishedAt, new Date(now.getTime() - ANNOUNCE_WINDOW_MS)),
      ),
    )
    .orderBy(asc(c.weekNo))
  if (due.length === 0) return { announced: 0, emails: 0 }

  const recipients = await recipientsFor(db, 'newChallenge')
  let announced = 0
  let emails = 0
  for (const ch of due) {
    const claimed = await db
      .update(c)
      .set({ announcedAt: now })
      .where(and(eq(c.id, ch.id), isNull(c.announcedAt)))
      .returning({ id: c.id })
    if (claimed.length === 0) continue
    announced++
    const mail = announcementFor(ch)
    const messages: EmailMessage[] = recipients.map((r) => ({
      to: r.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }))
    const result = await sendEmails(db, messages)
    emails += result.sent + result.logged
  }
  return { announced, emails }
}
