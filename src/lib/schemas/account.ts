import { z } from 'zod'
import type { EmailTopic } from '#/db/schema'
import { storedImageKey } from '#/lib/files'

// Account settings: the profile form and email preferences. Shared by the
// /account forms and the server functions. Ships to the browser, so no
// server imports here.

/** GitHub's own rule: 1-39 chars, letters, digits, single inner hyphens. */
export const GITHUB_USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export const BIO_MAX = 280
export const SKILLS_MAX = 10
export const SKILL_MAX_LENGTH = 30

/** Strips a leading "@" or a pasted profile URL down to the bare handle. */
export function normalizeGithubUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
}

/** An optional GitHub handle: blank becomes null, anything else must be valid. */
export const githubUsernameField = z
  .string()
  .max(100)
  .transform(normalizeGithubUsername)
  .refine((v) => v === '' || GITHUB_USERNAME_RE.test(v), {
    message: 'Use your GitHub username: letters, numbers, and single hyphens.',
  })
  .transform((v) => (v === '' ? null : v))

/** Trims, drops blanks and case-insensitive duplicates, keeps the first spelling. */
export function cleanSkills(skills: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of skills) {
    const s = raw.trim().replace(/\s+/g, ' ')
    const key = s.toLowerCase()
    if (!s || seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  return out
}

/** Graduation years we accept: a few back (alumni) to five ahead (incoming 9th graders). */
export function gradYearRange(now = new Date()) {
  const y = now.getFullYear()
  return { min: y - 4, max: y + 5 }
}

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(80, 'Keep your name under 80 characters.'),
  bio: z
    .string()
    .trim()
    .max(BIO_MAX, `Keep your bio to ${BIO_MAX} characters.`)
    .transform((v) => v || null),
  gradYear: z
    .number()
    .int()
    .min(2000, 'Pick a graduation year.')
    .max(2100, 'Pick a graduation year.')
    .nullable(),
  skills: z
    .array(
      z.string().max(SKILL_MAX_LENGTH, `Skills are ${SKILL_MAX_LENGTH} characters max.`),
    )
    .transform(cleanSkills)
    .refine((v) => v.length <= SKILLS_MAX, `Pick up to ${SKILLS_MAX} skills.`),
  githubUsername: githubUsernameField,
  /** R2 key from ImageUpload; null falls back to the sign-in provider's image. */
  avatarKey: storedImageKey('avatar').nullable(),
})

export type ProfileInput = z.input<typeof profileSchema>
export type Profile = z.output<typeof profileSchema>

/** Topics a member can switch off. The newsletter has its own subscribe list. */
export const PREF_TOPICS = [
  {
    topic: 'newChallenge',
    label: 'New weekly challenge',
    description: 'An email when the week’s problem goes live.',
  },
  {
    topic: 'eventReminder',
    label: 'Event reminders',
    description: 'A heads-up the day before an event you said you’re going to.',
  },
  {
    topic: 'weeklyDigest',
    label: 'Monday digest',
    description:
      'The week’s challenge, upcoming events, new posts, and the top of the board.',
  },
  {
    topic: 'projectDecision',
    label: 'Project reviews',
    description: 'When an officer approves or sends back a project you’re on.',
  },
  {
    topic: 'applicationDecision',
    label: 'Membership decision',
    description: 'The result of your application to join the club.',
  },
] as const satisfies readonly {
  topic: Exclude<EmailTopic, 'newsletter'>
  label: string
  description: string
}[]

export type PrefTopic = (typeof PREF_TOPICS)[number]['topic']

export const emailPrefsSchema = z.object({
  newChallenge: z.boolean(),
  eventReminder: z.boolean(),
  weeklyDigest: z.boolean(),
  projectDecision: z.boolean(),
  applicationDecision: z.boolean(),
})

export type EmailPrefsInput = z.infer<typeof emailPrefsSchema>

/** Stored prefs are opt-outs (a missing key means subscribed); expand them for the form. */
export function expandPrefs(
  stored: Partial<Record<EmailTopic, boolean>> | null | undefined,
): EmailPrefsInput {
  const out = {} as EmailPrefsInput
  for (const { topic } of PREF_TOPICS) out[topic] = stored?.[topic] !== false
  return out
}
