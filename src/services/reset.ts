import { and, count, countDistinct, eq, gte, isNotNull, ne, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { BatchItem } from 'drizzle-orm/batch'
import type { AnySQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core'
import type { Db } from '#/db'
import { schema } from '#/db'
import { RESET_ACTIONS } from '#/lib/schemas/reset'
import type { ResetAction } from '#/lib/schemas/reset'
import { pointsWindowStart } from './points'
import { setSetting } from './settings'

// The admin reset tool. Every action is a set of statements run together in
// one D1 batch (all or nothing). Admin accounts and the admin running it are
// never deleted or demoted. Images owned by deleted rows are removed from R2
// afterwards, best effort.

const t = schema

/** Ids the seed script uses look like `c_seed_1`; real and imported ids never contain `_seed_`. */
const seeded = (col: AnySQLiteColumn) => sql`${col} LIKE '%\\_seed\\_%' ESCAPE '\\'`
const sampleUser = sql`${t.user.email} LIKE '%@test.local'`

/** Users an action may delete: never an admin, never the person running it. */
const deletable = (actorId: string, extra?: SQL) =>
  and(ne(t.user.role, 'admin'), ne(t.user.id, actorId), extra)

const n = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0

/** How many rows each action would touch right now, for the checklist. */
export async function resetCounts(
  db: Db,
  actorId: string,
  now = new Date(),
): Promise<Record<ResetAction, number>> {
  const since = await pointsWindowStart(db, now)
  const c = (table: SQLiteTable, where?: SQL) =>
    n(db.select({ n: count() }).from(table).where(where))

  const sampleTables = [
    t.challenge,
    t.submission,
    t.event,
    t.rsvp,
    t.attendance,
    t.project,
    t.projectMember,
    t.post,
    t.resource,
    t.resourceBookmark,
    t.officer,
    t.badge,
    t.userBadge,
    t.pointEntry,
    t.membershipApplication,
    t.githubMembershipRequest,
    t.newsletterSubscriber,
    t.newsletterIssue,
    t.contactMessage,
  ]

  const [
    season,
    points,
    badgeAwards,
    memberships,
    applications,
    githubRequests,
    guests,
    accounts,
    events,
    challenges,
    projects,
    posts,
    resources,
    officers,
    badges,
    issues,
    subscribers,
    messages,
    settings,
    sampleUsers,
    ...sampleRows
  ] = await Promise.all([
    n(
      db
        .select({ n: countDistinct(t.pointEntry.userId) })
        .from(t.pointEntry)
        .where(gte(t.pointEntry.createdAt, since)),
    ),
    c(t.pointEntry),
    c(t.userBadge),
    c(t.user, eq(t.user.role, 'member')),
    c(t.membershipApplication),
    c(t.githubMembershipRequest),
    c(t.user, deletable(actorId, eq(t.user.role, 'guest'))),
    c(t.user, deletable(actorId)),
    c(t.event),
    c(t.challenge),
    c(t.project),
    c(t.post),
    c(t.resource),
    c(t.officer),
    c(t.badge),
    c(t.newsletterIssue),
    c(t.newsletterSubscriber),
    c(t.contactMessage),
    c(t.setting, ne(t.setting.key, 'season')),
    c(t.user, and(sampleUser, ne(t.user.id, actorId))),
    ...sampleTables.map((table) => c(table, seeded(table.id))),
  ])

  return {
    season,
    points,
    'badge-awards': badgeAwards,
    memberships,
    applications,
    'github-requests': githubRequests,
    guests,
    accounts,
    events,
    challenges,
    projects,
    posts,
    resources,
    officers,
    badges,
    newsletter: issues + subscribers,
    messages,
    settings,
    sample: sampleUsers + sampleRows.reduce((s, x) => s + x, 0),
  }
}

/** Order matters: delete guests before members are demoted to guest, etc. */
const ORDER: ResetAction[] = [
  'sample',
  'accounts',
  'guests',
  'events',
  'challenges',
  'projects',
  'posts',
  'resources',
  'badges',
  'badge-awards',
  'points',
  'memberships',
  'applications',
  'github-requests',
  'officers',
  'newsletter',
  'messages',
  'settings',
  'season',
]

/** R2 keys owned by rows an action deletes, gathered before the delete. */
async function filesFor(db: Db, actions: Set<ResetAction>, actorId: string) {
  const keys: string[] = []
  const add = (v: string | null | undefined) => {
    if (v) keys.push(v)
  }
  if (actions.has('projects')) {
    for (const p of await db.select({ k: t.project.imageKeys }).from(t.project))
      p.k.forEach(add)
  }
  if (actions.has('events'))
    (
      await db
        .select({ k: t.event.coverKey })
        .from(t.event)
        .where(isNotNull(t.event.coverKey))
    ).forEach((r) => add(r.k))
  if (actions.has('officers'))
    (
      await db
        .select({ k: t.officer.imageKey })
        .from(t.officer)
        .where(isNotNull(t.officer.imageKey))
    ).forEach((r) => add(r.k))
  if (actions.has('badges'))
    (
      await db
        .select({ k: t.badge.imageKey })
        .from(t.badge)
        .where(isNotNull(t.badge.imageKey))
    ).forEach((r) => add(r.k))
  const people = actions.has('accounts')
    ? deletable(actorId)
    : actions.has('guests')
      ? deletable(actorId, eq(t.user.role, 'guest'))
      : null
  if (people)
    (
      await db
        .select({ k: t.user.avatarKey })
        .from(t.user)
        .where(and(people, isNotNull(t.user.avatarKey)))
    ).forEach((r) => add(r.k))
  return [...new Set(keys)]
}

export interface ResetResult {
  ran: ResetAction[]
  counts: Partial<Record<ResetAction, number>>
  filesRemoved: number
}

export async function runReset(
  db: Db,
  bucket: R2Bucket | null,
  input: { actions: ResetAction[]; actorId: string },
  now = new Date(),
): Promise<ResetResult> {
  const actions = new Set(input.actions.filter((a) => RESET_ACTIONS.includes(a)))
  const before = await resetCounts(db, input.actorId, now)
  const files = await filesFor(db, actions, input.actorId)
  const { actorId } = input

  const steps: BatchItem<'sqlite'>[] = []
  for (const action of ORDER) {
    if (!actions.has(action)) continue
    switch (action) {
      case 'sample':
        for (const table of [
          t.attendance,
          t.rsvp,
          t.submission,
          t.pointEntry,
          t.userBadge,
          t.projectMember,
          t.resourceBookmark,
          t.project,
          t.challenge,
          t.event,
          t.post,
          t.resource,
          t.officer,
          t.badge,
          t.membershipApplication,
          t.githubMembershipRequest,
          t.newsletterSubscriber,
          t.newsletterIssue,
          t.contactMessage,
        ])
          steps.push(db.delete(table).where(seeded(table.id)))
        steps.push(db.delete(t.user).where(and(sampleUser, ne(t.user.id, actorId))))
        break
      case 'accounts':
        steps.push(db.delete(t.user).where(deletable(actorId)))
        break
      case 'guests':
        steps.push(db.delete(t.user).where(deletable(actorId, eq(t.user.role, 'guest'))))
        break
      case 'events':
        steps.push(db.delete(t.event))
        break
      case 'challenges':
        steps.push(db.delete(t.challenge))
        break
      case 'projects':
        steps.push(db.delete(t.project))
        break
      case 'posts':
        steps.push(db.delete(t.post))
        break
      case 'resources':
        steps.push(db.delete(t.resource))
        break
      case 'badges':
        steps.push(db.delete(t.badge))
        break
      case 'badge-awards':
        steps.push(db.delete(t.userBadge))
        break
      case 'points':
        steps.push(db.delete(t.pointEntry))
        break
      case 'memberships':
        steps.push(
          db
            .update(t.user)
            .set({ role: 'guest', updatedAt: now })
            .where(eq(t.user.role, 'member')),
        )
        break
      case 'applications':
        steps.push(db.delete(t.membershipApplication))
        break
      case 'github-requests':
        steps.push(db.delete(t.githubMembershipRequest))
        break
      case 'officers':
        steps.push(db.delete(t.officer))
        break
      case 'newsletter':
        steps.push(db.delete(t.newsletterIssue), db.delete(t.newsletterSubscriber))
        break
      case 'messages':
        steps.push(db.delete(t.contactMessage))
        break
      case 'settings':
        steps.push(db.delete(t.setting).where(ne(t.setting.key, 'season')))
        break
      case 'season':
        break // written below, through the settings service
    }
  }

  if (steps.length)
    await db.batch(steps as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]])
  if (actions.has('season'))
    await setSetting(db, 'season', { startedAt: now.getTime() }, actorId)

  let filesRemoved = 0
  if (bucket && files.length) {
    for (let i = 0; i < files.length; i += 1000) {
      const chunk = files.slice(i, i + 1000)
      try {
        await bucket.delete(chunk)
        filesRemoved += chunk.length
      } catch (err) {
        console.warn('[reset] could not remove some files', err)
      }
    }
  }

  const ran = ORDER.filter((a) => actions.has(a))
  return {
    ran,
    counts: Object.fromEntries(ran.map((a) => [a, before[a]])),
    filesRemoved,
  }
}

/**
 * Everything except login secrets (accounts, sessions, verification
 * tokens), as a JSON string, for the backup the reset tool offers first.
 */
export async function exportBackup(db: Db, now = new Date()) {
  const tables = {
    user: t.user,
    setting: t.setting,
    membership_application: t.membershipApplication,
    officer: t.officer,
    challenge: t.challenge,
    submission: t.submission,
    point_entry: t.pointEntry,
    event: t.event,
    rsvp: t.rsvp,
    attendance: t.attendance,
    project: t.project,
    project_member: t.projectMember,
    post: t.post,
    resource: t.resource,
    resource_bookmark: t.resourceBookmark,
    badge: t.badge,
    user_badge: t.userBadge,
    github_membership_request: t.githubMembershipRequest,
    newsletter_subscriber: t.newsletterSubscriber,
    newsletter_issue: t.newsletterIssue,
    contact_message: t.contactMessage,
  }
  const entries = await Promise.all(
    Object.entries(tables).map(
      async ([name, table]) => [name, await db.select().from(table)] as const,
    ),
  )
  // A finished JSON string: the browser saves it as-is, and free-form
  // columns (setting.value) don't have to survive the RPC serializer.
  return JSON.stringify(
    {
      app: 'rhs-coding-club',
      version: 1,
      exportedAt: now.toISOString(),
      tables: Object.fromEntries(entries),
    },
    null,
    2,
  )
}
