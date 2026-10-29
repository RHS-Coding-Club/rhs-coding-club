import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  like,
  lte,
  or,
  sql,
} from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { EmailTopic, PointSource } from '#/db/schema'
import { badgesForUsers } from '#/lib/badges'
import { semesterStart } from '#/lib/dates'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import type { EmailPrefsInput, Profile } from '#/lib/schemas/account'
import { PREF_TOPICS } from '#/lib/schemas/account'
import { getAdminOverview } from './home'
import { latestApplication } from './membership'
import { adjustPoints, pointHistory, pointsFor, rankMembers } from './points'
import { getSetting } from './settings'

// Members: the leaderboard, public profiles, the dashboard, account settings,
// and the admin user list. Other domains' tables are read directly here
// (challenges, events, projects) so this module never depends on their
// services.

/** A rule the caller broke; the message is shown to the user as-is. */
export class MemberError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MemberError'
  }
}

const MEMBER_ROLES = ['member', 'officer', 'admin'] as const

export type LeaderboardWindow = 'semester' | 'all'

type BadgeRow = Awaited<ReturnType<typeof badgesForUsers>>[number]

function groupBadges(rows: BadgeRow[]) {
  const by = new Map<string, BadgeRow[]>()
  for (const b of rows) {
    const list = by.get(b.userId) ?? []
    list.push(b)
    by.set(b.userId, list)
  }
  return by
}

/** Highest rarity first, then newest, for the little pips on a row. */
const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 } as const
function byRarity(a: BadgeRow, b: BadgeRow) {
  return (
    RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] ||
    b.awardedAt.getTime() - a.awardedAt.getTime()
  )
}

// ---------- Leaderboard ----------

/**
 * The ranked board for one window, cut to `points.showTop` rows. When the
 * viewer is ranked below the cut they come back as `pinned`, so the page can
 * show a "You" row.
 */
export async function getLeaderboard(
  db: Db,
  opts: { window: LeaderboardWindow; viewerId?: string | null; now?: Date },
) {
  const now = opts.now ?? new Date()
  const since = opts.window === 'semester' ? semesterStart(now) : undefined
  const [ranked, points] = await Promise.all([
    rankMembers(db, { since }),
    getSetting(db, 'points'),
  ])
  const limit = points.showTop > 0 ? points.showTop : 25
  const shown = ranked.slice(0, limit)
  const viewer = opts.viewerId
    ? (ranked.find((r) => r.userId === opts.viewerId) ?? null)
    : null
  const pinned = viewer && viewer.rank > limit ? viewer : null

  const ids = shown.map((r) => r.userId)
  if (pinned) ids.push(pinned.userId)
  const badges = groupBadges(await badgesForUsers(db, ids))
  const withBadges = <T extends { userId: string }>(r: T) => ({
    ...r,
    badges: (badges.get(r.userId) ?? [])
      .sort(byRarity)
      .map((b) => ({ id: b.badgeId, name: b.name, rarity: b.rarity })),
  })

  return {
    window: opts.window,
    since,
    rows: shown.map(withBadges),
    pinned: pinned ? withBadges(pinned) : null,
    viewerRank: viewer?.rank ?? null,
    ranked: ranked.length,
    totalPoints: ranked.reduce((s, r) => s + r.points, 0),
    values: {
      easy: points.easy,
      medium: points.medium,
      hard: points.hard,
      project: points.project,
      attendance: points.attendance,
    },
  }
}

export type Leaderboard = Awaited<ReturnType<typeof getLeaderboard>>

// ---------- Shared reads ----------

/** Projects a user is credited on: as the author or as a listed teammate. */
function onProject(userId: string): SQL {
  const pm = schema.projectMember
  return sql`(${schema.project.authorId} = ${userId} or ${schema.project.id} in (select ${pm.projectId} from ${pm} where ${pm.userId} = ${userId}))`
}

async function rankIn(db: Db, userId: string, since?: Date) {
  const ranked = await rankMembers(db, { since })
  return ranked.find((r) => r.userId === userId)?.rank ?? null
}

/**
 * A ledger page with each row's source resolved to something a person can
 * read (the challenge, event, or project behind it). Formatting happens in
 * `ledgerLabel` on the client.
 */
export async function describedHistory(db: Db, userId: string, limit = 50) {
  const entries = await pointHistory(db, userId, limit)
  return describeLedger(db, entries)
}

/** What a ledger row was for; `id` is the challenge, event, or project. */
export type LedgerRef =
  | { kind: 'challenge'; id: string; title: string; weekNo: number }
  | { kind: 'event'; id: string; title: string }
  | { kind: 'project'; id: string; title: string }
  | null

export async function describeLedger<
  T extends { source: PointSource; sourceId: string | null },
>(db: Db, entries: T[]): Promise<(T & { ref: LedgerRef })[]> {
  const idsFor = (source: PointSource) => [
    ...new Set(
      entries
        .filter((e) => e.source === source && e.sourceId)
        .map((e) => e.sourceId as string),
    ),
  ]
  const subIds = idsFor('submission')
  const projectIds = idsFor('project')
  const attendIds = idsFor('attendance')

  const [subs, challenges, projects, attends, events] = await Promise.all([
    subIds.length
      ? db
          .select({
            key: schema.submission.id,
            id: schema.challenge.id,
            title: schema.challenge.title,
            weekNo: schema.challenge.weekNo,
          })
          .from(schema.submission)
          .innerJoin(
            schema.challenge,
            eq(schema.challenge.id, schema.submission.challengeId),
          )
          .where(inArray(schema.submission.id, subIds))
      : [],
    // Older rows (and the seed) point straight at the challenge.
    subIds.length
      ? db
          .select({
            key: schema.challenge.id,
            id: schema.challenge.id,
            title: schema.challenge.title,
            weekNo: schema.challenge.weekNo,
          })
          .from(schema.challenge)
          .where(inArray(schema.challenge.id, subIds))
      : [],
    projectIds.length
      ? db
          .select({
            key: schema.project.id,
            id: schema.project.id,
            title: schema.project.title,
          })
          .from(schema.project)
          .where(inArray(schema.project.id, projectIds))
      : [],
    attendIds.length
      ? db
          .select({
            key: schema.attendance.id,
            id: schema.event.id,
            title: schema.event.title,
          })
          .from(schema.attendance)
          .innerJoin(schema.event, eq(schema.event.id, schema.attendance.eventId))
          .where(inArray(schema.attendance.id, attendIds))
      : [],
    attendIds.length
      ? db
          .select({
            key: schema.event.id,
            id: schema.event.id,
            title: schema.event.title,
          })
          .from(schema.event)
          .where(inArray(schema.event.id, attendIds))
      : [],
  ])

  const challengeBy = new Map<string, { id: string; title: string; weekNo: number }>()
  for (const { key, ...c } of [...challenges, ...subs]) challengeBy.set(key, c)
  const projectBy = new Map(projects.map(({ key, ...p }) => [key, p]))
  const eventBy = new Map<string, { id: string; title: string }>()
  for (const { key, ...e } of [...events, ...attends]) eventBy.set(key, e)

  return entries.map((e) => {
    let ref: LedgerRef = null
    const id = e.sourceId
    if (id && e.source === 'submission') {
      const c = challengeBy.get(id)
      if (c) ref = { kind: 'challenge', ...c }
    } else if (id && e.source === 'project') {
      const p = projectBy.get(id)
      if (p) ref = { kind: 'project', ...p }
    } else if (id && e.source === 'attendance') {
      const ev = eventBy.get(id)
      if (ev) ref = { kind: 'event', ...ev }
    }
    return { ...e, ref }
  })
}

// ---------- Public profile ----------

/**
 * Everything on /members/$id. Only members, officers, and admins have a
 * public profile; guests and unknown ids return null (the route 404s).
 */
export async function getMemberProfile(db: Db, userId: string, now = new Date()) {
  const u = await db.query.user.findFirst({
    where: and(eq(schema.user.id, userId), inArray(schema.user.role, MEMBER_ROLES)),
    columns: {
      id: true,
      name: true,
      image: true,
      avatarKey: true,
      role: true,
      bio: true,
      gradYear: true,
      skills: true,
      githubUsername: true,
      createdAt: true,
    },
  })
  if (!u) return null

  const since = semesterStart(now)
  const [allTime, semester, rank, allTimeRank, solved, attended, projects, badges] =
    await Promise.all([
      pointsFor(db, u.id),
      pointsFor(db, u.id, since),
      rankIn(db, u.id, since),
      rankIn(db, u.id),
      db
        .select({
          id: schema.challenge.id,
          title: schema.challenge.title,
          weekNo: schema.challenge.weekNo,
          difficulty: schema.challenge.difficulty,
          solvedAt:
            sql<number>`coalesce(${schema.submission.reviewedAt}, ${schema.submission.submittedAt})`.mapWith(
              (v) => new Date(Number(v)),
            ),
        })
        .from(schema.submission)
        .innerJoin(
          schema.challenge,
          eq(schema.challenge.id, schema.submission.challengeId),
        )
        .where(
          and(eq(schema.submission.userId, u.id), eq(schema.submission.status, 'pass')),
        )
        .orderBy(desc(schema.challenge.weekNo)),
      db
        .select({ n: count() })
        .from(schema.attendance)
        .where(eq(schema.attendance.userId, u.id)),
      db
        .select({
          id: schema.project.id,
          title: schema.project.title,
          description: schema.project.description,
          tech: schema.project.tech,
          imageKeys: schema.project.imageKeys,
          repoUrl: schema.project.repoUrl,
          demoUrl: schema.project.demoUrl,
          year: schema.project.year,
        })
        .from(schema.project)
        .where(and(eq(schema.project.status, 'approved'), onProject(u.id)))
        .orderBy(desc(schema.project.featured), desc(schema.project.createdAt)),
      badgesForUsers(db, [u.id]),
    ])

  return {
    user: u,
    stats: {
      allTime,
      semester,
      rank,
      allTimeRank,
      solved: solved.length,
      events: attended[0]?.n ?? 0,
      projects: projects.length,
    },
    solved,
    projects,
    badges: badges.sort(byRarity).map((b) => ({
      id: b.badgeId,
      name: b.name,
      description: b.description,
      rarity: b.rarity,
      imageKey: b.imageKey,
      awardedAt: b.awardedAt,
    })),
  }
}

export type MemberProfile = NonNullable<Awaited<ReturnType<typeof getMemberProfile>>>

// ---------- Dashboard ----------

/**
 * The signed-in home. Guests get their application status; members get
 * their numbers, this week's challenge, RSVPs, projects, badges, and ledger.
 * Officers also get the admin queue counts.
 */
export async function getDashboard(
  db: Db,
  viewer: { id: string; role: Role },
  now = new Date(),
) {
  if (!hasRole(viewer.role, 'member')) {
    const application = await latestApplication(db, viewer.id)
    return { kind: 'guest' as const, application }
  }

  const since = semesterStart(now)
  const [allTime, semester, rank, challenge, rsvps, projects, badges, ledger, queues] =
    await Promise.all([
      pointsFor(db, viewer.id),
      pointsFor(db, viewer.id, since),
      rankIn(db, viewer.id, since),
      db.query.challenge.findFirst({
        where: and(
          isNotNull(schema.challenge.publishedAt),
          lte(schema.challenge.publishedAt, now),
        ),
        orderBy: [desc(schema.challenge.weekNo), desc(schema.challenge.publishedAt)],
        columns: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          points: true,
          weekNo: true,
        },
      }),
      db
        .select({
          id: schema.event.id,
          title: schema.event.title,
          startsAt: schema.event.startsAt,
          location: schema.event.location,
          status: schema.rsvp.status,
        })
        .from(schema.rsvp)
        .innerJoin(schema.event, eq(schema.event.id, schema.rsvp.eventId))
        .where(
          and(
            eq(schema.rsvp.userId, viewer.id),
            inArray(schema.rsvp.status, ['yes', 'maybe']),
            gte(schema.event.endsAt, now),
          ),
        )
        .orderBy(schema.event.startsAt)
        .limit(4),
      db
        .select({
          id: schema.project.id,
          title: schema.project.title,
          status: schema.project.status,
          rejectionReason: schema.project.rejectionReason,
          createdAt: schema.project.createdAt,
        })
        .from(schema.project)
        .where(onProject(viewer.id))
        .orderBy(desc(schema.project.createdAt))
        .limit(6),
      badgesForUsers(db, [viewer.id]),
      describedHistory(db, viewer.id, 8),
      hasRole(viewer.role, 'officer') ? getAdminOverview(db) : Promise.resolve(null),
    ])

  const submission = challenge
    ? await db.query.submission.findFirst({
        where: and(
          eq(schema.submission.challengeId, challenge.id),
          eq(schema.submission.userId, viewer.id),
        ),
        columns: { status: true, submittedAt: true, feedback: true },
      })
    : undefined

  return {
    kind: 'member' as const,
    points: { allTime, semester, rank },
    challenge: challenge ? { ...challenge, submission: submission ?? null } : null,
    rsvps,
    projects,
    badges: badges
      .sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime())
      .slice(0, 6)
      .map((b) => ({
        id: b.badgeId,
        name: b.name,
        description: b.description,
        rarity: b.rarity,
        awardedAt: b.awardedAt,
      })),
    ledger,
    queues,
  }
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>

// ---------- Account ----------

export async function getAccount(db: Db, userId: string) {
  const [u, accounts] = await Promise.all([
    db.query.user.findFirst({
      where: eq(schema.user.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatarKey: true,
        role: true,
        bio: true,
        gradYear: true,
        skills: true,
        githubUsername: true,
        emailPrefs: true,
        createdAt: true,
      },
    }),
    db
      .select({
        id: schema.account.id,
        providerId: schema.account.providerId,
        createdAt: schema.account.createdAt,
      })
      .from(schema.account)
      .where(eq(schema.account.userId, userId))
      .orderBy(schema.account.createdAt),
  ])
  if (!u) throw new MemberError('Your account was not found. Sign in again.')
  return { user: u, accounts }
}

export async function updateProfile(db: Db, userId: string, input: Profile) {
  const row = await db
    .update(schema.user)
    .set({
      name: input.name,
      bio: input.bio,
      gradYear: input.gradYear,
      skills: input.skills,
      githubUsername: input.githubUsername,
      avatarKey: input.avatarKey,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, userId))
    .returning({ id: schema.user.id })
    .then((rows) => rows.at(0))
  if (!row) throw new MemberError('Your account was not found. Sign in again.')
}

/**
 * Saves the account's switches. Stored as opt-outs only (`false` keys), so a
 * topic added later defaults to on. The newsletter flag is left alone.
 */
export async function updateEmailPrefs(db: Db, userId: string, prefs: EmailPrefsInput) {
  const current = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
    columns: { emailPrefs: true },
  })
  if (!current) throw new MemberError('Your account was not found. Sign in again.')
  const next: Partial<Record<EmailTopic, boolean>> = {}
  if (current.emailPrefs.newsletter === false) next.newsletter = false
  for (const { topic } of PREF_TOPICS) if (!prefs[topic]) next[topic] = false
  await db
    .update(schema.user)
    .set({ emailPrefs: next, updatedAt: new Date() })
    .where(eq(schema.user.id, userId))
  return next
}

// ---------- Admin: users ----------

// Written out in full: inside a select list Drizzle renders bare column
// names, and an unqualified "id" here would bind to point_entry.id.
const pointsTotal =
  sql<number>`(select coalesce(sum(pe.delta), 0) from point_entry pe where pe.user_id = "user"."id")`.mapWith(
    Number,
  )

export async function listUsers(db: Db, opts: { q: string; role: Role | 'all' }) {
  const q = opts.q.trim().toLowerCase()
  const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`
  return db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      image: schema.user.image,
      avatarKey: schema.user.avatarKey,
      role: schema.user.role,
      createdAt: schema.user.createdAt,
      points: pointsTotal,
    })
    .from(schema.user)
    .where(
      and(
        opts.role === 'all' ? undefined : eq(schema.user.role, opts.role),
        q
          ? or(
              like(sql`lower(${schema.user.name})`, sql`${pattern} escape '\\'`),
              like(sql`lower(${schema.user.email})`, sql`${pattern} escape '\\'`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(schema.user.createdAt))
    .limit(300)
}

export type UserListRow = Awaited<ReturnType<typeof listUsers>>[number]

export async function getUserDetail(db: Db, userId: string, now = new Date()) {
  const u = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      avatarKey: true,
      role: true,
      gradYear: true,
      githubUsername: true,
      createdAt: true,
    },
  })
  if (!u) return null
  const [allTime, semester, ledger, application, badges] = await Promise.all([
    pointsFor(db, u.id),
    pointsFor(db, u.id, semesterStart(now)),
    describedHistory(db, u.id, 100),
    latestApplication(db, u.id),
    badgesForUsers(db, [u.id]),
  ])
  return {
    user: u,
    points: { allTime, semester },
    ledger,
    application,
    badges: badges.map((b) => ({ id: b.badgeId, name: b.name, rarity: b.rarity })),
  }
}

export type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserDetail>>>

async function adminCount(db: Db) {
  const row = await db
    .select({ n: count() })
    .from(schema.user)
    .where(eq(schema.user.role, 'admin'))
    .then((rows) => rows.at(0))
  return row?.n ?? 0
}

/**
 * An admin sets someone's role. Admins can't change their own role (so
 * nobody demotes themselves by accident) and the last admin can't be
 * demoted. Promoting a guest also approves their pending application.
 */
export async function changeRole(
  db: Db,
  input: { actorId: string; userId: string; role: Role },
) {
  const target = await db.query.user.findFirst({
    where: eq(schema.user.id, input.userId),
    columns: { id: true, role: true },
  })
  if (!target) throw new MemberError('That user no longer exists.')
  if (target.role === input.role) return { changed: false as const }
  if (target.id === input.actorId)
    throw new MemberError('You can’t change your own role. Ask another admin.')
  if (target.role === 'admin' && (await adminCount(db)) <= 1)
    throw new MemberError('This is the only admin. Make someone else an admin first.')

  await db
    .update(schema.user)
    .set({ role: input.role, updatedAt: new Date() })
    .where(eq(schema.user.id, target.id))

  if (target.role === 'guest' && hasRole(input.role, 'member')) {
    await db
      .update(schema.membershipApplication)
      .set({
        status: 'approved',
        reviewedBy: input.actorId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.membershipApplication.userId, target.id),
          eq(schema.membershipApplication.status, 'pending'),
        ),
      )
  }
  return { changed: true as const }
}

/** An admin's manual bonus or correction, with a note the member sees on their ledger. */
export async function adjustMemberPoints(
  db: Db,
  input: { userId: string; delta: number; note: string; createdBy: string },
) {
  const exists = await db.query.user.findFirst({
    where: eq(schema.user.id, input.userId),
    columns: { id: true },
  })
  if (!exists) throw new MemberError('That user no longer exists.')
  const { awarded } = await adjustPoints(db, input)
  return { awarded }
}
