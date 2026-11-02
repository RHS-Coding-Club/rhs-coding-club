import { beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import {
  adjustMemberPoints,
  changeRole,
  getUserDetail,
  listUsers,
} from '#/services/members'
import { pointsFor } from '#/services/points'

const db = getDb()
const roleOf = async (id: string) =>
  (await db.query.user.findFirst({ where: eq(schema.user.id, id) }))?.role

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'a1', name: 'Ada Admin', email: 'ada@test.local', role: 'admin' },
    { id: 'o1', name: 'Olive Officer', email: 'olive@test.local', role: 'officer' },
    { id: 'm1', name: 'Max Member', email: 'max@test.local', role: 'member' },
    { id: 'g1', name: 'Gus Guest', email: 'gus@example.com', role: 'guest' },
  ])
  await db.insert(schema.membershipApplication).values({
    id: 'app1',
    userId: 'g1',
    grade: '9',
    experience: 'none',
    goals: 'g',
    whyJoin: 'w',
    availability: 'Lunch meetings',
  })
})

describe('listUsers', () => {
  it('filters by role and searches name or email', async () => {
    expect((await listUsers(db, { q: '', role: 'guest' })).map((u) => u.id)).toEqual([
      'g1',
    ])
    expect((await listUsers(db, { q: 'EXAMPLE', role: 'all' })).map((u) => u.id)).toEqual(
      ['g1'],
    )
    expect((await listUsers(db, { q: 'olive', role: 'all' })).map((u) => u.id)).toEqual([
      'o1',
    ])
    // LIKE wildcards in the query are literal.
    expect(await listUsers(db, { q: '%', role: 'all' })).toEqual([])
  })
})

describe('changeRole', () => {
  it('blocks admins from changing their own role', async () => {
    await expect(
      changeRole(db, { actorId: 'a1', userId: 'a1', role: 'member' }),
    ).rejects.toThrow(/your own role/)
    expect(await roleOf('a1')).toBe('admin')
  })

  it('never removes the last admin', async () => {
    // Another admin trying to demote the only admin: still the only one after.
    await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.id, 'o1'))
    await changeRole(db, { actorId: 'a1', userId: 'o1', role: 'officer' })
    await db.insert(schema.user).values({
      id: 'x1',
      name: 'Rogue',
      email: 'rogue@test.local',
      role: 'admin',
    })
    // Two admins: demoting one is fine.
    await changeRole(db, { actorId: 'a1', userId: 'x1', role: 'member' })
    expect(await roleOf('x1')).toBe('member')
    // Now a1 is the only admin; nobody (not even via another account) can demote it.
    await expect(
      changeRole(db, { actorId: 'x1', userId: 'a1', role: 'member' }),
    ).rejects.toThrow(/only admin/)
  })

  it('promoting a guest approves their pending application', async () => {
    await changeRole(db, { actorId: 'a1', userId: 'g1', role: 'member' })
    expect(await roleOf('g1')).toBe('member')
    const app = await db.query.membershipApplication.findFirst({
      where: eq(schema.membershipApplication.id, 'app1'),
    })
    expect(app?.status).toBe('approved')
    expect(app?.reviewedBy).toBe('a1')
  })
})

describe('adjustMemberPoints', () => {
  it('appends a manual ledger row with the note', async () => {
    await adjustMemberPoints(db, {
      userId: 'm1',
      delta: 40,
      note: 'Helped run RAP',
      createdBy: 'a1',
    })
    await adjustMemberPoints(db, {
      userId: 'm1',
      delta: -15,
      note: 'Typo fix',
      createdBy: 'a1',
    })
    expect(await pointsFor(db, 'm1')).toBe(25)
    const detail = await getUserDetail(db, 'm1')
    expect(detail?.ledger.map((e) => [e.delta, e.note])).toEqual(
      expect.arrayContaining([
        [40, 'Helped run RAP'],
        [-15, 'Typo fix'],
      ]),
    )
    expect(detail?.points.allTime).toBe(25)
    const listed = await listUsers(db, { q: 'max', role: 'all' })
    expect(listed.map((u) => [u.id, u.points])).toEqual([['m1', 25]])
  })

  it('rejects unknown users', async () => {
    await expect(
      adjustMemberPoints(db, { userId: 'nope', delta: 5, note: 'x', createdBy: 'a1' }),
    ).rejects.toThrow(/no longer exists/)
  })
})
