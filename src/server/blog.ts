import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import { postIdSchema, postSlugSchema, savePostSchema } from '#/lib/schemas/blog'
import { z } from 'zod'
import { getSessionUser, requireOfficer } from '#/server/auth'
import {
  deletePost as deletePostRow,
  getPostForEdit,
  getPostView,
  listAllPosts,
  listPublishedPosts,
  savePost as savePostRow,
  setPostPublished,
} from '#/services/blog'

/** Public: published posts, newest first. */
export const listPosts = createServerFn({ method: 'GET' }).handler(() =>
  listPublishedPosts(getDb()),
)

/** Public for published posts; drafts only for officers. Null = 404. */
export const getPost = createServerFn({ method: 'GET' })
  .validator(postSlugSchema)
  .handler(async ({ data }) => {
    const viewer = await getSessionUser()
    return getPostView(getDb(), data.slug, viewer)
  })

// ---------- Officers ----------

export const listPostsForAdmin = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => listAllPosts(getDb()))

export const getPostForEditor = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(postIdSchema)
  .handler(({ data }) => getPostForEdit(getDb(), data.id))

export const savePost = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(savePostSchema)
  .handler(({ data, context }) => savePostRow(getDb(), context.user, data))

export const publishPost = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(postIdSchema.extend({ published: z.boolean() }))
  .handler(({ data }) => setPostPublished(getDb(), data.id, data.published))

export const deletePost = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(postIdSchema)
  .handler(({ data }) => deletePostRow(getDb(), data.id))
