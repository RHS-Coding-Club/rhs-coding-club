import { describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { subscribeEmail } from '#/services/newsletter'

const db = getDb()

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
    const before = await db.query.newsletterSubscriber.findFirst({
      where: eq(schema.newsletterSubscriber.email, 'dup@test.local'),
    })
    const again = await subscribeEmail(db, '  DUP@test.local ')
    expect(again.created).toBe(false)
    const rows = await db
      .select()
      .from(schema.newsletterSubscriber)
      .where(eq(schema.newsletterSubscriber.email, 'dup@test.local'))
    expect(rows).toHaveLength(1)
    expect(rows[0].unsubscribeToken).toBe(before?.unsubscribeToken)
  })
})
