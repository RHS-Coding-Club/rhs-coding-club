import { and, count, desc, eq, or, sql } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { SaveResourceInput, SuggestResourceInput } from '#/lib/schemas/resources'

// Learning resources. Visitors see approved rows; a signed-in member also sees
// their own suggestions (marked pending) until an officer approves them.

export class ResourceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResourceError'
  }
}

/** Beginner first, then intermediate, then advanced. */
const levelOrder = sql`CASE ${schema.resource.level} WHEN 'beginner' THEN 0 WHEN 'intermediate' THEN 1 ELSE 2 END`

const publicColumns = {
  id: schema.resource.id,
  title: schema.resource.title,
  description: schema.resource.description,
  url: schema.resource.url,
  tags: schema.resource.tags,
  level: schema.resource.level,
  approved: schema.resource.approved,
  addedBy: schema.resource.addedBy,
  createdAt: schema.resource.createdAt,
}

/** The /resources list for a visitor (`userId` null) or a signed-in user. */
export async function listResourcesFor(db: Db, userId: string | null) {
  const visible = userId
    ? or(eq(schema.resource.approved, true), eq(schema.resource.addedBy, userId))
    : eq(schema.resource.approved, true)
  const [rows, saved] = await Promise.all([
    db
      .select(publicColumns)
      .from(schema.resource)
      .where(visible)
      .orderBy(levelOrder, desc(schema.resource.createdAt)),
    userId
      ? db
          .select({ resourceId: schema.resourceBookmark.resourceId })
          .from(schema.resourceBookmark)
          .where(eq(schema.resourceBookmark.userId, userId))
      : Promise.resolve([]),
  ])
  const savedIds = new Set(saved.map((s) => s.resourceId))
  return rows.map(({ addedBy, ...r }) => ({
    ...r,
    mine: userId !== null && addedBy === userId,
    saved: savedIds.has(r.id),
  }))
}

export type ResourceRow = Awaited<ReturnType<typeof listResourcesFor>>[number]

/** Saves or un-saves a resource the user can see. Returns the new state. */
export async function toggleBookmark(db: Db, userId: string, resourceId: string) {
  const target = await db.query.resource.findFirst({
    where: eq(schema.resource.id, resourceId),
    columns: { id: true, approved: true, addedBy: true },
  })
  if (!target || (!target.approved && target.addedBy !== userId)) {
    throw new ResourceError('That resource is not available.')
  }
  const inserted = await db
    .insert(schema.resourceBookmark)
    .values({ userId, resourceId })
    .onConflictDoNothing()
    .returning({ id: schema.resourceBookmark.id })
  if (inserted.length > 0) return { saved: true }
  await db
    .delete(schema.resourceBookmark)
    .where(
      and(
        eq(schema.resourceBookmark.userId, userId),
        eq(schema.resourceBookmark.resourceId, resourceId),
      ),
    )
  return { saved: false }
}

/** A member suggests a link. It stays hidden from everyone else until approved. */
export async function suggestResource(
  db: Db,
  userId: string,
  input: SuggestResourceInput,
) {
  const pendingCount = await db
    .select({ n: count() })
    .from(schema.resource)
    .where(and(eq(schema.resource.addedBy, userId), eq(schema.resource.approved, false)))
  if ((pendingCount[0]?.n ?? 0) >= 10) {
    throw new ResourceError(
      'You have 10 suggestions waiting already. Give the officers a moment to review them.',
    )
  }
  const row = await db
    .insert(schema.resource)
    .values({ ...input, approved: false, addedBy: userId })
    .returning({ id: schema.resource.id })
    .then((rows) => rows.at(0))
  if (!row) throw new ResourceError('Could not save that. Try again.')
  return row
}

// ---------- officer tools ----------

export async function listResourcesAdmin(db: Db) {
  const [rows, counts] = await Promise.all([
    db
      .select({
        ...publicColumns,
        updatedAt: schema.resource.updatedAt,
        addedByName: schema.user.name,
      })
      .from(schema.resource)
      .leftJoin(schema.user, eq(schema.user.id, schema.resource.addedBy))
      .orderBy(schema.resource.approved, desc(schema.resource.createdAt)),
    db
      .select({ resourceId: schema.resourceBookmark.resourceId, n: count() })
      .from(schema.resourceBookmark)
      .groupBy(schema.resourceBookmark.resourceId),
  ])
  const saves = new Map(counts.map((c) => [c.resourceId, c.n]))
  return rows.map((r) => ({ ...r, saves: saves.get(r.id) ?? 0 }))
}

export type AdminResourceRow = Awaited<ReturnType<typeof listResourcesAdmin>>[number]

export async function saveResource(db: Db, userId: string, input: SaveResourceInput) {
  const { id, ...values } = input
  if (id) {
    const row = await db
      .update(schema.resource)
      .set(values)
      .where(eq(schema.resource.id, id))
      .returning({ id: schema.resource.id })
      .then((rows) => rows.at(0))
    if (!row) throw new ResourceError('That resource no longer exists.')
    return row
  }
  const row = await db
    .insert(schema.resource)
    .values({ ...values, addedBy: userId })
    .returning({ id: schema.resource.id })
    .then((rows) => rows.at(0))
  if (!row) throw new ResourceError('Could not save that. Try again.')
  return row
}

export async function setResourceApproved(db: Db, id: string, approved: boolean) {
  const row = await db
    .update(schema.resource)
    .set({ approved })
    .where(eq(schema.resource.id, id))
    .returning({ id: schema.resource.id })
    .then((rows) => rows.at(0))
  if (!row) throw new ResourceError('That resource no longer exists.')
  return row
}

export async function deleteResource(db: Db, id: string) {
  await db.delete(schema.resource).where(eq(schema.resource.id, id))
}
