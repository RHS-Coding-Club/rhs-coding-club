import { and, eq, inArray, isNull } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { WorkerMailer } from 'worker-mailer'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { EmailTopic } from '#/db/schema'
import type { Role } from '#/lib/roles'
import { getSetting } from './settings'

// Email goes out through the club's Gmail account over SMTP (an app password,
// no paid provider, no domain needed). Until GMAIL_USER and GMAIL_APP_PASSWORD
// are set, messages go to the Worker log instead, so every flow that sends mail
// works locally without a key. Bodies hold reset links, so only dev logs them.

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

/** Gmail allows about 500 recipients a day; broadcasts stop short of it. */
const DAILY_LIMIT = 500
const BROADCAST_LIMIT = 400
/** A send to one person (a reset, a decision) may use the reserve. */
const isBroadcast = (messages: EmailMessage[]) => messages.length > 1

const QUOTA_KEY = 'cron:email-quota'

function config() {
  const username = env.GMAIL_USER
  const password = env.GMAIL_APP_PASSWORD
  return username && password ? { username, password } : null
}

/**
 * Takes up to `wanted` sends from today's allowance and returns how many were
 * granted. Read then write: two sends racing can overshoot by a little, which
 * the reserve absorbs, and Gmail refuses anything past its own limit anyway.
 */
async function grant(db: Db, wanted: number, limit: number, now: Date) {
  const day = now.toISOString().slice(0, 10)
  const row = await db.query.setting.findFirst({
    where: eq(schema.setting.key, QUOTA_KEY),
  })
  const stored = row?.value as { day?: string; count?: number } | undefined
  const used = stored?.day === day ? (stored.count ?? 0) : 0
  const granted = Math.min(wanted, Math.max(0, limit - used))
  if (granted > 0) {
    const value = { day, count: used + granted }
    await db
      .insert(schema.setting)
      .values({ key: QUOTA_KEY, value })
      .onConflictDoUpdate({ target: schema.setting.key, set: { value } })
  }
  return granted
}

/** Sends one or many messages. Never throws; failures are counted and logged. */
export async function sendEmails(
  db: Db,
  messages: EmailMessage[],
  now = new Date(),
): Promise<SendResult> {
  const result: SendResult = { sent: 0, logged: 0, failed: 0 }
  if (messages.length === 0) return result

  const cfg = config()
  if (!cfg) {
    for (const m of messages) {
      const body = import.meta.env.DEV ? `\n${m.text}` : ''
      console.info(`[email:dev] to=${m.to} subject=${JSON.stringify(m.subject)}${body}`)
    }
    result.logged = messages.length
    return result
  }

  const limit = isBroadcast(messages) ? BROADCAST_LIMIT : DAILY_LIMIT
  const allowed = await grant(db, messages.length, limit, now)
  if (allowed < messages.length) {
    result.failed += messages.length - allowed
    console.error(
      `[email] daily limit reached: ${messages.length - allowed} of ${messages.length} not sent`,
    )
  }
  if (allowed === 0) return result

  const { senderName, replyTo } = await getSetting(db, 'email')
  const from = { name: senderName || 'RHS Coding Club', email: cfg.username }

  let mailer: WorkerMailer | null = null
  try {
    mailer = await WorkerMailer.connect({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      authType: 'plain',
      credentials: cfg,
    })
    for (const m of messages.slice(0, allowed)) {
      try {
        await mailer.send({
          from,
          to: m.to,
          subject: m.subject,
          html: m.html,
          text: m.text,
          headers: m.headers,
          ...(replyTo ? { reply: replyTo } : {}),
        })
        result.sent++
      } catch (err) {
        result.failed++
        console.error('[email] send failed', err)
      }
    }
  } catch (err) {
    result.failed += allowed - result.sent
    console.error('[email] could not connect to Gmail', err)
  } finally {
    await mailer?.close().catch(() => undefined)
  }
  return result
}

export function sendEmail(db: Db, message: EmailMessage) {
  return sendEmails(db, [message])
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
