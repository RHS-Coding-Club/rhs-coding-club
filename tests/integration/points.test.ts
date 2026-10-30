import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { adjustPoints, pointsFor, rankMembers, settlePoints } from '#/services/points'

const db = getDb()

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'u1', name: 'Ada', email: 'ada@test.local', role: 'member' },
    { id: 'u2', name: 'Bo', email: 'bo@test.local', role: 'member' },
    { id: 'u3', name: 'Gus', email: 'gus@test.local', role: 'guest' },
  ])
  await db.insert(schema.badge).values([
    {
      id: 'b100',
      name: 'Centurion',
      description: '',
      rarity: 'rare',
      criteriaType: 'points',
      threshold: 100,
      autoAward: true,
    },
  ])
})

describe('settlePoints', () => {
  it('grants once, reverses to zero, and re-grants', async () => {
    const first = await settlePoints(db, {
      userId: 'u1',
      source: 'submission',
      sourceId: 's1',
      amount: 50,
    })
    expect(first.delta).toBe(50)
    const again = await settlePoints(db, {
      userId: 'u1',
      source: 'submission',
      sourceId: 's1',
      amount: 50,
    })
    expect(again.delta).toBe(0)
    const reverse = await settlePoints(db, {
      userId: 'u1',
      source: 'submission',
      sourceId: 's1',
      amount: 0,
    })
    expect(reverse.delta).toBe(-50)
    expect(await pointsFor(db, 'u1')).toBe(0)
    const ledger = await db.select().from(schema.pointEntry)
    expect(ledger).toHaveLength(2)
  })

  it('awards a points badge when the threshold is crossed', async () => {
    const r = await settlePoints(db, {
      userId: 'u2',
      source: 'submission',
      sourceId: 's2',
      amount: 120,
    })
    expect(r.awarded.map((b) => b.id)).toEqual(['b100'])
    const again = await adjustPoints(db, {
      userId: 'u2',
      delta: 5,
      note: 'bonus',
      createdBy: 'u1',
    })
    expect(again.awarded).toEqual([])
  })
})

describe('rankMembers', () => {
  it('ranks members by summed points and hides guests', async () => {
    await adjustPoints(db, { userId: 'u3', delta: 999, note: 'x', createdBy: 'u1' })
    const rows = await rankMembers(db)
    expect(rows.map((r) => [r.userId, r.points, r.rank])).toEqual([['u2', 125, 1]])
  })
})
