import { asc, eq, max } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { z } from 'zod'
import type { officerSchema } from '#/lib/schemas/officers'

// Officer profiles for /about. Not linked to user accounts: an officer card
// is just a name, title, bio, and photo that admins curate. `sortOrder` is
// kept dense (1..n) so moving a card up or down is a swap.

export class OfficerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OfficerError'
  }
}

type OfficerData = z.output<typeof officerSchema>

const o = schema.officer

export async function listOfficers(db: Db) {
  return db.select().from(o).orderBy(asc(o.sortOrder), asc(o.name))
}

export type OfficerRow = Awaited<ReturnType<typeof listOfficers>>[number]

export async function saveOfficer(db: Db, input: OfficerData) {
  const values = {
    name: input.name,
    title: input.title,
    bio: input.bio,
    email: input.email,
    githubUrl: input.githubUrl,
    imageKey: input.imageKey,
    isActive: input.isActive,
  }
  if (input.id) {
    const row = await db
      .update(o)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(o.id, input.id))
      .returning({ id: o.id })
      .then((rows) => rows.at(0))
    if (!row) throw new OfficerError('That officer no longer exists.')
    return row
  }
  const last = await db
    .select({ n: max(o.sortOrder) })
    .from(o)
    .then((rows) => rows.at(0))
  const row = await db
    .insert(o)
    .values({ ...values, sortOrder: (last?.n ?? 0) + 1 })
    .returning({ id: o.id })
    .then((rows) => rows.at(0))
  if (!row) throw new OfficerError('Could not save the officer. Try again.')
  return row
}

export async function deleteOfficer(db: Db, id: string) {
  await db.delete(o).where(eq(o.id, id))
  await renumber(db)
}

/** Swaps an officer with its neighbor. No-op at either end. */
export async function moveOfficer(db: Db, id: string, direction: 'up' | 'down') {
  const rows = await listOfficers(db)
  const i = rows.findIndex((r) => r.id === id)
  if (i === -1) throw new OfficerError('That officer no longer exists.')
  const j = direction === 'up' ? i - 1 : i + 1
  if (j < 0 || j >= rows.length) return { moved: false }
  const order = rows.map((r) => r.id)
  ;[order[i], order[j]] = [order[j], order[i]]
  await writeOrder(db, rows, order)
  return { moved: true }
}

async function renumber(db: Db) {
  const rows = await listOfficers(db)
  await writeOrder(
    db,
    rows,
    rows.map((r) => r.id),
  )
}

async function writeOrder(db: Db, rows: OfficerRow[], order: string[]) {
  const current = new Map(rows.map((r) => [r.id, r.sortOrder]))
  const updates = order
    .map((officerId, index) => ({ officerId, sortOrder: index + 1 }))
    .filter((u) => current.get(u.officerId) !== u.sortOrder)
  for (const u of updates) {
    await db.update(o).set({ sortOrder: u.sortOrder }).where(eq(o.id, u.officerId))
  }
}
