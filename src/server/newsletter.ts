import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '#/db'
import {
  issueIdSchema,
  issueSchema,
  maskEmail,
  tokenSchema,
} from '#/lib/schemas/newsletter'
import { requireOfficer } from '#/server/auth'
import * as newsletter from '#/services/newsletter'

export const newsletterSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

/** Public: the footer signup. Duplicates are a silent success. */
export const subscribeNewsletter = createServerFn({ method: 'POST' })
  .validator(newsletterSchema)
  .handler(async ({ data }) => {
    const result = await newsletter.subscribeEmail(getDb(), data.email)
    return { ok: true as const, created: result.created }
  })

// ---------- Unsubscribe (public, by token) ----------

function present(state: newsletter.TokenState) {
  return state.status === 'invalid'
    ? { status: 'invalid' as const, email: null }
    : { status: state.status, email: maskEmail(state.email) }
}

/** What the unsubscribe page shows. Read-only: visiting the link never unsubscribes. */
export const getUnsubscribeState = createServerFn({ method: 'GET' })
  .validator(z.object({ token: z.string().max(100).optional() }))
  .handler(async ({ data }) => {
    if (!data.token || data.token.length < 8) return present({ status: 'invalid' })
    return present(await newsletter.subscriberByToken(getDb(), data.token))
  })

export const unsubscribe = createServerFn({ method: 'POST' })
  .validator(tokenSchema)
  .handler(async ({ data }) =>
    present(await newsletter.unsubscribeByToken(getDb(), data.token)),
  )

export const resubscribe = createServerFn({ method: 'POST' })
  .validator(tokenSchema)
  .handler(async ({ data }) =>
    present(await newsletter.resubscribeByToken(getDb(), data.token)),
  )

// ---------- Officers ----------

export const getNewsletterAdmin = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(async () => {
    const db = getDb()
    const [subscribers, issues] = await Promise.all([
      newsletter.listSubscribers(db),
      newsletter.listIssues(db),
    ])
    const active = subscribers.filter((s) => s.unsubscribedAt === null).length
    return {
      subscribers,
      issues,
      counts: { active, unsubscribed: subscribers.length - active },
    }
  })

export const saveIssue = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(issueSchema)
  .handler(({ data, context }) =>
    newsletter.saveIssueDraft(getDb(), context.user.id, data),
  )

export const deleteIssue = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(issueIdSchema)
  .handler(async ({ data }) => {
    await newsletter.deleteIssueDraft(getDb(), data.id)
    return { ok: true as const }
  })

/** Sends the draft in the editor to the signed-in officer only. */
export const sendTestIssue = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(issueSchema)
  .handler(async ({ data, context }) => {
    const result = await newsletter.sendTestIssue(getDb(), data, context.user.email)
    return { ...result, to: context.user.email }
  })

export const sendIssue = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(issueIdSchema)
  .handler(({ data }) => newsletter.sendIssue(getDb(), data.id))
