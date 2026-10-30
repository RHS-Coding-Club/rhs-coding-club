import { z } from 'zod'
import { CODE_LENGTH, isLocalDateTime, normalizeCode } from '#/lib/events'
import { storedImageKey } from '#/lib/files'

// Shared by the event forms and the server functions that receive them.

export const RSVP_CHOICES = ['yes', 'maybe', 'no'] as const
export type RsvpChoice = (typeof RSVP_CHOICES)[number]

const id = z.string().trim().min(1).max(64)

export const eventIdSchema = z.object({ eventId: id })

export const rsvpSchema = z.object({
  eventId: id,
  status: z.enum(RSVP_CHOICES),
})

export const checkInSchema = z.object({
  eventId: id,
  code: z
    .string()
    .max(32)
    .transform(normalizeCode)
    .pipe(z.string().length(CODE_LENGTH, `Codes are ${CODE_LENGTH} characters.`)),
})

const localDateTime = z.string().refine(isLocalDateTime, 'Pick a date and time.')

const tag = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{1,24}$/, 'Tags are short lowercase words.')

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3, 'Give the event a title.').max(120),
    description: z
      .string()
      .trim()
      .max(4000, 'Keep the description under 4000 characters.'),
    /** Wall-clock times in the club's timezone, from `<input type="datetime-local">`. */
    startsAt: localDateTime,
    endsAt: localDateTime,
    location: z.string().trim().min(2, 'Where is it?').max(160),
    tags: z.array(tag).max(6, 'Pick up to six tags.'),
    coverKey: storedImageKey('event').nullable(),
  })
  .refine((v) => v.endsAt > v.startsAt, {
    path: ['endsAt'],
    message: 'The end has to be after the start.',
  })

export type EventFormValues = z.input<typeof eventFormSchema>

export const saveEventSchema = z.object({
  /** Omitted to create. */
  id: id.optional(),
  values: eventFormSchema,
})

export const setCheckInSchema = z.object({ eventId: id, open: z.boolean() })

export const markAttendanceSchema = z.object({
  eventId: id,
  userId: id,
  present: z.boolean(),
})

export const memberSearchSchema = z.object({
  eventId: id,
  query: z.string().trim().max(80),
})
