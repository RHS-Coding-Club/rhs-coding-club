import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { env } from 'cloudflare:workers'
import { WorkerMailer } from 'worker-mailer'
import { getDb, schema } from '#/db'
import { sendEmail, sendEmails } from '#/services/email'
import { fakeMailer } from './fake-mailer'

const db = getDb()
const now = new Date(Date.UTC(2026, 10, 2, 12))
const nextDay = new Date(Date.UTC(2026, 10, 3, 12))
const mail = (to: string) => ({ to, subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' })
const many = (n: number) => Array.from({ length: n }, (_, i) => mail(`m${i}@test.local`))

beforeEach(async () => {
  await db.delete(schema.setting)
})

afterEach(() => {
  vi.restoreAllMocks()
  env.GMAIL_APP_PASSWORD = ''
})

describe('sendEmails', () => {
  it('only logs until the app password is set', async () => {
    const connect = vi.spyOn(WorkerMailer, 'connect')
    const r = await sendEmail(db, mail('a@test.local'))
    expect(r).toEqual({ sent: 0, logged: 1, failed: 0 })
    expect(connect).not.toHaveBeenCalled()
  })

  it('sends over one Gmail connection as the club account', async () => {
    const { sent, connect } = fakeMailer()
    const r = await sendEmails(db, many(3), now)
    expect(r).toEqual({ sent: 3, logged: 0, failed: 0 })
    expect(connect).toHaveBeenCalledTimes(1)
    expect(connect.mock.calls[0]?.[0]).toMatchObject({
      host: 'smtp.gmail.com',
      port: 465,
      credentials: { username: env.GMAIL_USER, password: 'test-app-password' },
    })
    expect(sent.map((m) => m.to)).toEqual([
      'm0@test.local',
      'm1@test.local',
      'm2@test.local',
    ])
  })

  it('stops a broadcast at 400 a day but keeps room for one-off emails', async () => {
    const { sent } = fakeMailer()
    expect(await sendEmails(db, many(450), now)).toMatchObject({ sent: 400, failed: 50 })
    expect(await sendEmails(db, many(5), now)).toMatchObject({ sent: 0, failed: 5 })
    // A password reset still goes out.
    expect(await sendEmails(db, [mail('reset@test.local')], now)).toMatchObject({
      sent: 1,
    })
    expect(sent).toHaveLength(401)
    // The allowance starts over the next day.
    expect(await sendEmails(db, many(5), nextDay)).toMatchObject({ sent: 5, failed: 0 })
  })

  it('counts a failed connection instead of throwing', async () => {
    fakeMailer()
    vi.spyOn(WorkerMailer, 'connect').mockRejectedValue(new Error('refused'))
    expect(await sendEmails(db, many(2), now)).toEqual({ sent: 0, logged: 0, failed: 2 })
  })
})
