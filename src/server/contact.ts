import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { getDb } from '#/db'
import { isRateLimited } from '#/lib/rate-limit'
import { contactSchema, markMessageSchema, messageIdSchema } from '#/lib/schemas/contact'
import { TURNSTILE_ACTIONS, TURNSTILE_FAILED } from '#/lib/turnstile'
import { requireOfficer } from '#/server/auth'
import * as contact from '#/services/contact'
import { getSetting } from '#/services/settings'
import { passesTurnstile } from '#/services/turnstile'

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
    const ip = getRequestHeaders().get('cf-connecting-ip')
    if (await isRateLimited(env.FORM_LIMIT, ip))
      throw new contact.ContactError('Too many messages. Try again in a minute.')
    const { turnstileToken, ...message } = data
    if (!(await passesTurnstile(TURNSTILE_ACTIONS.contact, turnstileToken, ip)))
      throw new contact.ContactError(TURNSTILE_FAILED)
    await contact.submitContactMessage(getDb(), message)
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
