import { and, asc, desc, eq, gt, isNotNull, lt, ne } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import { parseRichText, readingMinutes } from '#/lib/rich-text'
import type { PostFieldErrors } from '#/lib/schemas/blog'

// Blog posts. `publishedAt` null means draft; drafts are visible to officers
// only. Content is a rich-text JSON document (see lib/rich-text).

export interface Viewer {
  id: string
  role: Role
}

const authorColumns = {
  authorId: schema.user.id,
  authorName: schema.user.name,
  authorImage: schema.user.image,
  authorAvatarKey: schema.user.avatarKey,
}

type AuthorRow = {
  authorId: string | null
  authorName: string | null
  authorImage: string | null
  authorAvatarKey: string | null
}

function authorOf(r: AuthorRow) {
  return r.authorId && r.authorName
    ? {
        id: r.authorId,
        name: r.authorName,
        image: r.authorImage,
        avatarKey: r.authorAvatarKey,
      }
    : null
}

/** Published posts, newest first, with reading time instead of the body. */
export async function listPublishedPosts(db: Db, limit = 200) {
  const rows = await db
    .select({
      id: schema.post.id,
      title: schema.post.title,
      slug: schema.post.slug,
      summary: schema.post.summary,
      tags: schema.post.tags,
      content: schema.post.content,
      publishedAt: schema.post.publishedAt,
      ...authorColumns,
    })
    .from(schema.post)
    .leftJoin(schema.user, eq(schema.user.id, schema.post.authorId))
    .where(isNotNull(schema.post.publishedAt))
    .orderBy(desc(schema.post.publishedAt))
    .limit(limit)
  return rows.map(({ content, ...r }) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    tags: r.tags,
    publishedAt: r.publishedAt as Date,
    minutes: readingMinutes(parseRichText(content)),
    author: authorOf(r),
  }))
}

export type PostListItem = Awaited<ReturnType<typeof listPublishedPosts>>[number]

/**
 * A post for its page, with the neighbouring published posts. Drafts come
 * back only for officers (who see a preview banner); everyone else gets null.
 */
export async function getPostView(db: Db, slug: string, viewer: Viewer | null) {
  const rows = await db
    .select({ post: schema.post, ...authorColumns })
    .from(schema.post)
    .leftJoin(schema.user, eq(schema.user.id, schema.post.authorId))
    .where(eq(schema.post.slug, slug))
    .limit(1)
  const row = rows.at(0)
  if (!row) return null
  const { post } = row
  const isDraft = post.publishedAt === null
  if (isDraft && !hasRole(viewer?.role, 'officer')) return null

  const neighbour = { title: schema.post.title, slug: schema.post.slug }
  const [prev, next] = post.publishedAt
    ? await Promise.all([
        db
          .select(neighbour)
          .from(schema.post)
          .where(
            and(
              isNotNull(schema.post.publishedAt),
              lt(schema.post.publishedAt, post.publishedAt),
            ),
          )
          .orderBy(desc(schema.post.publishedAt))
          .limit(1),
        db
          .select(neighbour)
          .from(schema.post)
          .where(
            and(
              isNotNull(schema.post.publishedAt),
              gt(schema.post.publishedAt, post.publishedAt),
            ),
          )
          .orderBy(asc(schema.post.publishedAt))
          .limit(1),
      ])
    : [[], []]

  return {
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      tags: post.tags,
      content: post.content,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      minutes: readingMinutes(parseRichText(post.content)),
    },
    author: authorOf(row),
    isDraft,
    /** Older post. */
    prev: prev.at(0) ?? null,
    /** Newer post. */
    next: next.at(0) ?? null,
  }
}

export type PostView = NonNullable<Awaited<ReturnType<typeof getPostView>>>

// ---------- Officer editing ----------

/** Every post for the admin table: drafts first, then newest. */
export async function listAllPosts(db: Db) {
  const rows = await db
    .select({
      id: schema.post.id,
      title: schema.post.title,
      slug: schema.post.slug,
      tags: schema.post.tags,
      publishedAt: schema.post.publishedAt,
      updatedAt: schema.post.updatedAt,
      createdAt: schema.post.createdAt,
      ...authorColumns,
    })
    .from(schema.post)
    .leftJoin(schema.user, eq(schema.user.id, schema.post.authorId))
    .orderBy(desc(schema.post.updatedAt))
  return rows
    .map(({ authorId, authorName, authorImage, authorAvatarKey, ...r }) => ({
      ...r,
      author: authorOf({ authorId, authorName, authorImage, authorAvatarKey }),
    }))
    .sort((a, b) => Number(a.publishedAt !== null) - Number(b.publishedAt !== null))
}

export type AdminPost = Awaited<ReturnType<typeof listAllPosts>>[number]

export async function getPostForEdit(db: Db, id: string) {
  const post = await db.query.post.findFirst({ where: eq(schema.post.id, id) })
  return post ?? null
}

export async function slugTaken(db: Db, slug: string, exceptId?: string | null) {
  const row = await db.query.post.findFirst({
    where: and(
      eq(schema.post.slug, slug),
      exceptId ? ne(schema.post.id, exceptId) : undefined,
    ),
    columns: { id: true },
  })
  return Boolean(row)
}

const SLUG_TAKEN = 'Another post already uses this slug. Pick a different one.'

export type SavePostResult =
  | { ok: true; id: string; slug: string; publishedAt: Date | null }
  | { ok: false; errors: PostFieldErrors }

/**
 * Creates or updates a post. `publish` decides the published state: keep it,
 * publish now (an already-published post keeps its original date), or move
 * back to draft. Slug clashes come back as a field error, not a throw.
 */
export async function savePost(
  db: Db,
  user: Viewer,
  input: {
    id: string | null
    title: string
    slug: string
    summary: string
    tags: string[]
    content: string
    publish: 'keep' | 'publish' | 'unpublish'
  },
): Promise<SavePostResult> {
  if (await slugTaken(db, input.slug, input.id)) {
    return { ok: false, errors: { slug: SLUG_TAKEN } }
  }
  const existing = input.id
    ? await db.query.post.findFirst({
        where: eq(schema.post.id, input.id),
        columns: { id: true, publishedAt: true },
      })
    : null
  if (input.id && !existing) throw new Error('That post no longer exists.')

  const current = existing?.publishedAt ?? null
  const publishedAt =
    input.publish === 'publish'
      ? (current ?? new Date())
      : input.publish === 'unpublish'
        ? null
        : current

  const values = {
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    tags: input.tags,
    content: input.content,
    publishedAt,
  }
  try {
    if (existing) {
      await db.update(schema.post).set(values).where(eq(schema.post.id, existing.id))
      return { ok: true, id: existing.id, slug: input.slug, publishedAt }
    }
    const [row] = await db
      .insert(schema.post)
      .values({ ...values, authorId: user.id })
      .returning({ id: schema.post.id })
    return { ok: true, id: row.id, slug: input.slug, publishedAt }
  } catch (err) {
    // Two editors racing for the same slug: the unique index catches it.
    if (String(err).includes('UNIQUE')) return { ok: false, errors: { slug: SLUG_TAKEN } }
    throw err
  }
}

export async function setPostPublished(db: Db, id: string, published: boolean) {
  const post = await db.query.post.findFirst({
    where: eq(schema.post.id, id),
    columns: { id: true, publishedAt: true },
  })
  if (!post) throw new Error('That post no longer exists.')
  const publishedAt = published ? (post.publishedAt ?? new Date()) : null
  await db.update(schema.post).set({ publishedAt }).where(eq(schema.post.id, id))
  return { publishedAt }
}

export async function deletePost(db: Db, id: string) {
  await db.delete(schema.post).where(eq(schema.post.id, id))
  return { ok: true as const }
}
