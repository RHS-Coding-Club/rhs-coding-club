import { describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { officerSchema } from '#/lib/schemas/officers'
import {
  deleteMessage,
  getContactPage,
  listMessages,
  setMessageRead,
  submitContactMessage,
  unreadCount,
} from '#/services/contact'
import { saveOfficer } from '#/services/officers'

const db = getDb()

const base = {
  name: 'Parent Person',
  email: 'Parent@Example.com',
  subject: 'Hackathon question',
  message: 'Is the H2O hackathon open to freshmen this year?',
}

describe('submitContactMessage', () => {
  it('stores a real message with a lowercased email', async () => {
    const r = await submitContactMessage(db, base)
    expect(r.stored).toBe(true)
    const rows = await db.select().from(schema.contactMessage)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ email: 'parent@example.com', readAt: null })
  })

  it('drops a message whose honeypot is filled', async () => {
    const r = await submitContactMessage(db, {
      ...base,
      email: 'bot@spam.test',
      website: 'http://spam.test',
    })
    expect(r.stored).toBe(false)
    const rows = await db.select().from(schema.contactMessage)
    expect(rows.some((m) => m.email === 'bot@spam.test')).toBe(false)
  })

  it('slows down an address that sends too many in a row', async () => {
    const now = new Date()
    const msg = { ...base, email: 'eager@test.local' }
    await submitContactMessage(db, msg, now)
    await submitContactMessage(db, msg, now)
    await submitContactMessage(db, msg, now)
    await expect(submitContactMessage(db, msg, now)).rejects.toThrow(/few messages/)
  })
})

describe('inbox', () => {
  it('lists unread first, marks read and unread, deletes', async () => {
    const all = await listMessages(db)
    const first = all[0]
    await setMessageRead(db, first.id, true)
    let list = await listMessages(db)
    expect(list[list.length - 1].id).toBe(first.id)
    expect(await unreadCount(db)).toBe(all.length - 1)

    await setMessageRead(db, first.id, false)
    expect(await unreadCount(db)).toBe(all.length)

    await deleteMessage(db, first.id)
    list = await listMessages(db)
    expect(list.some((m) => m.id === first.id)).toBe(false)
  })
})

describe('getContactPage', () => {
  it('lists active officers in order, with only their name and photo', async () => {
    const make = (name: string, isActive = true) =>
      officerSchema.parse({
        name,
        title: 'Officer',
        bio: 'Private bio',
        email: 'officer@example.com',
        githubUrl: '',
        imageKey: null,
        isActive,
      })
    await saveOfficer(db, make('Ana'))
    await saveOfficer(db, make('Ben', false))
    await saveOfficer(db, make('Cam'))

    const page = await getContactPage(db)
    expect(page.officers.map((o) => o.name)).toEqual(['Ana', 'Cam'])
    expect(Object.keys(page.officers[0]).sort()).toEqual(['id', 'imageKey', 'name'])
    expect(page.club.meetingSchedule).toBeTruthy()
  })
})
