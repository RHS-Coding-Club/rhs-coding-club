import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import {
  awardBadgeTo,
  badgeHolders,
  deleteBadge,
  listBadgesAdmin,
  revokeBadgeFrom,
  saveBadge,
  searchMembers,
} from '#/services/badges-admin'
import type { BadgeInput } from '#/lib/schemas/badges'

const db = getDb()

const base: BadgeInput = {
  name: 'Centurion',
  description: 'Reach 100 points.',
  imageKey: null,
  rarity: 'rare',
  criteriaType: 'points',
  threshold: 100,
  autoAward: true,
  sortOrder: 1,
  isActive: true,
}

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'u_ada', name: 'Ada Lovelace', email: 'ada@test.local', role: 'member' },
    { id: 'u_bo', name: 'Bo Diddley', email: 'bo@test.local', role: 'member' },
    { id: 'u_gus', name: 'Gus Guest', email: 'gus@test.local', role: 'guest' },
    { id: 'u_off', name: 'Olive', email: 'olive@test.local', role: 'officer' },
  ])
  await db.insert(schema.pointEntry).values([
    { userId: 'u_ada', delta: 150, source: 'manual', note: 'seed' },
    { userId: 'u_bo', delta: 40, source: 'manual', note: 'seed' },
  ])
})

describe('saveBadge', () => {
  it('creates an auto-award badge and awards it to members who already qualify', async () => {
    const { id, awarded } = await saveBadge(db, base)
    expect(awarded).toBe(1)
    const holders = await badgeHolders(db, id)
    expect(holders.map((h) => h.userId)).toEqual(['u_ada'])
    expect(holders[0].awardedByName).toBeNull()
  })

  it('re-evaluates when the threshold drops on edit', async () => {
    const [badge] = await listBadgesAdmin(db)
    const { awarded } = await saveBadge(db, { ...base, id: badge.id, threshold: 30 })
    expect(awarded).toBe(1)
    const list = await listBadgesAdmin(db)
    expect(list[0]).toMatchObject({ threshold: 30, holders: 2 })
  })

  it('does not auto-award inactive or custom badges, and strips their threshold', async () => {
    const off = await saveBadge(db, {
      ...base,
      name: 'Off',
      threshold: 1,
      isActive: false,
    })
    expect(off.awarded).toBe(0)
    const custom = await saveBadge(db, {
      ...base,
      name: 'Helper',
      criteriaType: 'custom',
      threshold: 5,
      autoAward: false,
    })
    expect(custom.awarded).toBe(0)
    const row = await db.query.badge.findFirst({
      where: (t, { eq }) => eq(t.id, custom.id),
    })
    expect(row).toMatchObject({ threshold: null, autoAward: false })
  })
})

describe('manual awards', () => {
  it('awards a custom badge once, to members only, and revokes it', async () => {
    const list = await listBadgesAdmin(db)
    const helper = list.find((b) => b.name === 'Helper')
    if (!helper) throw new Error('missing badge')

    await awardBadgeTo(db, { badgeId: helper.id, userId: 'u_bo', awardedBy: 'u_off' })
    await expect(
      awardBadgeTo(db, { badgeId: helper.id, userId: 'u_bo', awardedBy: 'u_off' }),
    ).rejects.toThrow(/already has/)
    await expect(
      awardBadgeTo(db, { badgeId: helper.id, userId: 'u_gus', awardedBy: 'u_off' }),
    ).rejects.toThrow(/members only/)

    const holders = await badgeHolders(db, helper.id)
    expect(holders).toMatchObject([{ userId: 'u_bo', awardedByName: 'Olive' }])

    await revokeBadgeFrom(db, { badgeId: helper.id, userId: 'u_bo' })
    expect(await badgeHolders(db, helper.id)).toHaveLength(0)
  })

  it('searches members by name or email and leaves guests out', async () => {
    expect((await searchMembers(db, 'ada')).map((u) => u.id)).toEqual(['u_ada'])
    expect((await searchMembers(db, 'bo@test')).map((u) => u.id)).toEqual(['u_bo'])
    expect((await searchMembers(db, 'gus')).length).toBe(0)
  })

  it('deleting a badge removes its awards', async () => {
    const [first] = await listBadgesAdmin(db)
    await deleteBadge(db, first.id)
    const rows = await db.select().from(schema.userBadge)
    expect(rows.some((r) => r.badgeId === first.id)).toBe(false)
  })
})
