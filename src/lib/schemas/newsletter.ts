import { z } from 'zod'
import { richTextField } from '#/lib/rich-text'

// Newsletter: unsubscribe tokens, issue drafts, and the CSV export. Ships to
// the browser.

export const tokenSchema = z.object({
  token: z.string().trim().min(8, 'Missing token.').max(100),
})

export const unsubscribeSearchSchema = z.object({
  token: z.string().optional().catch(undefined),
})

export const issueSchema = z.object({
  id: z.string().min(1).optional(),
  subject: z
    .string()
    .trim()
    .min(3, 'Add a subject line.')
    .max(150, 'Keep the subject under 150 characters.'),
  content: richTextField({ required: true, message: 'Write the issue first.' }),
})
export type IssueInput = z.infer<typeof issueSchema>

export const issueIdSchema = z.object({ id: z.string().min(1) })

/** "ada.lovelace@test.local" -> "ad•••@test.local", for the unsubscribe screen. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@')
  if (at <= 0) return email
  const name = email.slice(0, at)
  const shown = name.length <= 2 ? name.slice(0, 1) : name.slice(0, 2)
  return `${shown}•••${email.slice(at)}`
}

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Subscriber rows as CSV (email, status, subscribed, unsubscribed; ISO dates). */
export function subscribersToCsv(
  rows: {
    email: string
    subscribedAt: Date | string | number
    unsubscribedAt: Date | string | number | null
  }[],
): string {
  const iso = (v: Date | string | number | null) =>
    v === null ? '' : new Date(v).toISOString()
  const lines = [['email', 'status', 'subscribed_at', 'unsubscribed_at'].join(',')]
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.email),
        r.unsubscribedAt === null ? 'active' : 'unsubscribed',
        iso(r.subscribedAt),
        iso(r.unsubscribedAt),
      ].join(','),
    )
  }
  return `${lines.join('\n')}\n`
}
