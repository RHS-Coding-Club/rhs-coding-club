import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '#/db'
import { subscribeEmail } from '#/services/newsletter'

export const newsletterSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

/** Public: the footer signup. Duplicates are a silent success. */
export const subscribeNewsletter = createServerFn({ method: 'POST' })
  .inputValidator(newsletterSchema)
  .handler(async ({ data }) => {
    const result = await subscribeEmail(getDb(), data.email)
    return { ok: true as const, created: result.created }
  })
