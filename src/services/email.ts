import { and, eq, inArray, isNull } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { EmailTopic } from '#/db/schema'
import type { Role } from '#/lib/roles'
import { getSetting } from './settings'

// Transactional email through Resend's HTTP API. Until RESEND_API_KEY and
// EMAIL_FROM are set, messages are printed to the Worker log instead, so every
// flow that sends mail works locally and on the preview without a key.

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
  /** Extra headers, e.g. List-Unsubscribe for the newsletter. */
  headers?: Record<string, string>
}

export interface SendResult {
  sent: number
  logged: number
  failed: number
}

const RESEND = 'https://api.resend.com'
const BATCH = 100

function config() {
  const apiKey = env.RESEND_API_KEY
  const from = env.EMAIL_FROM
  return apiKey && from ? { apiKey, from } : null
}

/** Sends one or many messages. Never throws; failures are counted and logged. */
export async function sendEmails(db: Db, messages: EmailMessage[]): Promise<SendResult> {
  const result: SendResult = { sent: 0, logged: 0, failed: 0 }
  if (messages.length === 0) return result

  const cfg = config()
  if (!cfg) {
    for (const m of messages) {
      console.info(
        `[email:dev] to=${m.to} subject=${JSON.stringify(m.subject)}\n${m.text}`,
      )
    }
    result.logged = messages.length
    return result
  }

  const { senderName, replyTo } = await getSetting(db, 'email')
  const from = senderName ? `${senderName} <${addressOf(cfg.from)}>` : cfg.from

  for (let i = 0; i < messages.length; i += BATCH) {
    const chunk = messages.slice(i, i + BATCH).map((m) => ({
      from,
      to: [m.to],
      subject: m.subject,
      html: m.html,
      text: m.text,
      headers: m.headers,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }))
    try {
      const res = await fetch(`${RESEND}/emails/batch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      })
      if (res.ok) result.sent += chunk.length
      else {
        result.failed += chunk.length
        console.error(`[email] Resend ${res.status}: ${await res.text()}`)
      }
    } catch (err) {
      result.failed += chunk.length
      console.error('[email] Resend request failed', err)
    }
  }
  return result
}

export function sendEmail(db: Db, message: EmailMessage) {
  return sendEmails(db, [message])
}

/** "RHS Coding Club <hi@x.org>" -> "hi@x.org" */
function addressOf(from: string) {
  return /<([^>]+)>/.exec(from)?.[1] ?? from
}

/**
 * Whether a notification topic is switched on club-wide (admin settings).
 * The newsletter is always on; it has its own subscriber list.
 */
export async function topicEnabled(db: Db, topic: EmailTopic) {
  if (topic === 'newsletter') return true
  const { notifications } = await getSetting(db, 'email')
  return notifications[topic]
}

/** True unless the user opted out of `topic` in account settings. */
export function wantsTopic(
  prefs: Partial<Record<EmailTopic, boolean>> | null | undefined,
  topic: EmailTopic,
) {
  return prefs?.[topic] !== false
}

/**
 * Users who should get a broadcast about `topic`: the topic is enabled
 * club-wide, they hold one of `roles`, and they haven't opted out.
 */
export async function recipientsFor(
  db: Db,
  topic: EmailTopic,
  roles: readonly Role[] = ['member', 'officer', 'admin'],
) {
  if (!(await topicEnabled(db, topic))) return []
  const users = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      emailPrefs: schema.user.emailPrefs,
    })
    .from(schema.user)
    .where(inArray(schema.user.role, [...roles]))
  return users.filter((u) => wantsTopic(u.emailPrefs, topic))
}

/** One user, if they should get a personal notice about `topic`. */
export async function recipientById(db: Db, userId: string, topic: EmailTopic) {
  if (!(await topicEnabled(db, topic))) return null
  const u = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
    columns: { id: true, name: true, email: true, emailPrefs: true },
  })
  return u && wantsTopic(u.emailPrefs, topic) ? u : null
}

/** Active newsletter subscribers with their unsubscribe tokens. */
export async function newsletterRecipients(db: Db) {
  return db
    .select({
      email: schema.newsletterSubscriber.email,
      token: schema.newsletterSubscriber.unsubscribeToken,
    })
    .from(schema.newsletterSubscriber)
    .where(and(isNull(schema.newsletterSubscriber.unsubscribedAt)))
}
