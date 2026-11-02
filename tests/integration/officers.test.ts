import { describe, expect, it } from 'vitest'
import { getDb } from '#/db'
import { officerSchema } from '#/lib/schemas/officers'
import {
  deleteOfficer,
  listOfficers,
  moveOfficer,
  saveOfficer,
} from '#/services/officers'

const db = getDb()

const make = (name: string) =>
  officerSchema.parse({
    name,
    title: 'Officer',
    bio: '',
    email: '',
    githubUrl: '',
    imageKey: null,
    isActive: true,
  })

describe('officers', () => {
  it('creates in order, moves, edits, and deletes', async () => {
    const a = await saveOfficer(db, make('Ana'))
    const b = await saveOfficer(db, make('Ben'))
    const c = await saveOfficer(db, make('Cam'))
    expect((await listOfficers(db)).map((o) => [o.name, o.sortOrder])).toEqual([
      ['Ana', 1],
      ['Ben', 2],
      ['Cam', 3],
    ])

    await moveOfficer(db, c.id, 'up')
    expect((await listOfficers(db)).map((o) => o.name)).toEqual(['Ana', 'Cam', 'Ben'])
    expect((await moveOfficer(db, a.id, 'up')).moved).toBe(false)

    await saveOfficer(db, { ...make('Ben B.'), id: b.id, isActive: false })
    const ben = (await listOfficers(db)).find((o) => o.id === b.id)
    expect(ben).toMatchObject({ name: 'Ben B.', isActive: false, sortOrder: 3 })

    await deleteOfficer(db, a.id)
    expect((await listOfficers(db)).map((o) => [o.name, o.sortOrder])).toEqual([
      ['Cam', 1],
      ['Ben B.', 2],
    ])
  })

  it('validates links', () => {
    const bad = officerSchema.safeParse({ ...make('X'), githubUrl: 'https://evil.com/x' })
    expect(bad.success).toBe(false)
    const email = officerSchema.safeParse({ ...make('X'), email: 'nope' })
    expect(email.success).toBe(false)
  })
})
