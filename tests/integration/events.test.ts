import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { buildIcs } from '#/lib/events'
import {
  calendarFeed,
  checkIn,
  deleteEvent,
  getAttendanceSheet,
  getEventDetail,
  listEventsData,
  markAttendance,
  regenerateCheckInCode,
  saveEvent,
  searchMembers,
  sendEventReminders,
  setCheckInOpen,
  setRsvp,
} from '#/services/events'
import { pointsFor } from '#/services/points'

const db = getDb()
const HOUR = 3600_000
const DAY = 24 * HOUR
const now = new Date('2026-11-03T20:00:00Z')

const member = { id: 'u_mem', role: 'member' as const }
const other = { id: 'u_mem2', role: 'member' as const }
const guest = { id: 'u_guest', role: 'guest' as const }
const officer = { id: 'u_off', role: 'officer' as const }

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'u_mem', name: 'Ada Member', email: 'ada@test.local', role: 'member' },
    { id: 'u_mem2', name: 'Bo Member', email: 'bo@test.local', role: 'member' },
    {
      id: 'u_quiet',
      name: 'Quinn Quiet',
      email: 'quinn@test.local',
      role: 'member',
      emailPrefs: { eventReminder: false },
    },
    { id: 'u_guest', name: 'Gus Guest', email: 'gus@test.local', role: 'guest' },
    { id: 'u_off', name: 'Olive Officer', email: 'olive@test.local', role: 'officer' },
  ])
  await db.insert(schema.event).values([
    {
      // Running now (started 30 minutes ago), check-in open.
      id: 'e_now',
      title: 'Lunch meeting',
      description: 'Intro to recursion.',
      startsAt: new Date(now.getTime() - 30 * 60_000),
      endsAt: new Date(now.getTime() + 15 * 60_000),
      location: 'Room 12',
      tags: ['meeting'],
      checkInCode: 'AB3K7Q',
      checkInOpen: true,
    },
    {
      id: 'e_closed',
      title: 'Closed meeting',
      description: '',
      startsAt: new Date(now.getTime() - 10 * 60_000),
      endsAt: new Date(now.getTime() + 30 * 60_000),
      location: 'Room 12',
      checkInCode: 'ZZZZZZ',
      checkInOpen: false,
    },
    {
      id: 'e_tomorrow',
      title: 'RAP teaching day',
      description: 'Scratch with third graders.',
      startsAt: new Date(now.getTime() + 20 * HOUR),
      endsAt: new Date(now.getTime() + 22 * HOUR),
      location: 'Ripon Elementary',
      tags: ['volunteering', 'rap'],
      checkInCode: 'TMRW22',
      checkInOpen: true,
    },
    {
      id: 'e_next_week',
      title: 'H2O planning',
      description: '',
      startsAt: new Date(now.getTime() + 7 * DAY),
      endsAt: new Date(now.getTime() + 7 * DAY + HOUR),
      location: 'Library',
    },
    {
      id: 'e_old',
      title: 'Kickoff',
      description: '',
      startsAt: new Date(now.getTime() - 10 * DAY),
      endsAt: new Date(now.getTime() - 10 * DAY + HOUR),
      location: 'Room 12',
      checkInCode: 'OLD234',
      checkInOpen: true,
    },
  ])
})

afterEach(() => {
  vi.restoreAllMocks()
  env.RESEND_API_KEY = ''
})

describe('RSVP', () => {
  it('rejects guests', async () => {
    await expect(
      setRsvp(db, { eventId: 'e_next_week', user: guest, status: 'yes' }, now),
    ).rejects.toMatchObject({ code: 'NOT_MEMBER' })
  })

  it('creates, then changes, a single RSVP per member', async () => {
    const first = await setRsvp(
      db,
      { eventId: 'e_next_week', user: member, status: 'yes' },
      now,
    )
    expect(first).toMatchObject({ status: 'yes', going: 1, maybe: 0 })
    const changed = await setRsvp(
      db,
      { eventId: 'e_next_week', user: member, status: 'maybe' },
      now,
    )
    expect(changed).toMatchObject({ status: 'maybe', going: 0, maybe: 1 })
    const rows = await db
      .select()
      .from(schema.rsvp)
      .where(eq(schema.rsvp.eventId, 'e_next_week'))
    expect(rows).toHaveLength(1)
  })

  it('closes once the event has ended', async () => {
    await expect(
      setRsvp(db, { eventId: 'e_old', user: member, status: 'yes' }, now),
    ).rejects.toMatchObject({ code: 'ENDED' })
  })

  it('shows the viewer their RSVP and never leaks the check-in code', async () => {
    const detail = await getEventDetail(db, 'e_next_week', member, now)
    expect(detail?.viewer?.rsvp).toBe('maybe')
    expect(JSON.stringify(detail)).not.toContain('checkInCode')
    const page = await listEventsData(db, member, now)
    expect(JSON.stringify(page)).not.toContain('AB3K7Q')
    expect(page.upcoming.map((e) => e.id)).toEqual([
      'e_now',
      'e_closed',
      'e_tomorrow',
      'e_next_week',
    ])
    expect(page.past.map((e) => e.id)).toEqual(['e_old'])
  })
})

describe('check-in', () => {
  it('refuses guests', async () => {
    const r = await checkIn(db, { eventId: 'e_now', user: guest, code: 'AB3K7Q' }, now)
    expect(r.status).toBe('guest')
  })

  it('refuses when check-in is closed', async () => {
    const r = await checkIn(
      db,
      { eventId: 'e_closed', user: member, code: 'ZZZZZZ' },
      now,
    )
    expect(r.status).toBe('closed')
  })

  it('refuses a wrong code', async () => {
    const r = await checkIn(db, { eventId: 'e_now', user: member, code: 'AB3K7R' }, now)
    expect(r.status).toBe('wrong-code')
  })

  it('enforces the window: an hour before the start to three hours after the end', async () => {
    const early = await checkIn(
      db,
      { eventId: 'e_tomorrow', user: member, code: 'TMRW22' },
      now,
    )
    expect(early.status).toBe('early')
    const late = await checkIn(
      db,
      { eventId: 'e_old', user: member, code: 'OLD234' },
      now,
    )
    expect(late.status).toBe('late')
    expect(await pointsFor(db, member.id)).toBe(0)
  })

  it('checks in once, case-insensitively, and settles points once', async () => {
    const first = await checkIn(
      db,
      { eventId: 'e_now', user: member, code: 'ab3k7q' },
      now,
    )
    expect(first).toMatchObject({ status: 'checked-in', points: 25 })
    const again = await checkIn(
      db,
      { eventId: 'e_now', user: member, code: 'AB3K7Q' },
      now,
    )
    expect(again.status).toBe('already')

    expect(await pointsFor(db, member.id)).toBe(25)
    const ledger = await db
      .select()
      .from(schema.pointEntry)
      .where(
        and(
          eq(schema.pointEntry.userId, member.id),
          eq(schema.pointEntry.source, 'attendance'),
        ),
      )
    expect(ledger).toHaveLength(1)
    expect(ledger[0]?.sourceId).toBe('e_now')
    const rows = await db
      .select()
      .from(schema.attendance)
      .where(eq(schema.attendance.eventId, 'e_now'))
    expect(rows).toHaveLength(1)
  })

  it('reopening generates a code only when missing; regenerating replaces it', async () => {
    const { code } = await setCheckInOpen(db, 'e_next_week', true)
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/)
    const reopened = await setCheckInOpen(db, 'e_next_week', true)
    expect(reopened.code).toBe(code)
    const fresh = await regenerateCheckInCode(db, 'e_next_week')
    expect(fresh.code).not.toBe(code)
  })
})

describe('manual attendance', () => {
  it('marks a member present with points, and unmarking reverses them', async () => {
    await markAttendance(db, {
      eventId: 'e_closed',
      userId: other.id,
      present: true,
      markedBy: officer.id,
    })
    expect(await pointsFor(db, other.id)).toBe(25)
    // Marking twice does not double the points.
    await markAttendance(db, {
      eventId: 'e_closed',
      userId: other.id,
      present: true,
      markedBy: officer.id,
    })
    expect(await pointsFor(db, other.id)).toBe(25)

    const sheet = await getAttendanceSheet(db, 'e_closed', now)
    const row = sheet?.roster.find((r) => r.user.id === other.id)
    expect(row?.attendance).toMatchObject({ self: false, markedByName: 'Olive Officer' })

    await markAttendance(db, {
      eventId: 'e_closed',
      userId: other.id,
      present: false,
      markedBy: officer.id,
    })
    expect(await pointsFor(db, other.id)).toBe(0)
    const left = await db
      .select()
      .from(schema.attendance)
      .where(eq(schema.attendance.eventId, 'e_closed'))
    expect(left).toHaveLength(0)
  })

  it('refuses to mark guests and only finds members in search', async () => {
    await expect(
      markAttendance(db, {
        eventId: 'e_closed',
        userId: guest.id,
        present: true,
        markedBy: officer.id,
      }),
    ).rejects.toMatchObject({ code: 'NOT_MEMBER' })
    const found = await searchMembers(db, 'e_now', 'test.local')
    expect(found.map((u) => u.id)).not.toContain(guest.id)
    expect(found.find((u) => u.id === member.id)?.present).toBe(true)
  })

  it('reverses attendance points when an event is deleted', async () => {
    const { id } = await saveEvent(db, {
      userId: officer.id,
      values: {
        title: 'Pop-up workshop',
        description: '',
        startsAt: '2026-11-03T11:00',
        endsAt: '2026-11-03T12:00',
        location: 'Room 12',
        tags: ['workshop'],
        coverKey: null,
      },
    })
    await markAttendance(db, {
      eventId: id,
      userId: other.id,
      present: true,
      markedBy: officer.id,
    })
    expect(await pointsFor(db, other.id)).toBe(25)
    await deleteEvent(db, id)
    expect(await pointsFor(db, other.id)).toBe(0)
  })
})

describe('saveEvent', () => {
  it('stores club-local times as UTC and resets the reminder when the time moves', async () => {
    const { id } = await saveEvent(db, {
      userId: officer.id,
      values: {
        title: 'Hackathon kickoff',
        description: 'Teams and ideas.',
        startsAt: '2026-12-08T12:30',
        endsAt: '2026-12-08T13:15',
        location: 'Room 12',
        tags: ['hackathon', 'hackathon'],
        coverKey: null,
      },
    })
    const row = await db.query.event.findFirst({ where: eq(schema.event.id, id) })
    expect(row?.startsAt.toISOString()).toBe('2026-12-08T20:30:00.000Z')
    expect(row?.tags).toEqual(['hackathon'])

    await db
      .update(schema.event)
      .set({ reminderSentAt: now })
      .where(eq(schema.event.id, id))
    await saveEvent(db, {
      id,
      userId: officer.id,
      values: {
        title: 'Hackathon kickoff',
        description: 'Teams and ideas.',
        startsAt: '2026-12-09T12:30',
        endsAt: '2026-12-09T13:15',
        location: 'Room 12',
        tags: ['hackathon'],
        coverKey: null,
      },
    })
    const moved = await db.query.event.findFirst({ where: eq(schema.event.id, id) })
    expect(moved?.reminderSentAt).toBeNull()
    await deleteEvent(db, id)
  })
})

describe('sendEventReminders', () => {
  it('emails yes and maybe RSVPs who want reminders, exactly once', async () => {
    await setRsvp(db, { eventId: 'e_tomorrow', user: member, status: 'yes' }, now)
    await setRsvp(db, { eventId: 'e_tomorrow', user: other, status: 'maybe' }, now)
    await setRsvp(
      db,
      { eventId: 'e_tomorrow', user: { id: 'u_quiet', role: 'member' }, status: 'yes' },
      now,
    )
    await setRsvp(db, { eventId: 'e_tomorrow', user: officer, status: 'no' }, now)

    env.RESEND_API_KEY = 're_test'
    env.EMAIL_FROM = 'club@test.local'
    const sent: { to: string[]; subject: string; html: string; text: string }[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      sent.push(...(JSON.parse(String(init?.body)) as typeof sent))
      return new Response('{}', { status: 200 })
    })

    const first = await sendEventReminders(db, now)
    // e_tomorrow is the only event starting in the next 24 hours.
    expect(first).toEqual({ events: 1, sent: 2 })
    expect(sent.map((m) => m.to[0]).sort()).toEqual(['ada@test.local', 'bo@test.local'])
    expect(sent[0]?.subject).toContain('RAP teaching day')
    expect(sent[0]?.text).toContain('Ripon Elementary')
    expect(sent[0]?.text).toContain('/events/e_tomorrow')
    expect(sent[0]?.text).toContain('Email preferences')

    const second = await sendEventReminders(db, new Date(now.getTime() + HOUR))
    expect(second).toEqual({ events: 0, sent: 0 })
    expect(sent).toHaveLength(2)
  })
})

describe('calendar feed', () => {
  it('lists upcoming and recent events as valid iCalendar', async () => {
    const events = await calendarFeed(db, now)
    const ids = events.map((e) => e.id)
    expect(ids).toContain('e_tomorrow')
    expect(ids).toContain('e_old') // ended 10 days ago, inside the 30-day tail
    const ics = buildIcs(events, { name: 'RHS Coding Club', now })
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(events.length)
    expect(ics).toContain('SUMMARY:RAP teaching day')
    expect(ics).toContain('LOCATION:Ripon Elementary')
    expect(ics).toContain('CATEGORIES:Volunteering,RAP')
    expect(ics).toMatch(/URL:https?:\/\/[^\r]+\/events\/e_tomorrow\r\n/)
  })
})
