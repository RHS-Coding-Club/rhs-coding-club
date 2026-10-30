import { and, desc, eq, gte, isNull, sql } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { ContactInput } from '#/lib/schemas/contact'
import { sendEmail } from './email'
import { renderEmail, siteUrl } from './email-templates'
import { getSetting } from './settings'

// The public contact form and the officers' inbox.

export class ContactError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContactError'
  }
}

/** At most this many messages per address in RATE_WINDOW. */
const RATE_LIMIT = 3
const RATE_WINDOW = 10 * 60 * 1000

/**
 * Stores a message and, when the club has a contact address, emails it a
 * notice. A filled honeypot is dropped silently (the caller still shows
 * success, so bots learn nothing).
 */
export async function submitContactMessage(
  db: Db,
  input: ContactInput,
  now = new Date(),
) {
  if (input.website && input.website.trim() !== '') return { stored: false as const }

  const email = input.email.trim().toLowerCase()
  const recent = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(schema.contactMessage)
    .where(
      and(
        eq(schema.contactMessage.email, email),
        gte(schema.contactMessage.createdAt, new Date(now.getTime() - RATE_WINDOW)),
      ),
    )
  if ((recent[0]?.n ?? 0) >= RATE_LIMIT) {
    throw new ContactError(
      'You have sent a few messages in a row. Give the officers a little time to reply.',
    )
  }

  const row = await db
    .insert(schema.contactMessage)
    .values({
      name: input.name,
      email,
      subject: input.subject,
      message: input.message,
      createdAt: now,
    })
    .returning({ id: schema.contactMessage.id })
    .then((rows) => rows.at(0))
  if (!row) throw new ContactError('Could not save that. Try again.')

  const { contactEmail } = await getSetting(db, 'club-info')
  if (contactEmail) {
    const content = renderEmail({
      preheader: `${input.name}: ${input.subject}`,
      heading: `New message from ${input.name}`,
      paragraphs: [
        `Subject: ${input.subject}`,
        `From: ${input.name} <${email}>`,
        ...input.message.split(/\n{2,}/),
      ],
      cta: { label: 'Open the inbox', href: siteUrl('/admin/messages') },
      footer:
        'Sent from the contact form on the club website. Reply to them directly at the address above.',
    })
    await sendEmail(db, {
      to: contactEmail,
      subject: `[Contact] ${input.subject}`,
      ...content,
    })
  }
  return { stored: true as const, id: row.id }
}

// ---------- officer inbox ----------

/** Every message, unread first, newest first within each group. */
export async function listMessages(db: Db) {
  return db
    .select()
    .from(schema.contactMessage)
    .orderBy(
      desc(sql`${schema.contactMessage.readAt} IS NULL`),
      desc(schema.contactMessage.createdAt),
    )
}

export type MessageRow = Awaited<ReturnType<typeof listMessages>>[number]

export async function unreadCount(db: Db) {
  const row = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(schema.contactMessage)
    .where(isNull(schema.contactMessage.readAt))
    .then((rows) => rows.at(0))
  return row?.n ?? 0
}

export async function setMessageRead(
  db: Db,
  id: string,
  read: boolean,
  now = new Date(),
) {
  const row = await db
    .update(schema.contactMessage)
    .set({ readAt: read ? now : null })
    .where(eq(schema.contactMessage.id, id))
    .returning({ id: schema.contactMessage.id, readAt: schema.contactMessage.readAt })
    .then((rows) => rows.at(0))
  if (!row) throw new ContactError('That message no longer exists.')
  return row
}

export async function deleteMessage(db: Db, id: string) {
  await db.delete(schema.contactMessage).where(eq(schema.contactMessage.id, id))
}
