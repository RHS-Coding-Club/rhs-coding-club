import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  like,
  lte,
  or,
} from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { RsvpStatus } from '#/db/schema'
import type { Role } from '#/lib/roles'
import { hasRole } from '#/lib/roles'
import { fmtDate } from '#/lib/format'
import {
  checkInTiming,
  checkInWindow,
  clubLocalToDate,
  codesMatch,
  fmtEventWhen,
  generateCheckInCode,
  toClubLocalInput,
} from '#/lib/events'
import type { CalendarEvent } from '#/lib/events'
import type { EventFormValues } from '#/lib/schemas/events'
import { recipientById, sendEmails } from './email'
import type { EmailMessage } from './email'
import { prefsFooter, renderEmail, siteUrl } from './email-templates'
import { settlePoints } from './points'
import { getSetting } from './settings'

// Events, RSVPs, attendance, and check-in. Points for attendance go through
// settlePoints (source 'attendance', sourceId = event id), so a check-in is
// worth the configured amount exactly once and unmarking reverses it.

export interface Viewer {
  id: string
  role: Role
}

const MEMBER_ROLES = ['member', 'officer', 'admin'] as const
const DAY = 24 * 60 * 60 * 1000
/** Past events shown on the public page and kept in the calendar feed. */
const PAST_WINDOW = 365 * DAY
const FEED_PAST_WINDOW = 30 * DAY
/** Avatars shown per upcoming event card. */
const FACES = 5

const publicColumns = {
  id: true,
  title: true,
  description: true,
  startsAt: true,
  endsAt: true,
  location: true,
  tags: true,
  coverKey: true,
  checkInOpen: true,
} as const

const userColumns = {
  id: schema.user.id,
  name: schema.user.name,
  image: schema.user.image,
  avatarKey: schema.user.avatarKey,
}

export type EventFace = {
  id: string
  name: string
  image: string | null
  avatarKey: string | null
}

/** RSVP tallies per event: { [eventId]: { yes, maybe, no } }. */
async function rsvpCounts(db: Db, eventIds: string[]) {
  const out = new Map<string, Record<RsvpStatus, number>>()
  if (eventIds.length === 0) return out
  const rows = await db
    .select({ eventId: schema.rsvp.eventId, status: schema.rsvp.status, n: count() })
    .from(schema.rsvp)
    .where(inArray(schema.rsvp.eventId, eventIds))
    .groupBy(schema.rsvp.eventId, schema.rsvp.status)
  for (const r of rows) {
    const c = out.get(r.eventId) ?? { yes: 0, maybe: 0, no: 0 }
    c[r.status] = r.n
    out.set(r.eventId, c)
  }
  return out
}

async function attendanceCounts(db: Db, eventIds: string[]) {
  const out = new Map<string, number>()
  if (eventIds.length === 0) return out
  const rows = await db
    .select({ eventId: schema.attendance.eventId, n: count() })
    .from(schema.attendance)
    .where(inArray(schema.attendance.eventId, eventIds))
    .groupBy(schema.attendance.eventId)
  for (const r of rows) out.set(r.eventId, r.n)
  return out
}

/** Who said yes, earliest first, per event. */
async function goingFaces(db: Db, eventIds: string[]) {
  const out = new Map<string, EventFace[]>()
  if (eventIds.length === 0) return out
  const rows = await db
    .select({ eventId: schema.rsvp.eventId, ...userColumns })
    .from(schema.rsvp)
    .innerJoin(schema.user, eq(schema.user.id, schema.rsvp.userId))
    .where(and(inArray(schema.rsvp.eventId, eventIds), eq(schema.rsvp.status, 'yes')))
    .orderBy(asc(schema.rsvp.createdAt))
  for (const { eventId, ...face } of rows) {
    const list = out.get(eventId) ?? []
    list.push(face)
    out.set(eventId, list)
  }
  return out
}

// ---------- Public reads ----------

/** The /events page: upcoming (soonest first), past (newest first), and the viewer's state. */
export async function listEventsData(db: Db, viewer: Viewer | null, now = new Date()) {
  const events = await db.query.event.findMany({
    where: gte(schema.event.endsAt, new Date(now.getTime() - PAST_WINDOW)),
    orderBy: asc(schema.event.startsAt),
    columns: publicColumns,
  })
  const ids = events.map((e) => e.id)
  const upcomingIds = events.filter((e) => e.endsAt >= now).map((e) => e.id)

  const [rsvps, attended, faces, mine, myAttendance] = await Promise.all([
    rsvpCounts(db, ids),
    attendanceCounts(db, ids),
    goingFaces(db, upcomingIds),
    viewer && ids.length > 0
      ? db
          .select({ eventId: schema.rsvp.eventId, status: schema.rsvp.status })
          .from(schema.rsvp)
          .where(
            and(eq(schema.rsvp.userId, viewer.id), inArray(schema.rsvp.eventId, ids)),
          )
      : Promise.resolve([]),
    viewer && ids.length > 0
      ? db
          .select({ eventId: schema.attendance.eventId })
          .from(schema.attendance)
          .where(
            and(
              eq(schema.attendance.userId, viewer.id),
              inArray(schema.attendance.eventId, ids),
            ),
          )
      : Promise.resolve([]),
  ])
  const myRsvp = new Map(mine.map((r) => [r.eventId, r.status]))
  const myAttended = new Set(myAttendance.map((r) => r.eventId))

  const rows = events.map((e) => {
    const c = rsvps.get(e.id) ?? { yes: 0, maybe: 0, no: 0 }
    const going = faces.get(e.id) ?? []
    return {
      ...e,
      going: c.yes,
      maybe: c.maybe,
      faces: going.slice(0, FACES),
      attended: attended.get(e.id) ?? 0,
      checkInLive: e.checkInOpen && checkInTiming(e, now) === 'open',
      viewerRsvp: myRsvp.get(e.id) ?? null,
      viewerAttended: myAttended.has(e.id),
    }
  })

  const tags = [...new Set(events.flatMap((e) => e.tags))]
  return {
    now: now.getTime(),
    upcoming: rows.filter((e) => e.endsAt >= now),
    past: rows.filter((e) => e.endsAt < now).reverse(),
    tags,
    feedUrl: siteUrl('/events/calendar.ics'),
  }
}

export type EventsPageData = Awaited<ReturnType<typeof listEventsData>>
export type EventCardData = EventsPageData['upcoming'][number]

/** One event for its public page. Never includes the check-in code. */
export async function getEventDetail(
  db: Db,
  eventId: string,
  viewer: Viewer | null,
  now = new Date(),
) {
  const ev = await db.query.event.findFirst({
    where: eq(schema.event.id, eventId),
    columns: { ...publicColumns, updatedAt: true },
  })
  if (!ev) return null

  const [rsvps, attended, faces, mine, myAttendance] = await Promise.all([
    rsvpCounts(db, [ev.id]),
    attendanceCounts(db, [ev.id]),
    goingFaces(db, [ev.id]),
    viewer
      ? db.query.rsvp.findFirst({
          where: and(eq(schema.rsvp.eventId, ev.id), eq(schema.rsvp.userId, viewer.id)),
          columns: { status: true },
        })
      : Promise.resolve(undefined),
    viewer
      ? db.query.attendance.findFirst({
          where: and(
            eq(schema.attendance.eventId, ev.id),
            eq(schema.attendance.userId, viewer.id),
          ),
          columns: { markedAt: true },
        })
      : Promise.resolve(undefined),
  ])
  const c = rsvps.get(ev.id) ?? { yes: 0, maybe: 0, no: 0 }
  const timing = checkInTiming(ev, now)
  const { updatedAt: _updated, ...rest } = ev

  return {
    now: now.getTime(),
    event: rest,
    going: faces.get(ev.id) ?? [],
    goingCount: c.yes,
    maybeCount: c.maybe,
    attendedCount: attended.get(ev.id) ?? 0,
    checkIn: {
      /** Members can type the code right now. */
      live: ev.checkInOpen && timing === 'open',
      timing,
      ...checkInWindow(ev),
    },
    viewer: viewer
      ? {
          rsvp: mine?.status ?? null,
          attendedAt: myAttendance?.markedAt ?? null,
        }
      : null,
    url: siteUrl(`/events/${ev.id}`),
  }
}

export type EventDetailData = NonNullable<Awaited<ReturnType<typeof getEventDetail>>>

// ---------- RSVP ----------

export class EventError extends Error {
  constructor(
    public readonly code: 'NOT_FOUND' | 'ENDED' | 'NOT_MEMBER',
    message: string,
  ) {
    super(message)
    this.name = 'EventError'
  }
}

/** Creates or changes a member's RSVP. Guests can't; closed once the event ends. */
export async function setRsvp(
  db: Db,
  input: { eventId: string; user: Viewer; status: RsvpStatus },
  now = new Date(),
) {
  if (!hasRole(input.user.role, 'member')) {
    throw new EventError('NOT_MEMBER', 'RSVPs are for club members. Apply to join first.')
  }
  const ev = await db.query.event.findFirst({
    where: eq(schema.event.id, input.eventId),
    columns: { id: true, endsAt: true },
  })
  if (!ev) throw new EventError('NOT_FOUND', 'That event no longer exists.')
  if (ev.endsAt < now) throw new EventError('ENDED', 'This event has already ended.')

  await db
    .insert(schema.rsvp)
    .values({ eventId: ev.id, userId: input.user.id, status: input.status })
    .onConflictDoUpdate({
      target: [schema.rsvp.eventId, schema.rsvp.userId],
      set: { status: input.status, updatedAt: new Date() },
    })
  const c = (await rsvpCounts(db, [ev.id])).get(ev.id) ?? { yes: 0, maybe: 0, no: 0 }
  return { status: input.status, going: c.yes, maybe: c.maybe }
}

// ---------- Check-in ----------

type EventRef = { id: string; title: string }

export type CheckInResult =
  | {
      status: 'checked-in'
      event: EventRef
      points: number
      badges: { id: string; name: string; rarity: string }[]
    }
  | { status: 'already'; event: EventRef; markedAt: Date }
  | { status: 'not-found' }
  | { status: 'guest'; event: EventRef }
  | { status: 'closed'; event: EventRef }
  | { status: 'early'; event: EventRef; opensAt: Date }
  | { status: 'late'; event: EventRef }
  | { status: 'wrong-code'; event: EventRef }

/**
 * A member checks themselves in with the event's code (typed, or from the
 * projector QR). Requires check-in open, the right code, and a time between
 * an hour before the start and three hours after the end. Repeat check-ins
 * are a no-op that reports "already".
 */
export async function checkIn(
  db: Db,
  input: { eventId: string; user: Viewer; code: string },
  now = new Date(),
): Promise<CheckInResult> {
  const ev = await db.query.event.findFirst({
    where: eq(schema.event.id, input.eventId),
    columns: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      checkInCode: true,
      checkInOpen: true,
    },
  })
  if (!ev) return { status: 'not-found' }
  const event = { id: ev.id, title: ev.title }
  if (!hasRole(input.user.role, 'member')) return { status: 'guest', event }

  const existing = await db.query.attendance.findFirst({
    where: and(
      eq(schema.attendance.eventId, ev.id),
      eq(schema.attendance.userId, input.user.id),
    ),
    columns: { markedAt: true },
  })
  if (existing) return { status: 'already', event, markedAt: existing.markedAt }

  if (!ev.checkInOpen || !ev.checkInCode) return { status: 'closed', event }
  const timing = checkInTiming(ev, now)
  if (timing === 'early') {
    return { status: 'early', event, opensAt: checkInWindow(ev).opensAt }
  }
  if (timing === 'late') return { status: 'late', event }
  if (!codesMatch(ev.checkInCode, input.code)) return { status: 'wrong-code', event }

  const inserted = await db
    .insert(schema.attendance)
    .values({
      eventId: ev.id,
      userId: input.user.id,
      markedBy: input.user.id,
      markedAt: now,
    })
    .onConflictDoNothing()
    .returning({ markedAt: schema.attendance.markedAt })
  // Lost a race with a second tab or a double scan: the other request won.
  if (inserted.length === 0) return { status: 'already', event, markedAt: now }

  const { attendance: amount } = await getSetting(db, 'points')
  const settled = await settlePoints(db, {
    userId: input.user.id,
    source: 'attendance',
    sourceId: ev.id,
    amount,
    note: `Checked in: ${ev.title}`,
    createdBy: input.user.id,
  })
  return { status: 'checked-in', event, points: amount, badges: settled.awarded }
}

/** What the check-in page needs before the visitor submits anything. */
export async function getCheckInContext(db: Db, eventId: string, viewer: Viewer | null) {
  const ev = await db.query.event.findFirst({
    where: eq(schema.event.id, eventId),
    columns: { id: true, title: true, startsAt: true, endsAt: true, location: true },
  })
  if (!ev) return null
  const attended = viewer
    ? await db.query.attendance.findFirst({
        where: and(
          eq(schema.attendance.eventId, ev.id),
          eq(schema.attendance.userId, viewer.id),
        ),
        columns: { markedAt: true },
      })
    : undefined
  const { attendance: points } = await getSetting(db, 'points')
  return { event: ev, attendedAt: attended?.markedAt ?? null, points }
}

// ---------- Calendar feeds ----------

function toCalendar(e: {
  id: string
  title: string
  description: string
  location: string
  startsAt: Date
  endsAt: Date
  updatedAt: Date
  tags: string[]
}): CalendarEvent {
  return { ...e, url: siteUrl(`/events/${e.id}`) }
}

const calendarColumns = {
  id: true,
  title: true,
  description: true,
  location: true,
  startsAt: true,
  endsAt: true,
  updatedAt: true,
  tags: true,
} as const

/** Upcoming events (and the last month, so subscribers keep recent history). */
export async function calendarFeed(db: Db, now = new Date()) {
  const rows = await db.query.event.findMany({
    where: gte(schema.event.endsAt, new Date(now.getTime() - FEED_PAST_WINDOW)),
    orderBy: asc(schema.event.startsAt),
    columns: calendarColumns,
  })
  return rows.map(toCalendar)
}

export async function calendarEvent(db: Db, eventId: string) {
  const row = await db.query.event.findFirst({
    where: eq(schema.event.id, eventId),
    columns: calendarColumns,
  })
  return row ? toCalendar(row) : null
}

// ---------- Admin ----------

/** Every event with RSVP and attendance tallies, newest first. */
export async function listAdminEvents(db: Db, now = new Date()) {
  const events = await db.query.event.findMany({
    orderBy: desc(schema.event.startsAt),
    columns: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      location: true,
      tags: true,
      checkInOpen: true,
    },
  })
  const ids = events.map((e) => e.id)
  const [rsvps, attended] = await Promise.all([
    rsvpCounts(db, ids),
    attendanceCounts(db, ids),
  ])
  return {
    now: now.getTime(),
    events: events.map((e) => {
      const c = rsvps.get(e.id) ?? { yes: 0, maybe: 0, no: 0 }
      return {
        ...e,
        going: c.yes,
        maybe: c.maybe,
        declined: c.no,
        attended: attended.get(e.id) ?? 0,
      }
    }),
  }
}

export type AdminEventRow = Awaited<ReturnType<typeof listAdminEvents>>['events'][number]

/** Form values for editing, with times as club-local `datetime-local` strings. */
export async function getEventForm(db: Db, eventId: string) {
  const ev = await db.query.event.findFirst({ where: eq(schema.event.id, eventId) })
  if (!ev) return null
  const values: EventFormValues = {
    title: ev.title,
    description: ev.description,
    startsAt: toClubLocalInput(ev.startsAt),
    endsAt: toClubLocalInput(ev.endsAt),
    location: ev.location,
    tags: ev.tags,
    coverKey: ev.coverKey,
  }
  return { id: ev.id, values }
}

export async function saveEvent(
  db: Db,
  input: {
    id?: string
    values: {
      title: string
      description: string
      startsAt: string
      endsAt: string
      location: string
      tags: string[]
      coverKey: string | null
    }
    userId: string
  },
) {
  const { values } = input
  const startsAt = clubLocalToDate(values.startsAt)
  const endsAt = clubLocalToDate(values.endsAt)
  const row = {
    title: values.title,
    description: values.description,
    startsAt,
    endsAt,
    location: values.location,
    tags: [...new Set(values.tags)],
    coverKey: values.coverKey,
  }

  if (input.id) {
    const before = await db.query.event.findFirst({
      where: eq(schema.event.id, input.id),
      columns: { startsAt: true },
    })
    if (!before) throw new EventError('NOT_FOUND', 'That event no longer exists.')
    await db
      .update(schema.event)
      .set({
        ...row,
        // Moved to a new time: let the reminder go out again for the new date.
        ...(before.startsAt.getTime() !== startsAt.getTime()
          ? { reminderSentAt: null }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.event.id, input.id))
    return { id: input.id }
  }

  const [created] = await db
    .insert(schema.event)
    .values({ ...row, createdBy: input.userId })
    .returning({ id: schema.event.id })
  return { id: created.id }
}

/** Deletes an event and reverses any attendance points it granted. */
export async function deleteEvent(db: Db, eventId: string) {
  const holders = await db
    .selectDistinct({ userId: schema.pointEntry.userId })
    .from(schema.pointEntry)
    .where(
      and(
        eq(schema.pointEntry.source, 'attendance'),
        eq(schema.pointEntry.sourceId, eventId),
      ),
    )
  const deleted = await db
    .delete(schema.event)
    .where(eq(schema.event.id, eventId))
    .returning({ id: schema.event.id })
  if (deleted.length === 0)
    throw new EventError('NOT_FOUND', 'That event no longer exists.')
  for (const h of holders) {
    await settlePoints(db, {
      userId: h.userId,
      source: 'attendance',
      sourceId: eventId,
      amount: 0,
      note: 'Event deleted',
    })
  }
  return { reversed: holders.length }
}

export async function regenerateCheckInCode(db: Db, eventId: string) {
  const code = generateCheckInCode()
  const updated = await db
    .update(schema.event)
    .set({ checkInCode: code, updatedAt: new Date() })
    .where(eq(schema.event.id, eventId))
    .returning({ id: schema.event.id })
  if (updated.length === 0)
    throw new EventError('NOT_FOUND', 'That event no longer exists.')
  return { code }
}

/** Opens or closes check-in. Opening generates a code if there isn't one yet. */
export async function setCheckInOpen(db: Db, eventId: string, open: boolean) {
  const ev = await db.query.event.findFirst({
    where: eq(schema.event.id, eventId),
    columns: { checkInCode: true },
  })
  if (!ev) throw new EventError('NOT_FOUND', 'That event no longer exists.')
  const code = ev.checkInCode ?? (open ? generateCheckInCode() : null)
  await db
    .update(schema.event)
    .set({ checkInOpen: open, checkInCode: code, updatedAt: new Date() })
    .where(eq(schema.event.id, eventId))
  return { open, code }
}

function checkInUrl(eventId: string, code: string | null) {
  return code
    ? siteUrl(`/events/${eventId}/check-in?code=${encodeURIComponent(code)}`)
    : null
}

/** The officer's attendance page: check-in controls plus everyone who RSVPed or came. */
export async function getAttendanceSheet(db: Db, eventId: string, now = new Date()) {
  const ev = await db.query.event.findFirst({
    where: eq(schema.event.id, eventId),
    columns: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      location: true,
      checkInCode: true,
      checkInOpen: true,
    },
  })
  if (!ev) return null

  const [rsvps, attendees, points] = await Promise.all([
    db
      .select({
        status: schema.rsvp.status,
        ...userColumns,
        email: schema.user.email,
        role: schema.user.role,
      })
      .from(schema.rsvp)
      .innerJoin(schema.user, eq(schema.user.id, schema.rsvp.userId))
      .where(eq(schema.rsvp.eventId, ev.id)),
    db
      .select({
        userId: schema.attendance.userId,
        markedAt: schema.attendance.markedAt,
        markedBy: schema.attendance.markedBy,
      })
      .from(schema.attendance)
      .where(eq(schema.attendance.eventId, ev.id)),
    getSetting(db, 'points'),
  ])

  // Users who came without RSVPing, plus the names of whoever marked them.
  const known = new Set(rsvps.map((r) => r.id))
  const extraIds = [
    ...new Set([
      ...attendees.map((a) => a.userId).filter((id) => !known.has(id)),
      ...attendees.map((a) => a.markedBy).filter((id): id is string => !!id),
    ]),
  ]
  const extras =
    extraIds.length > 0
      ? await db
          .select({ ...userColumns, email: schema.user.email, role: schema.user.role })
          .from(schema.user)
          .where(inArray(schema.user.id, extraIds))
      : []
  const people = new Map(
    [...rsvps.map(({ status: _s, ...u }) => u), ...extras].map((u) => [u.id, u]),
  )
  const rsvpOf = new Map(rsvps.map((r) => [r.id, r.status]))
  const attendanceOf = new Map(attendees.map((a) => [a.userId, a]))

  const ids = new Set([...rsvps.map((r) => r.id), ...attendees.map((a) => a.userId)])
  const order = { yes: 0, maybe: 1, no: 2 } as const
  const roster = [...ids]
    .map((id) => {
      const u = people.get(id)!
      const a = attendanceOf.get(id)
      return {
        user: u,
        rsvp: rsvpOf.get(id) ?? null,
        attendance: a
          ? {
              markedAt: a.markedAt,
              self: a.markedBy === id,
              markedByName: a.markedBy ? (people.get(a.markedBy)?.name ?? null) : null,
            }
          : null,
      }
    })
    .sort((x, y) => {
      if (!!x.attendance !== !!y.attendance) return x.attendance ? -1 : 1
      const rx = x.rsvp ? order[x.rsvp] : 3
      const ry = y.rsvp ? order[y.rsvp] : 3
      return rx - ry || x.user.name.localeCompare(y.user.name)
    })

  return {
    now: now.getTime(),
    event: ev,
    window: checkInWindow(ev),
    timing: checkInTiming(ev, now),
    checkInUrl: checkInUrl(ev.id, ev.checkInCode),
    points: points.attendance,
    roster,
    counts: {
      going: rsvps.filter((r) => r.status === 'yes').length,
      maybe: rsvps.filter((r) => r.status === 'maybe').length,
      declined: rsvps.filter((r) => r.status === 'no').length,
      attended: attendees.length,
    },
  }
}

export type AttendanceSheet = NonNullable<Awaited<ReturnType<typeof getAttendanceSheet>>>

/** Members (not guests) matching a name or email, flagged if already marked present. */
export async function searchMembers(db: Db, eventId: string, query: string) {
  const q = query.trim()
  if (q.length < 1) return []
  const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`
  const rows = await db
    .select({ ...userColumns, email: schema.user.email, role: schema.user.role })
    .from(schema.user)
    .where(
      and(
        inArray(schema.user.role, MEMBER_ROLES),
        or(like(schema.user.name, pattern), like(schema.user.email, pattern)),
      ),
    )
    .orderBy(asc(schema.user.name))
    .limit(8)
  if (rows.length === 0) return []
  const present = await db
    .select({ userId: schema.attendance.userId })
    .from(schema.attendance)
    .where(
      and(
        eq(schema.attendance.eventId, eventId),
        inArray(
          schema.attendance.userId,
          rows.map((r) => r.id),
        ),
      ),
    )
  const marked = new Set(present.map((p) => p.userId))
  return rows.map((r) => ({ ...r, present: marked.has(r.id) }))
}

/**
 * An officer marks a member present (attendance row + the configured points)
 * or absent (row removed, points settled back to 0).
 */
export async function markAttendance(
  db: Db,
  input: { eventId: string; userId: string; present: boolean; markedBy: string },
) {
  const [ev, member] = await Promise.all([
    db.query.event.findFirst({
      where: eq(schema.event.id, input.eventId),
      columns: { id: true, title: true },
    }),
    db.query.user.findFirst({
      where: eq(schema.user.id, input.userId),
      columns: { id: true, role: true },
    }),
  ])
  if (!ev) throw new EventError('NOT_FOUND', 'That event no longer exists.')
  if (!member || !hasRole(member.role, 'member')) {
    throw new EventError('NOT_MEMBER', 'Only members can be marked present.')
  }

  if (input.present) {
    await db
      .insert(schema.attendance)
      .values({ eventId: ev.id, userId: member.id, markedBy: input.markedBy })
      .onConflictDoNothing()
  } else {
    await db
      .delete(schema.attendance)
      .where(
        and(
          eq(schema.attendance.eventId, ev.id),
          eq(schema.attendance.userId, member.id),
        ),
      )
  }
  const { attendance } = await getSetting(db, 'points')
  const settled = await settlePoints(db, {
    userId: member.id,
    source: 'attendance',
    sourceId: ev.id,
    amount: input.present ? attendance : 0,
    note: input.present ? `Marked present: ${ev.title}` : `Marked absent: ${ev.title}`,
    createdBy: input.markedBy,
  })
  return { present: input.present, delta: settled.delta }
}

/** The projector view: code, QR target, and a live count with the latest arrivals. */
export async function getPresentData(db: Db, eventId: string, now = new Date()) {
  const ev = await db.query.event.findFirst({
    where: eq(schema.event.id, eventId),
    columns: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      location: true,
      checkInCode: true,
      checkInOpen: true,
    },
  })
  if (!ev) return null
  const [total, recent, going] = await Promise.all([
    db
      .select({ n: count() })
      .from(schema.attendance)
      .where(eq(schema.attendance.eventId, ev.id)),
    db
      .select({ ...userColumns, markedAt: schema.attendance.markedAt })
      .from(schema.attendance)
      .innerJoin(schema.user, eq(schema.user.id, schema.attendance.userId))
      .where(eq(schema.attendance.eventId, ev.id))
      .orderBy(desc(schema.attendance.markedAt))
      .limit(12),
    db
      .select({ n: count() })
      .from(schema.rsvp)
      .where(and(eq(schema.rsvp.eventId, ev.id), eq(schema.rsvp.status, 'yes'))),
  ])
  return {
    now: now.getTime(),
    event: ev,
    timing: checkInTiming(ev, now),
    checkInUrl: checkInUrl(ev.id, ev.checkInCode),
    shortUrl: siteUrl('/events').replace(/^https?:\/\//, ''),
    count: total[0]?.n ?? 0,
    going: going[0]?.n ?? 0,
    recent,
  }
}

export type PresentData = NonNullable<Awaited<ReturnType<typeof getPresentData>>>

// ---------- Cron ----------

/**
 * Emails members who RSVPed yes or maybe about events starting in the next
 * 24 hours, once per event: the event is claimed (reminderSentAt set) before
 * anything is sent, so overlapping or repeated ticks never double-send.
 */
export async function sendEventReminders(db: Db, now: Date) {
  const due = await db.query.event.findMany({
    where: and(
      gt(schema.event.startsAt, now),
      lte(schema.event.startsAt, new Date(now.getTime() + DAY)),
      isNull(schema.event.reminderSentAt),
    ),
    columns: { id: true, title: true, startsAt: true, endsAt: true, location: true },
  })

  let events = 0
  let sent = 0
  for (const ev of due) {
    const claimed = await db
      .update(schema.event)
      .set({ reminderSentAt: now })
      .where(and(eq(schema.event.id, ev.id), isNull(schema.event.reminderSentAt)))
      .returning({ id: schema.event.id })
    if (claimed.length === 0) continue
    events++

    const rsvps = await db
      .select({ userId: schema.rsvp.userId, status: schema.rsvp.status })
      .from(schema.rsvp)
      .where(
        and(
          eq(schema.rsvp.eventId, ev.id),
          inArray(schema.rsvp.status, ['yes', 'maybe']),
        ),
      )

    const messages: EmailMessage[] = []
    for (const r of rsvps) {
      const to = await recipientById(db, r.userId, 'eventReminder')
      if (!to) continue
      messages.push(reminderEmail(ev, to, r.status))
    }
    const result = await sendEmails(db, messages)
    sent += result.sent + result.logged
  }
  return { events, sent }
}

function reminderEmail(
  ev: { id: string; title: string; startsAt: Date; endsAt: Date; location: string },
  to: { email: string; name: string },
  status: RsvpStatus,
): EmailMessage {
  const when = fmtEventWhen(ev.startsAt, ev.endsAt)
  const first = to.name.split(/\s+/)[0] || 'there'
  const { html, text } = renderEmail({
    preheader: `${fmtDate(ev.startsAt, 'datetime')} at ${ev.location}`,
    heading: `${ev.title} is coming up`,
    paragraphs: [
      `Hi ${first}, a reminder that ${ev.title} starts ${fmtDate(ev.startsAt, 'weekday')} at ${fmtDate(ev.startsAt, 'time')}.`,
      `When: ${when}`,
      `Where: ${ev.location}`,
      status === 'maybe'
        ? 'You said maybe. If you can make it, switch your RSVP to going so we know to save you a seat.'
        : 'Check in when you get there to earn your attendance points.',
    ],
    cta: { label: 'View the event', href: siteUrl(`/events/${ev.id}`) },
    ...prefsFooter(),
  })
  return {
    to: to.email,
    subject: `Reminder: ${ev.title}, ${fmtDate(ev.startsAt, 'datetime')}`,
    html,
    text,
  }
}
