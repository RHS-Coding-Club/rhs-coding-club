import { and, count, desc, eq, inArray, like, or } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import { awardBadge, badgeCandidates, evaluateBadgesFor, revokeBadge } from '#/lib/badges'
import type { BadgeInput } from '#/lib/schemas/badges'

// The officer badge editor. Every award goes through the badge engine in
// src/lib/badges.ts; nothing here writes user_badge directly.

export class BadgeAdminError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BadgeAdminError'
  }
}

const MEMBER_ROLES = ['member', 'officer', 'admin'] as const

export async function listBadgesAdmin(db: Db) {
  const [badges, holders] = await Promise.all([
    db.query.badge.findMany({ orderBy: [schema.badge.sortOrder, schema.badge.name] }),
    db
      .select({ badgeId: schema.userBadge.badgeId, n: count() })
      .from(schema.userBadge)
      .groupBy(schema.userBadge.badgeId),
  ])
  const counts = new Map(holders.map((h) => [h.badgeId, h.n]))
  return badges.map((b) => ({ ...b, holders: counts.get(b.id) ?? 0 }))
}

export type AdminBadgeRow = Awaited<ReturnType<typeof listBadgesAdmin>>[number]

async function holderCount(db: Db, badgeId: string) {
  const row = await db
    .select({ n: count() })
    .from(schema.userBadge)
    .where(eq(schema.userBadge.badgeId, badgeId))
    .then((rows) => rows.at(0))
  return row?.n ?? 0
}

/**
 * Creates or updates a badge. When the saved badge auto-awards, the engine
 * re-runs for everyone with points so members who already qualify get it
 * now instead of on their next points change. Returns how many it awarded.
 */
export async function saveBadge(db: Db, input: BadgeInput) {
  const { id, ...values } = input
  const clean = {
    ...values,
    threshold: values.criteriaType === 'custom' ? null : values.threshold,
    autoAward: values.criteriaType === 'custom' ? false : values.autoAward,
  }

  let badgeId: string
  if (id) {
    const row = await db
      .update(schema.badge)
      .set(clean)
      .where(eq(schema.badge.id, id))
      .returning({ id: schema.badge.id })
      .then((rows) => rows.at(0))
    if (!row) throw new BadgeAdminError('That badge no longer exists.')
    badgeId = row.id
  } else {
    const row = await db
      .insert(schema.badge)
      .values(clean)
      .returning({ id: schema.badge.id })
      .then((rows) => rows.at(0))
    if (!row) throw new BadgeAdminError('Could not save that. Try again.')
    badgeId = row.id
  }

  let awarded = 0
  if (clean.autoAward && clean.isActive) {
    const before = await holderCount(db, badgeId)
    await evaluateBadgesFor(db, await badgeCandidates(db))
    awarded = (await holderCount(db, badgeId)) - before
  }
  return { id: badgeId, awarded }
}

export async function deleteBadge(db: Db, id: string) {
  await db.delete(schema.badge).where(eq(schema.badge.id, id))
}

/** Who holds a badge, newest first, with who handed it out (null = automatic). */
export async function badgeHolders(db: Db, badgeId: string) {
  const rows = await db
    .select({
      userId: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      image: schema.user.image,
      avatarKey: schema.user.avatarKey,
      awardedAt: schema.userBadge.awardedAt,
      awardedBy: schema.userBadge.awardedBy,
    })
    .from(schema.userBadge)
    .innerJoin(schema.user, eq(schema.user.id, schema.userBadge.userId))
    .where(eq(schema.userBadge.badgeId, badgeId))
    .orderBy(desc(schema.userBadge.awardedAt))
  const officerIds = [
    ...new Set(rows.map((r) => r.awardedBy).filter((v): v is string => !!v)),
  ]
  const officers = officerIds.length
    ? await db
        .select({ id: schema.user.id, name: schema.user.name })
        .from(schema.user)
        .where(inArray(schema.user.id, officerIds))
    : []
  const names = new Map(officers.map((o) => [o.id, o.name]))
  return rows.map((r) => ({
    ...r,
    awardedByName: r.awardedBy ? (names.get(r.awardedBy) ?? 'An officer') : null,
  }))
}

export type BadgeHolderRow = Awaited<ReturnType<typeof badgeHolders>>[number]

/** Members (and officers) matching a name or email, for the award picker. */
export async function searchMembers(db: Db, query: string) {
  const q = query.trim()
  const where = q
    ? and(
        inArray(schema.user.role, MEMBER_ROLES),
        or(like(schema.user.name, `%${q}%`), like(schema.user.email, `%${q}%`)),
      )
    : inArray(schema.user.role, MEMBER_ROLES)
  return db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      image: schema.user.image,
      avatarKey: schema.user.avatarKey,
    })
    .from(schema.user)
    .where(where)
    .orderBy(schema.user.name)
    .limit(8)
}

export async function awardBadgeTo(
  db: Db,
  input: { badgeId: string; userId: string; awardedBy: string },
) {
  const [badge, user] = await Promise.all([
    db.query.badge.findFirst({ where: eq(schema.badge.id, input.badgeId) }),
    db.query.user.findFirst({
      where: eq(schema.user.id, input.userId),
      columns: { id: true, role: true, name: true },
    }),
  ])
  if (!badge) throw new BadgeAdminError('That badge no longer exists.')
  if (!user || !(MEMBER_ROLES as readonly string[]).includes(user.role)) {
    throw new BadgeAdminError('Badges go to club members only.')
  }
  const result = await awardBadge(db, input)
  if (!result.created) throw new BadgeAdminError(`${user.name} already has this badge.`)
  return result
}

export async function revokeBadgeFrom(
  db: Db,
  input: { badgeId: string; userId: string },
) {
  await revokeBadge(db, input)
}
