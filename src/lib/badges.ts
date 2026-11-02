import { and, count, eq, inArray, sql, sum } from 'drizzle-orm'
import type { Db } from '#/db'
import * as schema from '#/db/schema'
import type { BadgeCriteria } from '#/db/schema'

// The badge engine. Server-only (takes a Db). Every badge a user holds comes
// through here: `evaluateBadges` after a points change, attendance mark, or
// project approval, and `awardBadge` for officers handing out custom badges.
// Nothing else inserts into `user_badge`.

export type BadgeStats = Record<Exclude<BadgeCriteria, 'custom'>, number>

/** The numbers auto-award thresholds are compared against. All time. */
export async function badgeStats(db: Db, userId: string): Promise<BadgeStats> {
  const [points, challenges, events, projects] = await Promise.all([
    db
      .select({
        n: sql<number>`coalesce(${sum(schema.pointEntry.delta)}, 0)`.mapWith(Number),
      })
      .from(schema.pointEntry)
      .where(eq(schema.pointEntry.userId, userId)),
    db
      .select({ n: count() })
      .from(schema.submission)
      .where(
        and(eq(schema.submission.userId, userId), eq(schema.submission.status, 'pass')),
      ),
    db
      .select({ n: count() })
      .from(schema.attendance)
      .where(eq(schema.attendance.userId, userId)),
    db
      .select({ n: count() })
      .from(schema.projectMember)
      .innerJoin(schema.project, eq(schema.project.id, schema.projectMember.projectId))
      .where(
        and(
          eq(schema.projectMember.userId, userId),
          eq(schema.project.status, 'approved'),
        ),
      ),
  ])
  return {
    points: points[0]?.n ?? 0,
    challenges: challenges[0]?.n ?? 0,
    events: events[0]?.n ?? 0,
    projects: projects[0]?.n ?? 0,
  }
}

/** Pure: which of `badges` the stats qualify for. Exported for unit tests. */
export function qualifyingBadges<
  T extends {
    id: string
    criteriaType: BadgeCriteria
    threshold: number | null
    autoAward: boolean
    isActive: boolean
  },
>(badges: T[], stats: BadgeStats): T[] {
  return badges.filter(
    (b) =>
      b.isActive &&
      b.autoAward &&
      b.criteriaType !== 'custom' &&
      b.threshold !== null &&
      stats[b.criteriaType] >= b.threshold,
  )
}

/**
 * Awards every active auto-award badge the user now qualifies for and does not
 * hold yet. Badges are never revoked automatically (a later point reversal
 * keeps what was earned). Returns the newly awarded badges.
 */
export async function evaluateBadges(db: Db, userId: string) {
  const [stats, candidates, held] = await Promise.all([
    badgeStats(db, userId),
    db.query.badge.findMany({
      where: and(eq(schema.badge.isActive, true), eq(schema.badge.autoAward, true)),
    }),
    db
      .select({ badgeId: schema.userBadge.badgeId })
      .from(schema.userBadge)
      .where(eq(schema.userBadge.userId, userId)),
  ])
  const owned = new Set(held.map((h) => h.badgeId))
  const earned = qualifyingBadges(candidates, stats).filter((b) => !owned.has(b.id))
  if (earned.length === 0) return []

  const inserted = await db
    .insert(schema.userBadge)
    .values(earned.map((b) => ({ userId, badgeId: b.id })))
    .onConflictDoNothing()
    .returning({ badgeId: schema.userBadge.badgeId })
  const ids = new Set(inserted.map((r) => r.badgeId))
  return earned
    .filter((b) => ids.has(b.id))
    .map((b) => ({ id: b.id, name: b.name, rarity: b.rarity }))
}

/** Re-runs the engine for many users, e.g. after a badge's threshold changes. */
export async function evaluateBadgesFor(db: Db, userIds: string[]) {
  for (const id of new Set(userIds)) await evaluateBadges(db, id)
}

/** Every user with a ledger entry (attendance and approved projects always add one). */
export async function badgeCandidates(db: Db) {
  const rows = await db
    .selectDistinct({ userId: schema.pointEntry.userId })
    .from(schema.pointEntry)
  return rows.map((r) => r.userId)
}

/** An officer hands a badge to a user (custom badges, or a manual override). */
export async function awardBadge(
  db: Db,
  input: { userId: string; badgeId: string; awardedBy: string },
) {
  const inserted = await db
    .insert(schema.userBadge)
    .values(input)
    .onConflictDoNothing()
    .returning({ id: schema.userBadge.id })
  return { created: inserted.length > 0 }
}

/** Takes a badge back (officer action only). */
export async function revokeBadge(db: Db, input: { userId: string; badgeId: string }) {
  await db
    .delete(schema.userBadge)
    .where(
      and(
        eq(schema.userBadge.userId, input.userId),
        eq(schema.userBadge.badgeId, input.badgeId),
      ),
    )
}

/** Badges held by a set of users, for profile and leaderboard rows. */
export async function badgesForUsers(db: Db, userIds: string[]) {
  if (userIds.length === 0) return []
  return db
    .select({
      userId: schema.userBadge.userId,
      badgeId: schema.badge.id,
      name: schema.badge.name,
      description: schema.badge.description,
      rarity: schema.badge.rarity,
      imageKey: schema.badge.imageKey,
      awardedAt: schema.userBadge.awardedAt,
    })
    .from(schema.userBadge)
    .innerJoin(schema.badge, eq(schema.badge.id, schema.userBadge.badgeId))
    .where(
      and(inArray(schema.userBadge.userId, userIds), eq(schema.badge.isActive, true)),
    )
    .orderBy(schema.badge.sortOrder, schema.badge.name)
}
