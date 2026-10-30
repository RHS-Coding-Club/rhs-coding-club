import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { getAboutData, getAdminOverview, getHomeData } from '#/services/home'
import { getSetting, setSetting } from '#/services/settings'

const db = getDb()
const now = new Date(2026, 8, 15, 12, 0, 0)
const day = 24 * 60 * 60 * 1000

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'u1', name: 'Ada Admin', email: 'ada@test.local', role: 'admin' },
    { id: 'u2', name: 'Max Member', email: 'max@test.local', role: 'member' },
    { id: 'u3', name: 'Gus Guest', email: 'gus@test.local', role: 'guest' },
  ])
  await db.insert(schema.event).values([
    {
      id: 'e-past',
      title: 'Past meeting',
      description: '',
      startsAt: new Date(now.getTime() - 10 * day),
      endsAt: new Date(now.getTime() - 10 * day + 3600_000),
      location: 'Room 1',
    },
    {
      id: 'e-next',
      title: 'Next meeting',
      description: '',
      startsAt: new Date(now.getTime() + 2 * day),
      endsAt: new Date(now.getTime() + 2 * day + 3600_000),
      location: 'Room 2',
    },
    {
      id: 'e-later',
      title: 'Later meeting',
      description: '',
      startsAt: new Date(now.getTime() + 9 * day),
      endsAt: new Date(now.getTime() + 9 * day + 3600_000),
      location: 'Room 3',
    },
  ])
  await db.insert(schema.project).values([
    { id: 'p1', title: 'Approved', description: 'x', authorId: 'u2', status: 'approved' },
    { id: 'p2', title: 'Pending', description: 'x', authorId: 'u2', status: 'pending' },
  ])
  await db.insert(schema.officer).values([
    { id: 'o2', name: 'Second', title: 'VP', bio: '', sortOrder: 2 },
    { id: 'o1', name: 'First', title: 'President', bio: '', sortOrder: 1 },
    {
      id: 'o3',
      name: 'Retired',
      title: 'Alumni',
      bio: '',
      sortOrder: 0,
      isActive: false,
    },
  ])
})

describe('getHomeData', () => {
  it('counts members (not guests), this-semester events, and approved projects', async () => {
    const data = await getHomeData(db, now)
    expect(data.stats).toEqual({ members: 2, eventsThisSemester: 1, projects: 1 })
  })

  it('picks the soonest upcoming event', async () => {
    const data = await getHomeData(db, now)
    expect(data.nextEvent?.id).toBe('e-next')
  })

  it('only lists approved projects', async () => {
    const data = await getHomeData(db, now)
    expect(data.featuredProjects.map((p) => p.id)).toEqual(['p1'])
  })

  it('returns club defaults when no settings row exists', async () => {
    const data = await getHomeData(db, now)
    expect(data.club.clubName).toBe('RHS Coding Club')
  })
})

describe('getAboutData', () => {
  it('orders active officers by sortOrder and hides inactive ones', async () => {
    const data = await getAboutData(db)
    expect(data.officers.map((o) => o.id)).toEqual(['o1', 'o2'])
  })
})

describe('settings round-trip', () => {
  it('persists a validated value and reads it back merged with defaults', async () => {
    await setSetting(
      db,
      'club-info',
      { ...(await getSetting(db, 'club-info')), clubName: 'X' },
      'u1',
    )
    const v = await getSetting(db, 'club-info')
    expect(v.clubName).toBe('X')
    expect(v.tagline).toBe('Most active club at RHS')
  })
})

describe('getAdminOverview', () => {
  it('counts pending work per queue', async () => {
    await db.insert(schema.contactMessage).values([
      { id: 'm1', name: 'A', email: 'a@x.y', subject: 's', message: 'm' },
      { id: 'm2', name: 'B', email: 'b@x.y', subject: 's', message: 'm', readAt: now },
    ])
    const o = await getAdminOverview(db)
    expect(o.pendingProjects).toBe(1)
    expect(o.unreadMessages).toBe(1)
    expect(o.pendingSubmissions).toBe(0)
  })
})
