import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { ApplicationStatus } from '#/db/schema'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import type { Application } from '#/lib/schemas/membership'
import { joinAvailability } from '#/lib/schemas/membership'
import { recipientById, sendEmail } from './email'
import { prefsFooter, renderEmail, siteUrl } from './email-templates'

// Membership: a guest applies on /join, an officer approves (guest becomes
// member) or rejects with a note, and the applicant hears back by email.
// One pending application per user at a time; rejected applicants reapply.

export class MembershipError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MembershipError'
  }
}

const a = schema.membershipApplication

/** The user's newest application, or null. */
export async function latestApplication(db: Db, userId: string) {
  const row = await db.query.membershipApplication.findFirst({
    where: eq(a.userId, userId),
    orderBy: [desc(a.createdAt)],
    columns: {
      id: true,
      status: true,
      reviewNote: true,
      reviewedAt: true,
      createdAt: true,
      grade: true,
      experience: true,
      languages: true,
      interests: true,
      goals: true,
      whyJoin: true,
      availability: true,
      githubUsername: true,
    },
  })
  return row ?? null
}

export type LatestApplication = Awaited<ReturnType<typeof latestApplication>>

/**
 * What /join shows: an application form, the pending screen, or "you're in".
 * A rejected application still shows the form, with the officer's note.
 */
export async function getJoinState(db: Db, viewer: { id: string; role: Role } | null) {
  if (!viewer) return { kind: 'signed-out' as const }
  if (hasRole(viewer.role, 'member')) return { kind: 'member' as const }
  const application = await latestApplication(db, viewer.id)
  if (application?.status === 'pending') return { kind: 'pending' as const, application }
  return {
    kind: 'apply' as const,
    previous: application?.status === 'rejected' ? application : null,
  }
}

export type JoinState = Awaited<ReturnType<typeof getJoinState>>

export async function submitApplication(
  db: Db,
  viewer: { id: string; role: Role },
  input: Application,
) {
  if (hasRole(viewer.role, 'member'))
    throw new MembershipError('You’re already a member.')
  const pending = await db
    .select({ n: count() })
    .from(a)
    .where(and(eq(a.userId, viewer.id), eq(a.status, 'pending')))
  if ((pending[0]?.n ?? 0) > 0)
    throw new MembershipError('You already have an application under review.')

  const row = await db
    .insert(a)
    .values({
      userId: viewer.id,
      grade: input.grade,
      experience: input.experience,
      languages: input.languages,
      interests: input.interests,
      goals: input.goals,
      whyJoin: input.whyJoin,
      availability: joinAvailability(input.availability),
      githubUsername: input.githubUsername,
    })
    .returning({ id: a.id, createdAt: a.createdAt })
    .then((rows) => rows.at(0))
  return row
}

const reviewer = alias(schema.user, 'reviewer')

/** The officer queue: pending first (oldest first, so nobody waits), then the rest newest first. */
export async function listApplications(
  db: Db,
  opts: { status: ApplicationStatus | 'all' } = { status: 'pending' },
) {
  return db
    .select({
      id: a.id,
      status: a.status,
      grade: a.grade,
      experience: a.experience,
      interests: a.interests,
      createdAt: a.createdAt,
      reviewedAt: a.reviewedAt,
      userId: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      image: schema.user.image,
      avatarKey: schema.user.avatarKey,
      role: schema.user.role,
    })
    .from(a)
    .innerJoin(schema.user, eq(schema.user.id, a.userId))
    .where(opts.status === 'all' ? undefined : eq(a.status, opts.status))
    .orderBy(
      sql`case when ${a.status} = 'pending' then 0 else 1 end`,
      sql`case when ${a.status} = 'pending' then ${a.createdAt} else -${a.createdAt} end`,
    )
    .limit(200)
}

export type ApplicationRow = Awaited<ReturnType<typeof listApplications>>[number]

export async function getApplicationDetail(db: Db, id: string) {
  const row = await db
    .select({
      application: a,
      user: {
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        image: schema.user.image,
        avatarKey: schema.user.avatarKey,
        role: schema.user.role,
        githubUsername: schema.user.githubUsername,
        createdAt: schema.user.createdAt,
      },
      reviewerName: reviewer.name,
    })
    .from(a)
    .innerJoin(schema.user, eq(schema.user.id, a.userId))
    .leftJoin(reviewer, eq(reviewer.id, a.reviewedBy))
    .where(eq(a.id, id))
    .then((rows) => rows.at(0))
  if (!row) return null
  const history = await db
    .select({ id: a.id, status: a.status, createdAt: a.createdAt })
    .from(a)
    .where(eq(a.userId, row.user.id))
    .orderBy(asc(a.createdAt))
  return { ...row, history }
}

export type ApplicationDetail = NonNullable<
  Awaited<ReturnType<typeof getApplicationDetail>>
>

/**
 * Approve or reject a pending application. Approving makes a guest a member
 * (an officer or admin is never demoted) and copies their GitHub username
 * onto the profile if it is empty. The applicant is emailed either way,
 * after the write, unless they opted out.
 */
export async function reviewApplication(
  db: Db,
  input: {
    id: string
    reviewerId: string
    decision: 'approve' | 'reject'
    note: string | null
  },
) {
  const app = await db.query.membershipApplication.findFirst({
    where: eq(a.id, input.id),
  })
  if (!app) throw new MembershipError('That application no longer exists.')
  if (app.status !== 'pending')
    throw new MembershipError(`This application was already ${app.status}.`)

  const status = input.decision === 'approve' ? 'approved' : 'rejected'
  const now = new Date()
  await db
    .update(a)
    .set({
      status,
      reviewNote: input.note,
      reviewedBy: input.reviewerId,
      reviewedAt: now,
      updatedAt: now,
    })
    .where(and(eq(a.id, app.id), eq(a.status, 'pending')))

  let promoted = false
  if (status === 'approved') {
    const u = await db.query.user.findFirst({
      where: eq(schema.user.id, app.userId),
      columns: { role: true, githubUsername: true },
    })
    if (u) {
      const patch: Partial<typeof schema.user.$inferInsert> = {}
      if (u.role === 'guest') {
        patch.role = 'member'
        promoted = true
      }
      if (!u.githubUsername && app.githubUsername)
        patch.githubUsername = app.githubUsername
      if (Object.keys(patch).length > 0) {
        await db
          .update(schema.user)
          .set({ ...patch, updatedAt: now })
          .where(eq(schema.user.id, app.userId))
      }
    }
  }

  await notifyApplicant(db, app.userId, status, input.note)
  return { status, promoted }
}

async function notifyApplicant(
  db: Db,
  userId: string,
  status: 'approved' | 'rejected',
  note: string | null,
) {
  const to = await recipientById(db, userId, 'applicationDecision')
  if (!to) return
  const first = to.name.split(' ')[0] || to.name
  const footer = {
    ...prefsFooter(),
    footer: 'You get this because you applied to join RHS Coding Club.',
  }
  const content =
    status === 'approved'
      ? renderEmail({
          preheader: 'Your application was approved.',
          heading: `You’re in, ${first}.`,
          paragraphs: [
            'An officer approved your application. You can now submit weekly challenges, RSVP and check in to events, and add projects to the showcase.',
            ...(note ? [`A note from the officers: ${note}`] : []),
            'We meet at lunch in Mr. Derrick’s classroom. Come say hi.',
          ],
          cta: { label: 'Open your dashboard', href: siteUrl('/dashboard') },
          ...footer,
        })
      : renderEmail({
          preheader: 'An update on your application.',
          heading: `About your application, ${first}`,
          paragraphs: [
            'Thanks for applying to RHS Coding Club. The officers did not approve this one yet.',
            ...(note ? [`Their note: ${note}`] : []),
            'You can update your answers and apply again any time.',
          ],
          cta: { label: 'Apply again', href: siteUrl('/join') },
          ...footer,
        })
  await sendEmail(db, {
    to: to.email,
    subject:
      status === 'approved'
        ? 'Welcome to RHS Coding Club'
        : 'Your RHS Coding Club application',
    ...content,
  })
}
