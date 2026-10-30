import { beforeEach, describe, expect, it } from 'vitest'
import { count, eq, sql } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { getDb, schema } from '#/db'
import { RESET_PRESETS } from '#/lib/schemas/reset'
import { exportBackup, resetCounts, runReset } from '#/services/reset'
import { getLeaderboard } from '#/services/members'
import { pointsWindowStart } from '#/services/points'
import { getSetting } from '#/services/settings'

const db = getDb()
// Mid-October: the fall semester started Aug 1.
const now = new Date(2026, 9, 15, 12, 0, 0)
const day = 24 * 60 * 60 * 1000
const ago = (n: number) => new Date(now.getTime() - n * day)
const rows = async (table: SQLiteTable) =>
  (await db.select({ n: count() }).from(table))[0]?.n ?? 0

const ACTOR = 'admin1'

// Every test starts from the same small club: two admins (one is "you"),
// an officer, two members, a guest, sample (seeded) rows, and real rows.
beforeEach(async () => {
  for (const table of [
    schema.attendance,
    schema.rsvp,
    schema.submission,
    schema.pointEntry,
    schema.userBadge,
    schema.projectMember,
    schema.project,
    schema.challenge,
    schema.event,
    schema.post,
    schema.officer,
    schema.badge,
    schema.membershipApplication,
    schema.contactMessage,
    schema.setting,
    schema.user,
  ])
    await db.delete(table)

  await db.insert(schema.user).values([
    { id: ACTOR, name: 'You', email: 'you@club.org', role: 'admin' },
    { id: 'admin2', name: 'Other admin', email: 'other@club.org', role: 'admin' },
    { id: 'off1', name: 'Olive', email: 'olive@club.org', role: 'officer' },
    { id: 'mem1', name: 'Max', email: 'max@club.org', role: 'member' },
    { id: 'mem2', name: 'Mia', email: 'mia@club.org', role: 'member' },
    { id: 'gst1', name: 'Gus', email: 'gus@club.org', role: 'guest' },
    { id: 'u_seed_m1', name: 'Priya', email: 'priya@test.local', role: 'member' },
  ])
  await db.insert(schema.challenge).values([
    {
      id: 'c_real',
      title: 'Real',
      description: '',
      prompt: '{}',
      difficulty: 'easy',
      points: 50,
      weekNo: 1,
      publishedAt: ago(30),
    },
    {
      id: 'c_seed_1',
      title: 'Sample',
      description: '',
      prompt: '{}',
      difficulty: 'easy',
      points: 50,
      weekNo: 2,
      publishedAt: ago(30),
    },
  ])
  await db.insert(schema.submission).values([
    {
      id: 's_real',
      challengeId: 'c_real',
      userId: 'mem1',
      language: 'Python',
      platform: 'GitHub',
      url: 'https://x.dev',
      status: 'pass',
    },
  ])
  await db.insert(schema.pointEntry).values([
    {
      id: 'pe1',
      userId: 'mem1',
      delta: 50,
      source: 'submission',
      sourceId: 's_real',
      createdAt: ago(20),
    },
    { id: 'pe2', userId: 'mem2', delta: 25, source: 'attendance', createdAt: ago(5) },
  ])
  await db.insert(schema.event).values([
    {
      id: 'e_real',
      title: 'Meeting',
      description: '',
      startsAt: ago(3),
      endsAt: ago(3),
      location: 'C3',
    },
  ])
  await db.insert(schema.officer).values([
    { id: 'o_real', name: 'Olive', title: 'President', bio: '' },
    { id: 'o_seed_1', name: 'Sample officer', title: 'VP', bio: '' },
  ])
  await db.insert(schema.membershipApplication).values([
    {
      id: 'ma1',
      userId: 'gst1',
      grade: '10',
      experience: 'none',
      goals: '',
      whyJoin: '',
      availability: '',
    },
  ])
})

describe('resetCounts', () => {
  it('counts what each action would touch, never counting admins or you', async () => {
    const c = await resetCounts(db, ACTOR, now)
    expect(c.memberships).toBe(3) // mem1, mem2, and the sample member
    expect(c.accounts).toBe(5) // everyone but the two admins
    expect(c.guests).toBe(1)
    expect(c.points).toBe(2)
    expect(c.officers).toBe(2)
    expect(c.season).toBe(2) // two members with points this semester
    expect(c.sample).toBe(3) // c_seed_1, o_seed_1, and the @test.local account
  })
})

describe('runReset', () => {
  it('new school year: fresh board, members re-apply, officers cleared, history kept', async () => {
    const preset = RESET_PRESETS.find((p) => p.id === 'new-year')!
    const res = await runReset(
      db,
      null,
      { actions: [...preset.actions], actorId: ACTOR },
      now,
    )
    expect(res.ran).toEqual(['memberships', 'applications', 'officers', 'season'])

    const roles = Object.fromEntries(
      (
        await db.select({ id: schema.user.id, role: schema.user.role }).from(schema.user)
      ).map((u) => [u.id, u.role]),
    )
    expect(roles).toMatchObject({
      admin1: 'admin',
      admin2: 'admin',
      off1: 'officer',
      mem1: 'guest',
      mem2: 'guest',
    })
    expect(await rows(schema.officer)).toBe(0)
    expect(await rows(schema.membershipApplication)).toBe(0)
    // Points history is untouched; the semester board starts now.
    expect(await rows(schema.pointEntry)).toBe(2)
    expect((await getSetting(db, 'season')).startedAt).toBe(now.getTime())
    expect((await pointsWindowStart(db, now)).getTime()).toBe(now.getTime())
    // Content stays.
    expect(await rows(schema.challenge)).toBe(2)
    expect(await rows(schema.event)).toBe(1)
  })

  it('a new season zeroes the semester leaderboard but keeps all-time', async () => {
    await runReset(db, null, { actions: ['season'], actorId: ACTOR }, now)
    await db.update(schema.user).set({ role: 'member' }).where(eq(schema.user.id, 'mem1'))
    const semester = await getLeaderboard(db, {
      window: 'semester',
      now: new Date(now.getTime() + 1000),
    })
    const allTime = await getLeaderboard(db, {
      window: 'all',
      now: new Date(now.getTime() + 1000),
    })
    expect(semester.rows.every((r) => r.points === 0)).toBe(true)
    expect(allTime.rows.find((r) => r.userId === 'mem1')?.points).toBe(50)
  })

  it('removing sample data leaves real and imported rows alone', async () => {
    await runReset(db, null, { actions: ['sample'], actorId: ACTOR }, now)
    const ids = async (table: typeof schema.challenge | typeof schema.officer) =>
      (await db.select({ id: table.id }).from(table)).map((r) => r.id)
    expect(await ids(schema.challenge)).toEqual(['c_real'])
    expect(await ids(schema.officer)).toEqual(['o_real'])
    expect(
      await db.query.user.findFirst({ where: eq(schema.user.id, 'u_seed_m1') }),
    ).toBeUndefined()
    expect(await rows(schema.submission)).toBe(1)
  })

  it('full wipe empties the site but keeps every admin and you', async () => {
    const preset = RESET_PRESETS.find((p) => p.id === 'full')!
    await runReset(db, null, { actions: [...preset.actions], actorId: ACTOR }, now)
    const left = (await db.select({ id: schema.user.id }).from(schema.user))
      .map((u) => u.id)
      .sort()
    expect(left).toEqual(['admin1', 'admin2'])
    for (const table of [
      schema.challenge,
      schema.submission,
      schema.pointEntry,
      schema.event,
      schema.officer,
    ])
      expect(await rows(table)).toBe(0)
  })

  it('never deletes the person running it, even if they are not an admin', async () => {
    await runReset(db, null, { actions: ['accounts'], actorId: 'off1' }, now)
    const left = (await db.select({ id: schema.user.id }).from(schema.user))
      .map((u) => u.id)
      .sort()
    expect(left).toEqual(['admin1', 'admin2', 'off1'])
  })
})

describe('exportBackup', () => {
  it('includes the data but never login secrets', async () => {
    const backup = JSON.parse(await exportBackup(db, now)) as {
      tables: Record<string, unknown[]>
    }
    expect(backup.tables.user).toHaveLength(7)
    expect(backup.tables.challenge).toHaveLength(2)
    expect(Object.keys(backup.tables)).not.toEqual(
      expect.arrayContaining(['account', 'session', 'verification']),
    )
    // Sanity: the database has those tables, the backup just leaves them out.
    const names = await db.all<{ name: string }>(
      sql`SELECT name FROM sqlite_master WHERE type = 'table'`,
    )
    expect(names.map((n) => n.name)).toContain('account')
  })
})
