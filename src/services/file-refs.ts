import { inArray, or, sql } from 'drizzle-orm'
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import type { Db } from '#/db'
import { schema } from '#/db'

/**
 * Which of `keys` nothing in the database points at any more, so they're
 * safe to delete from R2. Checks every column that stores a key, plus
 * images embedded in rich text (`/files/<key>` inside posts, challenge
 * prompts, and newsletter issues). Run it after the rows are gone.
 */
export async function unreferencedKeys(db: Db, keys: string[]): Promise<string[]> {
  const wanted = [...new Set(keys)]
  if (wanted.length === 0) return []
  const t = schema
  const mentions = (col: AnySQLiteColumn) =>
    or(...wanted.map((k) => sql`instr(${col}, ${`/files/${k}`}) > 0`))

  const [avatars, covers, officers, badges, projects, posts, prompts, issues] =
    await Promise.all([
      db
        .select({ k: t.user.avatarKey })
        .from(t.user)
        .where(inArray(t.user.avatarKey, wanted)),
      db
        .select({ k: t.event.coverKey })
        .from(t.event)
        .where(inArray(t.event.coverKey, wanted)),
      db
        .select({ k: t.officer.imageKey })
        .from(t.officer)
        .where(inArray(t.officer.imageKey, wanted)),
      db
        .select({ k: t.badge.imageKey })
        .from(t.badge)
        .where(inArray(t.badge.imageKey, wanted)),
      db
        .select({ k: t.project.imageKeys })
        .from(t.project)
        .where(
          or(...wanted.map((k) => sql`instr(${t.project.imageKeys}, ${`"${k}"`}) > 0`)),
        ),
      db.select({ c: t.post.content }).from(t.post).where(mentions(t.post.content)),
      db
        .select({ c: t.challenge.prompt })
        .from(t.challenge)
        .where(mentions(t.challenge.prompt)),
      db
        .select({ c: t.newsletterIssue.content })
        .from(t.newsletterIssue)
        .where(mentions(t.newsletterIssue.content)),
    ])

  const used = new Set<string>()
  for (const r of [...avatars, ...covers, ...officers, ...badges]) if (r.k) used.add(r.k)
  for (const r of projects) for (const k of r.k) used.add(k)
  for (const r of [...posts, ...prompts, ...issues])
    for (const k of wanted) if (r.c.includes(`/files/${k}`)) used.add(k)
  return wanted.filter((k) => !used.has(k))
}
