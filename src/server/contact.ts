import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import { contactSchema, markMessageSchema, messageIdSchema } from '#/lib/schemas/contact'
import { requireOfficer } from '#/server/auth'
import * as contact from '#/services/contact'
import { getSetting } from '#/services/settings'

// ---------- Public ----------

/** /contact side column: when and where the club meets, and its socials. */
export const getContactInfo = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  const [club, social] = await Promise.all([
    getSetting(db, 'club-info'),
    getSetting(db, 'social'),
  ])
  return {
    club: {
      clubName: club.clubName,
      meetingSchedule: club.meetingSchedule,
      meetingLocation: club.meetingLocation,
    },
    social,
  }
})

export const sendContactMessage = createServerFn({ method: 'POST' })
  .validator(contactSchema)
  .handler(async ({ data }) => {
    await contact.submitContactMessage(getDb(), data)
    // Same answer whether or not the honeypot tripped.
    return { ok: true as const }
  })

// ---------- Officers ----------

export const listMessages = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => contact.listMessages(getDb()))

export const markMessage = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(markMessageSchema)
  .handler(({ data }) => contact.setMessageRead(getDb(), data.id, data.read))

export const deleteMessage = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(messageIdSchema)
  .handler(async ({ data }) => {
    await contact.deleteMessage(getDb(), data.id)
    return { ok: true as const }
  })
