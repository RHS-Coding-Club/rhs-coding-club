import type { Db } from '#/db'
import { schema } from '#/db'

/**
 * Adds an address to the newsletter list. Emails are stored lowercase and
 * trimmed so the unique index catches case variants; an existing row is left
 * untouched (the unsubscribe token must stay stable once mailed out).
 */
export async function subscribeEmail(db: Db, email: string) {
  const normalized = email.trim().toLowerCase()
  const inserted = await db
    .insert(schema.newsletterSubscriber)
    .values({ email: normalized, unsubscribeToken: crypto.randomUUID() })
    .onConflictDoNothing({ target: schema.newsletterSubscriber.email })
    .returning({ id: schema.newsletterSubscriber.id })
  return { email: normalized, created: inserted.length > 0 }
}
