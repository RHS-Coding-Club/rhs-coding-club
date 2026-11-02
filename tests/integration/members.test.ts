import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { weekKey } from '#/lib/dates'
import { setSetting, getSetting } from '#/services/settings'
import {
  describedHistory,
  getDashboard,
  getLeaderboard,
  getMemberProfile,
} from '#/services/members'

const db = getDb()
// Mid-October: the fall semester started Aug 1.
const now = new Date(2026, 9, 15, 12, 0, 0)
const day = 24 * 60 * 60 * 1000
const ago = (n: number) => new Date(now.getTime() - n * day)

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'm1', name: 'Ada', email: 'ada@test.local', role: 'member' },
    { id: 'm2', name: 'Bo', email: 'bo@test.local', role: 'member' },
    { id: 'm3', name: 'Cy', email: 'cy@test.local', role: 'officer' },
    { id: 'g1', name: 'Gus', email: 'gus@test.local', role: 'guest' },
  ])
  await db.insert(schema.challenge).values([
    {
      id: 'c1',
      title: 'Reverse a linked list',
      description: 'd',
      prompt: 'p',
      difficulty: 'medium',
      points: 100,
      weekNo: 3,
      publishedAt: ago(2),
    },
  ])
  await db.insert(schema.submission).values([
    {
      id: 's1',
      challengeId: 'c1',
      userId: 'm1',
      language: 'Python',
      platform: 'GitHub',
      url: 'https://github.com/x',
      status: 'pass',
    },
  ])
  await db.insert(schema.event).values([
    {
      id: 'e1',
      title: 'Lunch meeting',
      description: '',
      startsAt: ago(5),
      endsAt: ago(5),
      location: 'Room 1',
    },
    {
      id: 'e2',
      title: 'H2O kickoff',
      description: '',
      startsAt: new Date(now.getTime() + 2 * day),
      endsAt: new Date(now.getTime() + 2 * day + 3600_000),
      location: 'Library',
    },
  ])
  await db.insert(schema.attendance).values([{ id: 'a1', eventId: 'e1', userId: 'm1' }])
  await db.insert(schema.rsvp).values([
    { id: 'r1', eventId: 'e2', userId: 'm1', status: 'yes' },
    { id: 'r2', eventId: 'e1', userId: 'm1', status: 'yes' },
  ])
  await db.insert(schema.project).values([
    { id: 'p1', title: 'Team app', description: 'x', authorId: 'm2', status: 'approved' },
    { id: 'p2', title: 'Draft', description: 'x', authorId: 'm1', status: 'pending' },
  ])
  await db.insert(schema.projectMember).values([{ projectId: 'p1', userId: 'm1' }])
  await db.insert(schema.badge).values([
    {
      id: 'b1',
      name: 'First Blood',
      description: 'Passed a challenge.',
      rarity: 'common',
      criteriaType: 'challenges',
      threshold: 1,
    },
    {
      id: 'b2',
      name: 'Legend',
      description: 'Hand-picked.',
      rarity: 'legendary',
      criteriaType: 'custom',
    },
  ])
  await db.insert(schema.userBadge).values([
    { userId: 'm1', badgeId: 'b1', awardedAt: ago(3) },
    { userId: 'm1', badgeId: 'b2', awardedAt: ago(1) },
  ])
  // Ledger: m2 leads all time (old points), m1 leads this semester.
  await db.insert(schema.pointEntry).values([
    {
      userId: 'm2',
      delta: 500,
      source: 'manual',
      note: 'Last year',
      createdAt: ago(200),
    },
    { userId: 'm2', delta: 25, source: 'attendance', sourceId: 'e1', createdAt: ago(5) },
    { userId: 'm1', delta: 100, source: 'submission', sourceId: 's1', createdAt: ago(2) },
    { userId: 'm1', delta: 25, source: 'attendance', sourceId: 'a1', createdAt: ago(5) },
    { userId: 'm1', delta: 150, source: 'project', sourceId: 'p1', createdAt: ago(1) },
    { userId: 'm3', delta: 10, source: 'manual', note: 'Setup help', createdAt: ago(4) },
    { userId: 'g1', delta: 999, source: 'manual', note: 'nope', createdAt: ago(1) },
  ])
})

describe('getLeaderboard', () => {
  it('ranks the semester window from the ledger and hides guests', async () => {
    const lb = await getLeaderboard(db, { window: 'semester', now })
    expect(lb.rows.map((r) => [r.userId, r.points, r.rank])).toEqual([
      ['m1', 275, 1],
      ['m2', 25, 2],
      ['m3', 10, 3],
    ])
    expect(lb.rows[0].badges.map((b) => b.rarity)).toEqual(['legendary', 'common'])
  })

  it('ranks all time including last year', async () => {
    const lb = await getLeaderboard(db, { window: 'all', now })
    expect(lb.rows.map((r) => r.userId)).toEqual(['m2', 'm1', 'm3'])
    expect(lb.totalPoints).toBe(525 + 275 + 10)
  })

  it('pins the viewer when they fall below the cut', async () => {
    const points = await getSetting(db, 'points')
    await setSetting(db, 'points', { ...points, showTop: 2 }, 'm3')
    const lb = await getLeaderboard(db, { window: 'semester', viewerId: 'm3', now })
    expect(lb.rows).toHaveLength(2)
    expect(lb.pinned?.userId).toBe('m3')
    expect(lb.pinned?.rank).toBe(3)
    const top = await getLeaderboard(db, { window: 'semester', viewerId: 'm1', now })
    expect(top.pinned).toBeNull()
    expect(top.viewerRank).toBe(1)
    await setSetting(db, 'points', { ...points, showTop: 25 }, 'm3')
  })
})

describe('getMemberProfile', () => {
  it('returns null for guests and unknown ids', async () => {
    expect(await getMemberProfile(db, 'g1', now)).toBeNull()
    expect(await getMemberProfile(db, 'nobody', now)).toBeNull()
  })

  it('collects stats, solves, team projects, and badges', async () => {
    const p = await getMemberProfile(db, 'm1', now)
    expect(p?.stats).toEqual({
      allTime: 275,
      semester: 275,
      rank: 1,
      allTimeRank: 2,
      solved: 1,
      events: 1,
      projects: 1,
    })
    expect(p?.solved.map((s) => [s.title, s.weekNo])).toEqual([
      ['Reverse a linked list', 3],
    ])
    // Credited via project_member; the pending project is not shown.
    expect(p?.projects.map((x) => x.id)).toEqual(['p1'])
    expect(p?.badges.map((b) => b.name)).toEqual(['Legend', 'First Blood'])
  })
})

describe('describedHistory', () => {
  it('resolves each source to what earned it', async () => {
    const rows = await describedHistory(db, 'm1')
    const refs = Object.fromEntries(rows.map((r) => [r.source, r.ref]))
    expect(refs.submission).toEqual({
      kind: 'challenge',
      id: 'c1',
      title: 'Reverse a linked list',
      weekNo: 3,
    })
    expect(refs.project).toEqual({ kind: 'project', id: 'p1', title: 'Team app' })
    expect(refs.attendance).toEqual({ kind: 'event', id: 'e1', title: 'Lunch meeting' })
  })

  it('also resolves attendance rows that point at the event id', async () => {
    const rows = await describedHistory(db, 'm2')
    expect(rows.find((r) => r.source === 'attendance')?.ref).toEqual({
      kind: 'event',
      id: 'e1',
      title: 'Lunch meeting',
    })
  })
})

describe('getDashboard', () => {
  it('shows guests their application state only', async () => {
    const d = await getDashboard(db, { id: 'g1', role: 'guest' }, now)
    expect(d).toEqual({ kind: 'guest', application: null })
  })

  it('gives members their numbers, challenge, upcoming RSVPs, and projects', async () => {
    const d = await getDashboard(db, { id: 'm1', role: 'member' }, now)
    if (d.kind !== 'member') throw new Error('expected member dashboard')
    expect(d.points).toMatchObject({ allTime: 275, semester: 275, rank: 1 })
    expect(d.points.weeks).toHaveLength(12)
    expect(d.points.weeks.at(-1)?.week).toBe(weekKey(now))
    expect(d.points.weeks.reduce((n, w) => n + w.points, 0)).toBe(275)
    expect(d.stats.challenges).toBe(1)
    expect(d.challenge?.id).toBe('c1')
    expect(d.challenge?.submission?.status).toBe('pass')
    expect(d.rsvps.map((r) => r.id)).toEqual(['e2'])
    expect(d.projects.map((p) => p.id).sort()).toEqual(['p1', 'p2'])
    expect(d.queues).toBeNull()
  })

  it('adds queue counts for officers', async () => {
    const d = await getDashboard(db, { id: 'm3', role: 'officer' }, now)
    if (d.kind !== 'member') throw new Error('expected member dashboard')
    expect(d.queues?.pendingProjects).toBe(1)
  })
})
