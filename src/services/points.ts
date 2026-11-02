import { and, desc, eq, gte, inArray, sql, sum } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { PointSource } from '#/db/schema'
import { evaluateBadges } from '#/lib/badges'
import { semesterStart } from '#/lib/dates'
import { getSetting } from './settings'

// Points are an append-only ledger (`point_entry`). Nothing stores a total:
// every score is a SUM over the ledger, optionally since a date.

const MEMBER_ROLES = ['member', 'officer', 'admin'] as const

const total = sql<number>`coalesce(${sum(schema.pointEntry.delta)}, 0)`.mapWith(Number)

/** Net points one user holds for one source row (e.g. a submission). */
async function netFor(db: Db, userId: string, source: PointSource, sourceId: string) {
  const rows = await db
    .select({ n: total })
    .from(schema.pointEntry)
    .where(
      and(
        eq(schema.pointEntry.userId, userId),
        eq(schema.pointEntry.source, source),
        eq(schema.pointEntry.sourceId, sourceId),
      ),
    )
  return rows[0]?.n ?? 0
}

/**
 * Makes the user's net points for one source row equal `amount` by appending
 * the difference (positive or negative). Idempotent: approving twice grants
 * once, and settling to 0 reverses an earlier grant without deleting history.
 * Runs the badge engine afterwards. Returns the delta written (0 if none).
 */
export async function settlePoints(
  db: Db,
  entry: {
    userId: string
    source: Exclude<PointSource, 'manual'>
    sourceId: string
    amount: number
    note?: string
    createdBy?: string | null
  },
) {
  const current = await netFor(db, entry.userId, entry.source, entry.sourceId)
  const delta = entry.amount - current
  if (delta !== 0) {
    await db.insert(schema.pointEntry).values({
      userId: entry.userId,
      delta,
      source: entry.source,
      sourceId: entry.sourceId,
      note: entry.note ?? null,
      createdBy: entry.createdBy ?? null,
    })
  }
  const awarded = await evaluateBadges(db, entry.userId)
  return { delta, awarded }
}

/** An officer's manual adjustment (bonus or correction). Always appends. */
export async function adjustPoints(
  db: Db,
  entry: { userId: string; delta: number; note: string; createdBy: string },
) {
  await db.insert(schema.pointEntry).values({ ...entry, source: 'manual' })
  const awarded = await evaluateBadges(db, entry.userId)
  return { awarded }
}

/** A user's total, all time or since `since`. */
/**
 * Where "this semester" starts for leaderboards and dashboards: the semester
 * start, or the start of a new points season if an admin began one later
 * (see the reset tool). Earlier points stay in history and all-time totals.
 */
export async function pointsWindowStart(db: Db, now = new Date()) {
  const semester = semesterStart(now)
  const { startedAt } = await getSetting(db, 'season')
  return startedAt && startedAt > semester.getTime() && startedAt <= now.getTime()
    ? new Date(startedAt)
    : semester
}

export async function pointsFor(db: Db, userId: string, since?: Date) {
  const rows = await db
    .select({ n: total })
    .from(schema.pointEntry)
    .where(
      and(
        eq(schema.pointEntry.userId, userId),
        since ? gte(schema.pointEntry.createdAt, since) : undefined,
      ),
    )
  return rows[0]?.n ?? 0
}

/**
 * Members ranked by points summed over the window (all time when `since` is
 * omitted). Guests never appear. Ties sort by name for a stable order.
 */
export async function rankMembers(db: Db, opts: { since?: Date; limit?: number } = {}) {
  const rows = await db
    .select({
      userId: schema.user.id,
      name: schema.user.name,
      image: schema.user.image,
      avatarKey: schema.user.avatarKey,
      points: total,
    })
    .from(schema.pointEntry)
    .innerJoin(schema.user, eq(schema.user.id, schema.pointEntry.userId))
    .where(
      and(
        inArray(schema.user.role, MEMBER_ROLES),
        opts.since ? gte(schema.pointEntry.createdAt, opts.since) : undefined,
      ),
    )
    .groupBy(schema.user.id)
    .having(sql`${total} > 0`)
    .orderBy(desc(total), schema.user.name)
    .limit(opts.limit ?? 500)
  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

/** The ledger for one user, newest first. */
export async function pointHistory(db: Db, userId: string, limit = 50) {
  return db
    .select({
      id: schema.pointEntry.id,
      delta: schema.pointEntry.delta,
      source: schema.pointEntry.source,
      sourceId: schema.pointEntry.sourceId,
      note: schema.pointEntry.note,
      createdAt: schema.pointEntry.createdAt,
    })
    .from(schema.pointEntry)
    .where(eq(schema.pointEntry.userId, userId))
    .orderBy(desc(schema.pointEntry.createdAt))
    .limit(limit)
}
