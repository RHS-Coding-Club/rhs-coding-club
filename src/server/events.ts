import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getDb } from '#/db'
import { getAuth } from '#/lib/auth'
import { isRole } from '#/lib/roles'
import {
  checkInSchema,
  eventIdSchema,
  markAttendanceSchema,
  memberSearchSchema,
  rsvpSchema,
  saveEventSchema,
  setCheckInSchema,
} from '#/lib/schemas/events'
import { requireMember, requireOfficer, requireUser } from '#/server/auth'
import * as events from '#/services/events'
import type { Viewer } from '#/services/events'

/** The signed-in viewer for public reads (their RSVP, their attendance), or null. */
async function viewer(): Promise<Viewer | null> {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() })
  if (!session) return null
  const role = (session.user as { role?: unknown }).role
  return { id: session.user.id, role: isRole(role) ? role : 'guest' }
}

// ---------- Public ----------

export const listEvents = createServerFn({ method: 'GET' }).handler(async () =>
  events.listEventsData(getDb(), await viewer()),
)

export const getEvent = createServerFn({ method: 'GET' })
  .validator(eventIdSchema)
  .handler(async ({ data }) => {
    const detail = await events.getEventDetail(getDb(), data.eventId, await viewer())
    if (!detail) throw notFound()
    return detail
  })

export const getCheckIn = createServerFn({ method: 'GET' })
  .validator(eventIdSchema)
  .handler(async ({ data }) => {
    const ctx = await events.getCheckInContext(getDb(), data.eventId, await viewer())
    if (!ctx) throw notFound()
    return ctx
  })

// ---------- Members ----------

export const rsvpToEvent = createServerFn({ method: 'POST' })
  .middleware([requireMember])
  .validator(rsvpSchema)
  .handler(({ data, context }) =>
    events.setRsvp(getDb(), {
      eventId: data.eventId,
      status: data.status,
      user: { id: context.user.id, role: context.user.role },
    }),
  )

/**
 * Typed code on the event page and the QR link both land here. Any signed-in
 * user may call it so guests get a "become a member" answer instead of a
 * bare 403; the service refuses to record attendance for them.
 */
export const checkInToEvent = createServerFn({ method: 'POST' })
  .middleware([requireUser])
  .validator(checkInSchema)
  .handler(({ data, context }) =>
    events.checkIn(getDb(), {
      eventId: data.eventId,
      code: data.code,
      user: { id: context.user.id, role: context.user.role },
    }),
  )

// ---------- Officers ----------

export const listAdminEvents = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => events.listAdminEvents(getDb()))

export const getEventForm = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(eventIdSchema)
  .handler(async ({ data }) => {
    const form = await events.getEventForm(getDb(), data.eventId)
    if (!form) throw notFound()
    return form
  })

export const saveEvent = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(saveEventSchema)
  .handler(({ data, context }) =>
    events.saveEvent(getDb(), { ...data, userId: context.user.id }),
  )

export const deleteEvent = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(eventIdSchema)
  .handler(({ data }) => events.deleteEvent(getDb(), data.eventId))

export const regenerateCheckInCode = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(eventIdSchema)
  .handler(({ data }) => events.regenerateCheckInCode(getDb(), data.eventId))

export const setCheckIn = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(setCheckInSchema)
  .handler(({ data }) => events.setCheckInOpen(getDb(), data.eventId, data.open))

export const getAttendance = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(eventIdSchema)
  .handler(async ({ data }) => {
    const sheet = await events.getAttendanceSheet(getDb(), data.eventId)
    if (!sheet) throw notFound()
    return sheet
  })

export const searchMembersForEvent = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(memberSearchSchema)
  .handler(({ data }) => events.searchMembers(getDb(), data.eventId, data.query))

export const markAttendance = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(markAttendanceSchema)
  .handler(({ data, context }) =>
    events.markAttendance(getDb(), { ...data, markedBy: context.user.id }),
  )

export const getPresent = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(eventIdSchema)
  .handler(async ({ data }) => {
    const present = await events.getPresentData(getDb(), data.eventId)
    if (!present) throw notFound()
    return present
  })
