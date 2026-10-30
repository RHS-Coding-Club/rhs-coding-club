import { and, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import { parseRichText, plainText, richTextToEmailHtml } from '#/lib/rich-text'
import type { IssueInput } from '#/lib/schemas/newsletter'
import { newsletterRecipients, sendEmail, sendEmails } from './email'
import type { EmailMessage } from './email'
import { renderEmail, siteUrl } from './email-templates'

export class NewsletterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NewsletterError'
  }
}

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

// ---------- unsubscribe by token ----------

export type TokenState =
  { status: 'invalid' } | { status: 'active' | 'unsubscribed'; email: string }

/** What the unsubscribe page shows for a token. Read-only. */
export async function subscriberByToken(db: Db, token: string): Promise<TokenState> {
  const row = await db.query.newsletterSubscriber.findFirst({
    where: eq(schema.newsletterSubscriber.unsubscribeToken, token),
    columns: { email: true, unsubscribedAt: true },
  })
  if (!row) return { status: 'invalid' }
  return { status: row.unsubscribedAt ? 'unsubscribed' : 'active', email: row.email }
}

/** Unsubscribes the token's address. Repeats are a no-op. */
export async function unsubscribeByToken(db: Db, token: string, now = new Date()) {
  const state = await subscriberByToken(db, token)
  if (state.status === 'invalid') return state
  await db
    .update(schema.newsletterSubscriber)
    .set({ unsubscribedAt: now })
    .where(
      and(
        eq(schema.newsletterSubscriber.unsubscribeToken, token),
        isNull(schema.newsletterSubscriber.unsubscribedAt),
      ),
    )
  return { status: 'unsubscribed' as const, email: state.email }
}

/** Undo from the "you're unsubscribed" screen. Keeps the same token. */
export async function resubscribeByToken(db: Db, token: string) {
  const state = await subscriberByToken(db, token)
  if (state.status === 'invalid') return state
  await db
    .update(schema.newsletterSubscriber)
    .set({ unsubscribedAt: null, subscribedAt: new Date() })
    .where(eq(schema.newsletterSubscriber.unsubscribeToken, token))
  return { status: 'active' as const, email: state.email }
}

// ---------- admin: subscribers and issues ----------

export async function listSubscribers(db: Db) {
  return db
    .select({
      id: schema.newsletterSubscriber.id,
      email: schema.newsletterSubscriber.email,
      subscribedAt: schema.newsletterSubscriber.subscribedAt,
      unsubscribedAt: schema.newsletterSubscriber.unsubscribedAt,
    })
    .from(schema.newsletterSubscriber)
    .orderBy(desc(schema.newsletterSubscriber.subscribedAt))
}

export async function listIssues(db: Db) {
  return db
    .select({
      id: schema.newsletterIssue.id,
      subject: schema.newsletterIssue.subject,
      content: schema.newsletterIssue.content,
      sentAt: schema.newsletterIssue.sentAt,
      recipientCount: schema.newsletterIssue.recipientCount,
      createdAt: schema.newsletterIssue.createdAt,
      updatedAt: schema.newsletterIssue.updatedAt,
      createdByName: schema.user.name,
    })
    .from(schema.newsletterIssue)
    .leftJoin(schema.user, eq(schema.user.id, schema.newsletterIssue.createdBy))
    .orderBy(
      desc(sql`${schema.newsletterIssue.sentAt} IS NULL`),
      desc(schema.newsletterIssue.sentAt),
      desc(schema.newsletterIssue.updatedAt),
    )
}

export type IssueRow = Awaited<ReturnType<typeof listIssues>>[number]

/** Creates or updates a draft. Sent issues are frozen. */
export async function saveIssueDraft(db: Db, userId: string, input: IssueInput) {
  if (input.id) {
    const row = await db
      .update(schema.newsletterIssue)
      .set({ subject: input.subject, content: input.content })
      .where(
        and(
          eq(schema.newsletterIssue.id, input.id),
          isNull(schema.newsletterIssue.sentAt),
        ),
      )
      .returning({ id: schema.newsletterIssue.id })
      .then((rows) => rows.at(0))
    if (!row)
      throw new NewsletterError('That issue was already sent and can no longer change.')
    return row
  }
  const row = await db
    .insert(schema.newsletterIssue)
    .values({ subject: input.subject, content: input.content, createdBy: userId })
    .returning({ id: schema.newsletterIssue.id })
    .then((rows) => rows.at(0))
  if (!row) throw new NewsletterError('Could not save that. Try again.')
  return row
}

export async function deleteIssueDraft(db: Db, id: string) {
  const row = await db
    .delete(schema.newsletterIssue)
    .where(and(eq(schema.newsletterIssue.id, id), isNull(schema.newsletterIssue.sentAt)))
    .returning({ id: schema.newsletterIssue.id })
    .then((rows) => rows.at(0))
  if (!row) throw new NewsletterError('Sent issues stay in the history.')
}

/** One subscriber's copy of an issue: the body, their own unsubscribe link, and List-Unsubscribe. */
export function issueEmail(
  issue: { subject: string; content: string },
  to: string,
  unsubscribeUrl: string | null,
): EmailMessage {
  const doc = parseRichText(issue.content)
  const origin = siteUrl('/').replace(/\/$/, '')
  const { html, text } = renderEmail({
    preheader: plainText(doc).replace(/\s+/g, ' ').slice(0, 120),
    heading: issue.subject,
    paragraphs: [],
    bodyHtml: richTextToEmailHtml(doc, origin),
    bodyText: plainText(doc),
    footer: unsubscribeUrl
      ? 'You get this because you subscribed to the RHS Coding Club newsletter.'
      : 'Test send. Subscribers get their own unsubscribe link here.',
    footerLink: unsubscribeUrl
      ? { label: 'Unsubscribe', href: unsubscribeUrl }
      : undefined,
  })
  return {
    to,
    subject: issue.subject,
    html,
    text,
    headers: unsubscribeUrl ? { 'List-Unsubscribe': `<${unsubscribeUrl}>` } : undefined,
  }
}

export function unsubscribeUrlFor(token: string) {
  return siteUrl(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
}

/** Sends the current draft to one address (the officer), marked as a test. */
export async function sendTestIssue(db: Db, input: IssueInput, to: string) {
  const message = issueEmail({ ...input, subject: `[Test] ${input.subject}` }, to, null)
  return sendEmail(db, message)
}

/**
 * Sends an issue to every active subscriber, exactly once. The issue is
 * claimed by stamping `sentAt` in the same statement that checks it is still
 * unsent, so a double click or two officers at once cannot send it twice.
 */
export async function sendIssue(db: Db, id: string, now = new Date()) {
  const claimed = await db
    .update(schema.newsletterIssue)
    .set({ sentAt: now })
    .where(and(eq(schema.newsletterIssue.id, id), isNull(schema.newsletterIssue.sentAt)))
    .returning()
    .then((rows) => rows.at(0))
  if (!claimed) {
    const exists = await db.query.newsletterIssue.findFirst({
      where: eq(schema.newsletterIssue.id, id),
      columns: { id: true },
    })
    throw new NewsletterError(
      exists ? 'This issue was already sent.' : 'That issue no longer exists.',
    )
  }

  const recipients = await newsletterRecipients(db)
  const messages = recipients.map((r) =>
    issueEmail(claimed, r.email, unsubscribeUrlFor(r.token)),
  )
  const result = await sendEmails(db, messages)
  await db
    .update(schema.newsletterIssue)
    .set({ recipientCount: recipients.length })
    .where(eq(schema.newsletterIssue.id, id))
  return { recipients: recipients.length, ...result }
}

export async function subscriberCounts(db: Db) {
  const [active, total] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)`.mapWith(Number) })
      .from(schema.newsletterSubscriber)
      .where(isNull(schema.newsletterSubscriber.unsubscribedAt)),
    db
      .select({ n: sql<number>`count(*)`.mapWith(Number) })
      .from(schema.newsletterSubscriber)
      .where(isNotNull(schema.newsletterSubscriber.email)),
  ])
  const a = active[0]?.n ?? 0
  return { active: a, unsubscribed: (total[0]?.n ?? 0) - a }
}
