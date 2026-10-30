import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import {
  listResourcesAdmin,
  listResourcesFor,
  saveResource,
  setResourceApproved,
  suggestResource,
  toggleBookmark,
} from '#/services/resources'

const db = getDb()

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'u_ada', name: 'Ada', email: 'ada@test.local', role: 'member' },
    { id: 'u_bo', name: 'Bo', email: 'bo@test.local', role: 'member' },
    { id: 'u_off', name: 'Olive', email: 'olive@test.local', role: 'officer' },
  ])
  await db.insert(schema.resource).values([
    {
      id: 'r_py',
      title: 'Python for Everybody',
      description: 'A gentle intro course.',
      url: 'https://www.py4e.com',
      tags: ['python'],
      level: 'beginner',
      approved: true,
      addedBy: 'u_off',
    },
    {
      id: 'r_hidden',
      title: 'Unreviewed link',
      description: 'Somebody else suggested this.',
      url: 'https://example.com',
      tags: [],
      level: 'advanced',
      approved: false,
      addedBy: 'u_bo',
    },
  ])
})

describe('bookmarks', () => {
  it('toggles a save on and off, one row per user and resource', async () => {
    expect(await toggleBookmark(db, 'u_ada', 'r_py')).toEqual({ saved: true })
    let list = await listResourcesFor(db, 'u_ada')
    expect(list.find((r) => r.id === 'r_py')?.saved).toBe(true)
    const rows = await db.select().from(schema.resourceBookmark)
    expect(rows).toHaveLength(1)

    expect(await toggleBookmark(db, 'u_ada', 'r_py')).toEqual({ saved: false })
    list = await listResourcesFor(db, 'u_ada')
    expect(list.find((r) => r.id === 'r_py')?.saved).toBe(false)
  })

  it("refuses to bookmark someone else's unapproved suggestion", async () => {
    await expect(toggleBookmark(db, 'u_ada', 'r_hidden')).rejects.toThrow(/not available/)
  })
})

describe('suggestions', () => {
  it('stay hidden from everyone but the suggester until approved', async () => {
    const { id } = await suggestResource(db, 'u_ada', {
      title: 'Exercism',
      description: 'Practice problems with mentor feedback.',
      url: 'https://exercism.org',
      level: 'intermediate',
      tags: ['practice'],
    })

    const anon = await listResourcesFor(db, null)
    expect(anon.map((r) => r.id)).toEqual(['r_py'])

    const other = await listResourcesFor(db, 'u_bo')
    expect(other.map((r) => r.id).sort()).toEqual(['r_hidden', 'r_py'])
    expect(other.some((r) => r.id === id)).toBe(false)

    const mine = await listResourcesFor(db, 'u_ada')
    const pending = mine.find((r) => r.id === id)
    expect(pending).toMatchObject({ approved: false, mine: true })

    await setResourceApproved(db, id, true)
    const after = await listResourcesFor(db, null)
    expect(after.map((r) => r.id)).toContain(id)
  })

  it('officers see everything with suggester names and save counts', async () => {
    await toggleBookmark(db, 'u_bo', 'r_py')
    const rows = await listResourcesAdmin(db)
    expect(rows.find((r) => r.id === 'r_hidden')).toMatchObject({
      approved: false,
      addedByName: 'Bo',
    })
    expect(rows.find((r) => r.id === 'r_py')?.saves).toBe(1)
    // Unapproved first, so the queue sits at the top.
    expect(rows[0].approved).toBe(false)
  })

  it('officer edits update in place', async () => {
    await saveResource(db, 'u_off', {
      id: 'r_py',
      title: 'Python for Everybody (PY4E)',
      description: 'A gentle intro course.',
      url: 'https://www.py4e.com',
      level: 'beginner',
      tags: ['python', 'course'],
      approved: true,
    })
    const row = await db.query.resource.findFirst({
      where: (t, { eq }) => eq(t.id, 'r_py'),
    })
    expect(row?.title).toBe('Python for Everybody (PY4E)')
    expect(row?.tags).toEqual(['python', 'course'])
  })
})
