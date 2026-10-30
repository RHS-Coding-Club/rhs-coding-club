import { z } from 'zod'
import { ROLES } from '#/lib/roles'

// Admin > Users: search, role changes, and manual point adjustments.

export const ROLE_LABEL = {
  guest: 'Guest',
  member: 'Member',
  officer: 'Officer',
  admin: 'Admin',
} as const satisfies Record<(typeof ROLES)[number], string>

export const listUsersSchema = z.object({
  q: z.string().trim().max(100).default(''),
  role: z.enum([...ROLES, 'all']).default('all'),
})

export type ListUsersInput = z.input<typeof listUsersSchema>

export const userIdSchema = z.object({ userId: z.string().min(1) })

export const changeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
})

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>

export const adjustPointsSchema = z.object({
  userId: z.string().min(1),
  delta: z
    .number({ message: 'Enter a whole number of points.' })
    .int('Use a whole number.')
    .min(-10_000, 'That is more than 10,000 points.')
    .max(10_000, 'That is more than 10,000 points.')
    .refine((n) => n !== 0, 'Enter a positive or negative amount.'),
  note: z
    .string()
    .trim()
    .min(3, 'Say why, so the member sees it on their ledger.')
    .max(200, 'Keep the note under 200 characters.'),
})

export type AdjustPointsInput = z.infer<typeof adjustPointsSchema>
