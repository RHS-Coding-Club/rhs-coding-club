import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { getSetting, setSetting } from '#/services/settings'
import { buildDigest, renderDigest, sendWeeklyDigest } from '#/services/digest'

const db = getDb()
const now = new Date(2026, 9, 19, 9, 0, 0) // a Monday in October
const day = 24 * 60 * 60 * 1000

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'm1', name: 'Max Member', email: 'max@test.local', role: 'member' },
    {
      id: 'm2',
      name: 'Opted Out',
      email: 'out@test.local',
      role: 'member',
      emailPrefs: { weeklyDigest: false },
    },
    { id: 'g1', name: 'Gus', email: 'gus@test.local', role: 'guest' },
  ])
  await db.insert(schema.pointEntry).values({
    userId: 'm1',
    delta: 50,
    source: 'manual',
    note: 'x',
    createdAt: new Date(now.getTime() - day),
  })
  // The digest is off club-wide by default; switch it on.
  const email = await getSetting(db, 'email')
  await setSetting(
    db,
    'email',
    { ...email, notifications: { ...email.notifications, weeklyDigest: true } },
    'm1',
  )
})

describe('sendWeeklyDigest', () => {
  it('skips when there is nothing new (a leaderboard alone is not news)', async () => {
    await db.insert(schema.challenge).values({
      id: 'old',
      title: 'Old one',
      description: 'd',
      prompt: 'p',
      difficulty: 'easy',
      points: 50,
      weekNo: 1,
      publishedAt: new Date(now.getTime() - 30 * day),
    })
    const r = await sendWeeklyDigest(db, now)
    expect(r).toEqual({ sent: 0, skipped: 'nothing new' })
  })

  it('sends this week’s items to members who want it', async () => {
    await db.insert(schema.challenge).values({
      id: 'c5',
      title: 'Two sum, but fast',
      description: 'Find the pair.',
      prompt: 'p',
      difficulty: 'medium',
      points: 100,
      weekNo: 5,
      publishedAt: new Date(now.getTime() - day),
    })
    await db.insert(schema.event).values([
      {
        id: 'e-soon',
        title: 'RAP afternoon',
        description: '',
        startsAt: new Date(now.getTime() + 2 * day),
        endsAt: new Date(now.getTime() + 2 * day + 3600_000),
        location: 'Ripon Elementary',
      },
      {
        id: 'e-far',
        title: 'Far away',
        description: '',
        startsAt: new Date(now.getTime() + 20 * day),
        endsAt: new Date(now.getTime() + 20 * day + 3600_000),
        location: 'x',
      },
    ])
    await db.insert(schema.post).values({
      id: 'p1',
      title: 'Hackathon recap',
      slug: 'hackathon-recap',
      summary: 'What we built.',
      content: '{}',
      publishedAt: new Date(now.getTime() - 2 * day),
    })

    const d = await buildDigest(db, now)
    expect(d.challenge?.id).toBe('c5')
    expect(d.events.map((e) => e.id)).toEqual(['e-soon'])
    expect(d.posts.map((p) => p.slug)).toEqual(['hackathon-recap'])
    expect(d.top.map((t) => t.userId)).toEqual(['m1'])

    const mail = renderDigest(d, 'Max Member')
    expect(mail.text).toContain('Hi Max')
    expect(mail.text).toContain('Two sum, but fast')
    expect(mail.text).toContain('/blog/hackathon-recap')
    expect(mail.html).toContain('RAP afternoon')

    const r = await sendWeeklyDigest(db, now)
    // No Resend key in tests: messages are logged instead of sent.
    expect(r).toMatchObject({ logged: 1, failed: 0, recipients: 1 })

    // A second tick the same week (a retry or a duplicate trigger) sends nothing.
    const again = await sendWeeklyDigest(db, new Date(now.getTime() + 60_000))
    expect(again).toMatchObject({ sent: 0, skipped: 'already sent' })
    // The next week goes out again.
    const nextWeek = await sendWeeklyDigest(db, new Date(now.getTime() + 7 * 86_400_000))
    expect(nextWeek).not.toMatchObject({ skipped: 'already sent' })
  })
})
