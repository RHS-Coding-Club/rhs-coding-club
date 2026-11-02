import { describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import {
  deleteMessage,
  listMessages,
  setMessageRead,
  submitContactMessage,
  unreadCount,
} from '#/services/contact'

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
