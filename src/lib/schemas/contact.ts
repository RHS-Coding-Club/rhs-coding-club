import { z } from 'zod'

// The public contact form. Shared by the form and the server function.

export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 5000

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tell us your name.')
    .max(80, 'Keep your name under 80 characters.'),
  email: z.string().trim().pipe(z.email('Enter a valid email address.')),
  subject: z
    .string()
    .trim()
    .min(2, 'Add a short subject.')
    .max(120, 'Keep the subject under 120 characters.'),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `Write at least ${MESSAGE_MIN} characters.`)
    .max(MESSAGE_MAX, `Keep it under ${MESSAGE_MAX} characters.`),
  /**
   * Honeypot. Hidden from people (and from screen readers); bots that fill
   * every field fill this one too. Any value means the message is dropped.
   */
  website: z.string().max(500).optional(),
})
export type ContactInput = z.infer<typeof contactSchema>

export const messageIdSchema = z.object({ id: z.string().min(1) })
export const markMessageSchema = z.object({ id: z.string().min(1), read: z.boolean() })
