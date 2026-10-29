import { and, desc, gte, isNotNull, lt, lte, sql } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import { semesterStart, weekKey } from '#/lib/dates'
import { fmtDate } from '#/lib/format'
import { recipientsFor, sendEmails } from './email'
import type { EmailMessage } from './email'
import { escapeHtml, prefsFooter, renderEmail, siteUrl } from './email-templates'
import { rankMembers } from './points'

// The Monday digest: this week's challenge, events in the next seven days,
// posts from the last seven, and the top five this semester. Sent to every
// member who left "Monday digest" on. Skipped entirely when there is nothing
// new to say, so a quiet week never sends a leaderboard-only email.

const WEEK = 7 * 24 * 60 * 60 * 1000

/** What goes in this week's digest. Pure read; exported for tests. */
export async function buildDigest(db: Db, now: Date) {
  const weekAgo = new Date(now.getTime() - WEEK)
  const weekAhead = new Date(now.getTime() + WEEK)
  const [challenge, events, posts, top] = await Promise.all([
    db.query.challenge.findFirst({
      where: and(
        isNotNull(schema.challenge.publishedAt),
        gte(schema.challenge.publishedAt, weekAgo),
        lte(schema.challenge.publishedAt, now),
      ),
      orderBy: [desc(schema.challenge.weekNo), desc(schema.challenge.publishedAt)],
      columns: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        points: true,
        weekNo: true,
      },
    }),
    db.query.event.findMany({
      where: and(gte(schema.event.startsAt, now), lt(schema.event.startsAt, weekAhead)),
      orderBy: schema.event.startsAt,
      columns: { id: true, title: true, startsAt: true, location: true },
      limit: 6,
    }),
    db.query.post.findMany({
      where: and(
        isNotNull(schema.post.publishedAt),
        gte(schema.post.publishedAt, weekAgo),
        lte(schema.post.publishedAt, now),
      ),
      orderBy: desc(schema.post.publishedAt),
      columns: { id: true, title: true, slug: true, summary: true },
      limit: 4,
    }),
    rankMembers(db, { since: semesterStart(now), limit: 5 }),
  ])
  return { challenge: challenge ?? null, events, posts, top }
}

export type Digest = Awaited<ReturnType<typeof buildDigest>>

/** True when the digest has something besides the leaderboard. */
export function digestHasNews(d: Digest) {
  return d.challenge !== null || d.events.length > 0 || d.posts.length > 0
}

/** Renders one recipient's digest. Pure apart from `siteUrl`; exported for tests. */
export function renderDigest(d: Digest, name: string) {
  const first = name.split(' ')[0] || name
  const sections: {
    title: string
    items: { text: string; sub?: string; href: string }[]
  }[] = []
  if (d.challenge) {
    sections.push({
      title: `Week ${d.challenge.weekNo} challenge`,
      items: [
        {
          text: d.challenge.title,
          sub: `${cap(d.challenge.difficulty)} · ${d.challenge.points} points. ${d.challenge.description}`,
          href: siteUrl(`/challenges/${d.challenge.id}`),
        },
      ],
    })
  }
  if (d.events.length > 0) {
    sections.push({
      title: 'Coming up',
      items: d.events.map((e) => ({
        text: e.title,
        sub: `${fmtDate(e.startsAt, 'datetime')} · ${e.location}`,
        href: siteUrl(`/events/${e.id}`),
      })),
    })
  }
  if (d.posts.length > 0) {
    sections.push({
      title: 'New on the blog',
      items: d.posts.map((p) => ({
        text: p.title,
        sub: p.summary,
        href: siteUrl(`/blog/${p.slug}`),
      })),
    })
  }
  if (d.top.length > 0) {
    sections.push({
      title: 'Top of the board this semester',
      items: d.top.map((r) => ({
        text: `${r.rank}. ${r.name}`,
        sub: `${r.points.toLocaleString('en-US')} points`,
        href: siteUrl(`/members/${r.userId}`),
      })),
    })
  }

  const bodyHtml = sections
    .map(
      (s) =>
        `<h2 style="margin:28px 0 10px;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#5b6676">${escapeHtml(s.title)}</h2>` +
        s.items
          .map(
            (i) =>
              `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#101826"><a href="${escapeHtml(i.href)}" style="color:#1f4f8a;font-weight:600;text-decoration:none">${escapeHtml(i.text)}</a>${i.sub ? `<br><span style="color:#5b6676;font-size:14px">${escapeHtml(i.sub)}</span>` : ''}</p>`,
          )
          .join(''),
    )
    .join('')
  const bodyText = sections
    .map(
      (s) =>
        `${s.title.toUpperCase()}\n` +
        s.items
          .map((i) => `- ${i.text}${i.sub ? ` (${i.sub})` : ''}\n  ${i.href}`)
          .join('\n'),
    )
    .join('\n\n')

  return renderEmail({
    preheader: d.challenge
      ? `Week ${d.challenge.weekNo}: ${d.challenge.title}`
      : 'What’s happening at RHS Coding Club this week.',
    heading: `This week at the club`,
    paragraphs: [`Hi ${first}, here’s what’s new.`],
    bodyHtml,
    bodyText,
    cta: { label: 'Open your dashboard', href: siteUrl('/dashboard') },
    ...prefsFooter(),
  })
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Cron job (Mondays). Returns what happened for the log. Re-running in the
 * same week re-sends, so the cron fires it once per week only.
 */
export async function sendWeeklyDigest(db: Db, now: Date) {
  const digest = await buildDigest(db, now)
  if (!digestHasNews(digest)) return { sent: 0, skipped: 'nothing new' as const }
  const recipients = await recipientsFor(db, 'weeklyDigest')
  if (recipients.length === 0) return { sent: 0, skipped: 'no recipients' as const }
  if (!(await claimWeek(db, weekKey(now))))
    return { sent: 0, skipped: 'already sent' as const }

  const subject = digest.challenge
    ? `This week: ${digest.challenge.title}`
    : 'This week at RHS Coding Club'
  const messages: EmailMessage[] = recipients.map((r) => ({
    to: r.email,
    subject,
    ...renderDigest(digest, r.name),
  }))
  const result = await sendEmails(db, messages)
  return { ...result, recipients: recipients.length }
}

/** Internal bookkeeping row in `setting` (not one of the admin settings groups). */
const CLAIM_KEY = 'cron:weekly-digest'

/**
 * Records that this week's digest is going out. Atomic: of two ticks racing
 * on the same week, only one gets `true`, so the digest never sends twice.
 */
async function claimWeek(db: Db, week: string) {
  const rows = await db
    .insert(schema.setting)
    .values({ key: CLAIM_KEY, value: { week } })
    .onConflictDoUpdate({
      target: schema.setting.key,
      set: { value: { week }, updatedAt: new Date() },
      setWhere: sql`json_extract(${schema.setting.value}, '$.week') IS NOT ${week}`,
    })
    .returning({ key: schema.setting.key })
  return rows.length > 0
}
