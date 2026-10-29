import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { getDb, schema } from '#/db'
import {
  deleteIssueDraft,
  issueEmail,
  resubscribeByToken,
  saveIssueDraft,
  sendIssue,
  subscribeEmail,
  subscriberByToken,
  unsubscribeByToken,
} from '#/services/newsletter'

const db = getDb()

const content = JSON.stringify({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'H2O signups open Friday.' }] },
  ],
})

async function tokenOf(email: string) {
  const row = await db.query.newsletterSubscriber.findFirst({
    where: eq(schema.newsletterSubscriber.email, email),
  })
  if (!row) throw new Error(`no subscriber ${email}`)
  return row.unsubscribeToken
}

beforeAll(async () => {
  await db
    .insert(schema.user)
    .values({ id: 'u_off', name: 'Olive', email: 'olive@test.local', role: 'officer' })
})

describe('subscribeEmail', () => {
  it('inserts a subscriber with a fresh unsubscribe token', async () => {
    const result = await subscribeEmail(db, 'Ada@Test.local')
    expect(result).toEqual({ email: 'ada@test.local', created: true })
    const row = await db.query.newsletterSubscriber.findFirst({
      where: eq(schema.newsletterSubscriber.email, 'ada@test.local'),
    })
    expect(row?.unsubscribeToken).toMatch(/^[0-9a-f-]{36}$/)
    expect(row?.unsubscribedAt).toBeNull()
  })

  it('treats a duplicate (any case) as a no-op', async () => {
    await subscribeEmail(db, 'dup@test.local')
    const before = await tokenOf('dup@test.local')
    const again = await subscribeEmail(db, '  DUP@test.local ')
    expect(again.created).toBe(false)
    const rows = await db
      .select()
      .from(schema.newsletterSubscriber)
      .where(eq(schema.newsletterSubscriber.email, 'dup@test.local'))
    expect(rows).toHaveLength(1)
    expect(rows[0].unsubscribeToken).toBe(before)
  })
})

describe('unsubscribe by token', () => {
  it('looking a token up never changes anything', async () => {
    await subscribeEmail(db, 'reader@test.local')
    const token = await tokenOf('reader@test.local')
    expect(await subscriberByToken(db, token)).toEqual({
      status: 'active',
      email: 'reader@test.local',
    })
    // Visiting the page (a GET) only reads; still subscribed afterwards.
    await subscriberByToken(db, token)
    const row = await db.query.newsletterSubscriber.findFirst({
      where: eq(schema.newsletterSubscriber.unsubscribeToken, token),
    })
    expect(row?.unsubscribedAt).toBeNull()
  })

  it('unsubscribes, is idempotent, and can be undone with the same token', async () => {
    const token = await tokenOf('reader@test.local')
    const first = await unsubscribeByToken(db, token, new Date(1000))
    expect(first.status).toBe('unsubscribed')
    const again = await unsubscribeByToken(db, token, new Date(2000))
    expect(again.status).toBe('unsubscribed')
    const row = await db.query.newsletterSubscriber.findFirst({
      where: eq(schema.newsletterSubscriber.unsubscribeToken, token),
    })
    expect(row?.unsubscribedAt?.getTime()).toBe(1000)

    expect((await resubscribeByToken(db, token)).status).toBe('active')
    expect((await subscriberByToken(db, token)).status).toBe('active')
  })

  it('reports an unknown token as invalid', async () => {
    expect(await unsubscribeByToken(db, 'not-a-real-token')).toEqual({
      status: 'invalid',
    })
  })
})

describe('issues', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    env.RESEND_API_KEY = ''
  })

  it('builds a per-recipient email with List-Unsubscribe', () => {
    const m = issueEmail(
      { subject: 'Hello', content },
      'a@test.local',
      'https://x.test/u?t=1',
    )
    expect(m.headers).toEqual({ 'List-Unsubscribe': '<https://x.test/u?t=1>' })
    expect(m.html).toContain('H2O signups open Friday.')
    expect(m.html).toContain('https://x.test/u?t=1')
    expect(m.text).toContain('H2O signups open Friday.')
  })

  it('sends once, only to active subscribers, each with their own link', async () => {
    await subscribeEmail(db, 'gone@test.local')
    await unsubscribeByToken(db, await tokenOf('gone@test.local'))

    env.RESEND_API_KEY = 're_test'
    env.EMAIL_FROM = 'club@test.local'
    const sent: { to: string[]; headers?: Record<string, string>; html: string }[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      sent.push(...(JSON.parse(String(init?.body)) as typeof sent))
      return new Response('{}', { status: 200 })
    })

    const { id } = await saveIssueDraft(db, 'u_off', {
      subject: 'October update',
      content,
    })
    const result = await sendIssue(db, id, new Date(5000))

    const active = ['ada@test.local', 'dup@test.local', 'reader@test.local']
    expect(result).toMatchObject({ recipients: 3, sent: 3, failed: 0 })
    expect(sent.map((m) => m.to[0]).sort()).toEqual(active)
    for (const m of sent) {
      const token = await tokenOf(m.to[0])
      expect(m.headers?.['List-Unsubscribe']).toContain(`token=${token}`)
      expect(m.html).toContain(`token=${token}`)
    }

    const issue = await db.query.newsletterIssue.findFirst({
      where: eq(schema.newsletterIssue.id, id),
    })
    expect(issue?.sentAt?.getTime()).toBe(5000)
    expect(issue?.recipientCount).toBe(3)

    // A second send (double click, second officer) is refused and mails nobody.
    await expect(sendIssue(db, id)).rejects.toThrow(/already sent/)
    expect(sent).toHaveLength(3)

    // Sent issues are frozen.
    await expect(
      saveIssueDraft(db, 'u_off', { id, subject: 'Edited', content }),
    ).rejects.toThrow(/already sent/)
    await expect(deleteIssueDraft(db, id)).rejects.toThrow()
  })
})
