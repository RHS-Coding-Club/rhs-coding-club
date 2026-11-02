import { z } from 'zod'
import { storedImageKey } from '#/lib/files'

// Admin > Officers: the profiles shown on /about.

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)

export const officerSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, 'Enter a name.').max(80, 'Keep it under 80 characters.'),
  title: z
    .string()
    .trim()
    .min(1, 'Enter a title, like President.')
    .max(60, 'Keep it under 60 characters.'),
  bio: z.string().trim().max(400, 'Keep the bio to 400 characters.'),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Enter a valid email.')
    .transform((v) => v || null),
  githubUrl: optionalText(200).refine(
    (v) => v === null || /^https:\/\/(www\.)?github\.com\/[\w.-]+\/?$/i.test(v),
    'Use a GitHub profile link, like https://github.com/octocat.',
  ),
  imageKey: storedImageKey('officer').nullable(),
  isActive: z.boolean(),
})

export type OfficerInput = z.input<typeof officerSchema>

export const officerIdSchema = z.object({ id: z.string().min(1) })

export const moveOfficerSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(['up', 'down']),
})
