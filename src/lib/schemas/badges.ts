import { z } from 'zod'
import { storedImageKey } from '#/lib/files'

// Admin badge editor: the shared schema and display tables. Ships to the
// browser. Awarding itself lives in src/lib/badges.ts (the badge engine).

export const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const
export type Rarity = (typeof RARITIES)[number]

export const CRITERIA = ['points', 'challenges', 'events', 'projects', 'custom'] as const
export type Criteria = (typeof CRITERIA)[number]

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

/** Ring and glow colors per rarity, used by the badge preview and lists. */
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#8b98a8',
  rare: '#5fb2ee',
  epic: '#a78bfa',
  legendary: '#f2b84b',
}

export const CRITERIA_LABEL: Record<Criteria, string> = {
  points: 'Total points',
  challenges: 'Challenges passed',
  events: 'Events attended',
  projects: 'Approved projects',
  custom: 'Custom (officers award it)',
}

/** "Reach 500 points" style line for a badge's rule. */
export function criteriaSummary(b: {
  criteriaType: Criteria
  threshold: number | null
  autoAward: boolean
}): string {
  if (b.criteriaType === 'custom' || b.threshold === null) return 'Awarded by officers'
  const n = b.threshold
  const rule =
    b.criteriaType === 'points'
      ? `Reach ${n} points`
      : b.criteriaType === 'challenges'
        ? `Pass ${n} challenge${n === 1 ? '' : 's'}`
        : b.criteriaType === 'events'
          ? `Attend ${n} event${n === 1 ? '' : 's'}`
          : `Ship ${n} approved project${n === 1 ? '' : 's'}`
  return b.autoAward ? rule : `${rule} (officers award it)`
}

export const badgeSchema = z
  .object({
    id: z.string().min(1).optional(),
    name: z
      .string()
      .trim()
      .min(2, 'Name it (2+ characters).')
      .max(60, 'Under 60 characters.'),
    description: z
      .string()
      .trim()
      .min(3, 'Describe how to earn it.')
      .max(240, 'Under 240 characters.'),
    imageKey: storedImageKey('badge').nullable(),
    rarity: z.enum(RARITIES),
    criteriaType: z.enum(CRITERIA),
    threshold: z
      .number('Enter a number.')
      .int('Whole numbers only.')
      .min(1, 'At least 1.')
      .max(1_000_000)
      .nullable(),
    autoAward: z.boolean(),
    sortOrder: z.number().int().min(0).max(9999),
    isActive: z.boolean(),
  })
  .superRefine((b, ctx) => {
    if (b.criteriaType !== 'custom' && b.threshold === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['threshold'],
        message: 'Set the number a member has to reach.',
      })
    }
    if (b.criteriaType === 'custom' && b.autoAward) {
      ctx.addIssue({
        code: 'custom',
        path: ['autoAward'],
        message: 'Custom badges are awarded by hand.',
      })
    }
  })
export type BadgeInput = z.infer<typeof badgeSchema>

export const badgeIdSchema = z.object({ id: z.string().min(1) })
export const badgeUserSchema = z.object({
  badgeId: z.string().min(1),
  userId: z.string().min(1),
})
export const memberSearchSchema = z.object({ query: z.string().trim().max(80) })
