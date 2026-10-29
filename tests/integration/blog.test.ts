import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { savePostSchema } from '#/lib/schemas/blog'
import {
  deletePost,
  getPostView,
  listAllPosts,
  listPublishedPosts,
  savePost,
  setPostPublished,
} from '#/services/blog'

const db = getDb()
const officer = { id: 'o1', role: 'officer' as const }
const member = { id: 'm1', role: 'member' as const }

const body = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  })

const input = (over: Record<string, unknown> = {}) =>
  savePostSchema.parse({
    id: null,
    title: 'Welcome to the new site',
    slug: 'welcome',
    summary: 'We rebuilt the club website from scratch.',
    tags: ['Announcement', 'announcement', 'Site News'],
    content: body('Hello from the officers.'),
    publish: 'keep',
    ...over,
  })

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'o1', name: 'Olive Officer', email: 'o1@test.local', role: 'officer' },
    { id: 'm1', name: 'Max Member', email: 'm1@test.local', role: 'member' },
  ])
})

describe('posts', () => {
  it('normalizes tags and saves new posts as drafts', async () => {
    const r = await savePost(db, officer, input())
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.publishedAt).toBeNull()
    const [row] = await listAllPosts(db)
    expect(row.tags).toEqual(['announcement', 'site-news'])
    expect(row.author?.name).toBe('Olive Officer')
  })

  it('rejects a duplicate slug with a field error', async () => {
    const r = await savePost(db, officer, input({ title: 'Another' }))
    expect(r).toEqual({ ok: false, errors: { slug: expect.stringMatching(/slug/) } })
  })

  it('hides drafts from everyone but officers', async () => {
    expect(await getPostView(db, 'welcome', null)).toBeNull()
    expect(await getPostView(db, 'welcome', member)).toBeNull()
    const preview = await getPostView(db, 'welcome', officer)
    expect(preview?.isDraft).toBe(true)
    expect(await listPublishedPosts(db)).toEqual([])
  })

  it('publishes, keeps the first publish date, and links neighbours', async () => {
    const first = await savePost(
      db,
      officer,
      input({ id: null, slug: 'first', title: 'First', publish: 'publish' }),
    )
    if (!first.ok) throw new Error('save failed')
    const firstDate = first.publishedAt
    await new Promise((r) => setTimeout(r, 5))
    const second = await savePost(
      db,
      officer,
      input({ id: null, slug: 'second', title: 'Second', publish: 'publish' }),
    )
    if (!second.ok) throw new Error('save failed')

    // Re-publishing an edit keeps the original date.
    const again = await savePost(
      db,
      officer,
      input({ id: first.id, slug: 'first', title: 'First (edited)', publish: 'publish' }),
    )
    expect(again.ok && again.publishedAt?.getTime()).toBe(firstDate?.getTime())

    const view = await getPostView(db, 'second', null)
    expect(view?.prev?.slug).toBe('first')
    expect(view?.next).toBeNull()
    expect(view?.post.minutes).toBe(1)
    const listed = await listPublishedPosts(db)
    expect(listed.map((p) => p.slug)).toEqual(['second', 'first'])

    // Editing a post can keep its own slug.
    const keep = await savePost(
      db,
      officer,
      input({ id: second.id, slug: 'second', title: 'Second', publish: 'keep' }),
    )
    expect(keep.ok).toBe(true)
  })

  it('unpublishes back to a draft and deletes', async () => {
    const [post] = (await listAllPosts(db)).filter((p) => p.slug === 'second')
    await setPostPublished(db, post.id, false)
    expect(await getPostView(db, 'second', null)).toBeNull()
    await deletePost(db, post.id)
    expect(await getPostView(db, 'second', officer)).toBeNull()
  })
})
