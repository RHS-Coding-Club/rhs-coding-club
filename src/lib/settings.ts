import { z } from 'zod'

// One Zod schema per settings group. Each field has a default, so a missing
// row or a partially-filled one always resolves to a complete object.

export const clubInfoSchema = z.object({
  clubName: z.string().min(1).max(80).default('RHS Coding Club'),
  tagline: z.string().max(120).default('Most active club at RHS'),
  description: z
    .string()
    .max(600)
    .default(
      'Weekly coding challenges, community service at the Ripon Afterschool Program, hackathons, and a place to ship your first real project.',
    ),
  missionStatement: z
    .string()
    .max(1000)
    .default(
      'We teach each other to code, then teach the next kid. Every RHS student is welcome, no experience required.',
    ),
  contactEmail: z.string().email().or(z.literal('')).default(''),
  meetingLocation: z.string().max(120).default("Mr. Derrick's classroom"),
  meetingSchedule: z.string().max(120).default('Lunch, every week'),
})

export const socialSchema = z.object({
  instagram: z
    .string()
    .url()
    .or(z.literal(''))
    .default('https://www.instagram.com/rhs.codingclub/'),
  github: z
    .string()
    .url()
    .or(z.literal(''))
    .default('https://github.com/RHS-Coding-Club'),
  discord: z.string().url().or(z.literal('')).default(''),
  youtube: z.string().url().or(z.literal('')).default(''),
  customLinks: z
    .array(z.object({ label: z.string().min(1).max(40), url: z.string().url() }))
    .max(6)
    .default([]),
})

export const pointsSchema = z.object({
  easy: z.number().int().min(0).max(10_000).default(50),
  medium: z.number().int().min(0).max(10_000).default(100),
  hard: z.number().int().min(0).max(10_000).default(200),
  project: z.number().int().min(0).max(10_000).default(150),
  attendance: z.number().int().min(0).max(10_000).default(25),
  showTop: z.number().int().min(0).max(500).default(25),
})

export const githubOrgSchema = z.object({
  welcomeMessage: z
    .string()
    .max(1000)
    .default(
      'Welcome to the RHS Coding Club GitHub org. Check the README in each repo before you push.',
    ),
  inviteExpiryDays: z.number().int().min(1).max(30).default(7),
})

export const emailSchema = z.object({
  senderName: z.string().max(80).default('RHS Coding Club'),
  replyTo: z.string().email().or(z.literal('')).default(''),
  notifications: z
    .object({
      newChallenge: z.boolean().default(true),
      eventReminder: z.boolean().default(true),
      weeklyDigest: z.boolean().default(false),
      projectDecision: z.boolean().default(true),
      applicationDecision: z.boolean().default(true),
    })
    .default({
      newChallenge: true,
      eventReminder: true,
      weeklyDigest: false,
      projectDecision: true,
      applicationDecision: true,
    }),
})

export const SETTINGS = {
  'club-info': clubInfoSchema,
  social: socialSchema,
  points: pointsSchema,
  'github-org': githubOrgSchema,
  email: emailSchema,
} as const

export type SettingKey = keyof typeof SETTINGS
export type SettingValue<TKey extends SettingKey> = z.infer<(typeof SETTINGS)[TKey]>

/** Parse a stored value against its schema; unknown or malformed input falls back to defaults. */
export function resolveSetting<TKey extends SettingKey>(
  key: TKey,
  raw: unknown,
): SettingValue<TKey> {
  const schema = SETTINGS[key]
  const input = raw && typeof raw === 'object' ? raw : {}
  const result = schema.safeParse(input)
  return (result.success ? result.data : schema.parse({})) as SettingValue<TKey>
}
