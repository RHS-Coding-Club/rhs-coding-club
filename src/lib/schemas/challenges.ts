import { z } from 'zod'
import { richTextField } from '#/lib/rich-text'
import { CLUB_TIMEZONE } from '#/lib/format'

// Weekly challenges: the Zod schemas shared by the forms and the server
// functions, plus the small pure rules (publish state, submission state,
// club-timezone conversion) both sides need. No server imports here; this
// module ships to the browser.

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]

export const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

/** Languages members pick from. `hl` is the lowlight grammar for the code view. */
export const SUBMISSION_LANGUAGES = [
  { value: 'Python', hl: 'python' },
  { value: 'JavaScript', hl: 'javascript' },
  { value: 'TypeScript', hl: 'typescript' },
  { value: 'Java', hl: 'java' },
  { value: 'C++', hl: 'cpp' },
  { value: 'C', hl: 'c' },
  { value: 'C#', hl: 'csharp' },
  { value: 'Go', hl: 'go' },
  { value: 'Rust', hl: 'rust' },
  { value: 'Kotlin', hl: 'kotlin' },
  { value: 'Swift', hl: 'swift' },
  { value: 'Ruby', hl: 'ruby' },
  { value: 'PHP', hl: 'php' },
  { value: 'HTML/CSS', hl: 'xml' },
  { value: 'Other', hl: 'plaintext' },
] as const

export const LANGUAGE_VALUES = SUBMISSION_LANGUAGES.map((l) => l.value) as [
  (typeof SUBMISSION_LANGUAGES)[number]['value'],
  ...(typeof SUBMISSION_LANGUAGES)[number]['value'][],
]

export const SUBMISSION_PLATFORMS = [
  'GitHub',
  'Replit',
  'CodePen',
  'LeetCode',
  'Other',
] as const

/** lowlight grammar for a stored language label; unknown labels auto-detect. */
export function highlightLanguage(language: string): string | null {
  return SUBMISSION_LANGUAGES.find((l) => l.value === language)?.hl ?? null
}

export const MAX_CODE = 20_000

export function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'https:' && u.hostname.includes('.')
  } catch {
    return false
  }
}

const id = z.string().min(1).max(64)

export const challengeIdSchema = z.object({ id })

export const submitSolutionSchema = z.object({
  challengeId: id,
  language: z.enum(LANGUAGE_VALUES, 'Pick the language you used.'),
  platform: z.enum(SUBMISSION_PLATFORMS, 'Pick where your code lives.'),
  url: z
    .string()
    .trim()
    .min(1, 'Paste a link to your solution.')
    .max(500, 'That link is too long.')
    .refine(isHttpsUrl, 'Use a full https:// link.'),
  code: z
    .string()
    .max(
      MAX_CODE,
      `Keep pasted code under ${MAX_CODE.toLocaleString('en-US')} characters.`,
    )
    .optional(),
})
export type SubmitSolutionInput = z.infer<typeof submitSolutionSchema>

export const REVIEW_DECISIONS = ['pass', 'fail', 'pending'] as const
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number]

export const reviewSubmissionSchema = z.object({
  id,
  status: z.enum(REVIEW_DECISIONS),
  feedback: z
    .string()
    .trim()
    .max(2000, 'Keep feedback under 2,000 characters.')
    .optional(),
})
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>

export const submissionFilterSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail']).optional(),
  challengeId: id.optional(),
})

export const PUBLISH_MODES = ['draft', 'now', 'schedule'] as const
export type PublishMode = (typeof PUBLISH_MODES)[number]

/** "2026-10-29T15:30", the value a datetime-local input holds. */
const WALL_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export const challengeFormSchema = z
  .object({
    id: id.optional(),
    title: z
      .string()
      .trim()
      .min(3, 'Give it a title.')
      .max(120, 'Keep the title under 120 characters.'),
    description: z
      .string()
      .trim()
      .min(10, 'Write a one-line summary.')
      .max(200, 'Keep the summary to one line (200 characters).'),
    prompt: richTextField({ required: true, message: 'Write the prompt.' }),
    difficulty: z.enum(DIFFICULTY_LEVELS),
    points: z
      .number('Enter a number.')
      .int('Whole points only.')
      .min(0, 'Points cannot be negative.')
      .max(10_000, 'That is a lot of points.'),
    weekNo: z
      .number('Enter a week number.')
      .int('Whole weeks only.')
      .min(1, 'Weeks start at 1.')
      .max(999),
    sampleInput: z.string().max(5000, 'Keep the sample under 5,000 characters.'),
    sampleOutput: z.string().max(5000, 'Keep the sample under 5,000 characters.'),
    publishMode: z.enum(PUBLISH_MODES),
    /** Club-timezone wall time; required when scheduling. */
    publishAt: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.publishMode !== 'schedule') return
    if (!v.publishAt || !WALL_TIME.test(v.publishAt)) {
      ctx.addIssue({
        code: 'custom',
        path: ['publishAt'],
        message: 'Pick a date and time.',
      })
    }
  })
export type ChallengeFormInput = z.infer<typeof challengeFormSchema>

export const publishChallengeSchema = z.object({
  id,
  mode: z.enum(['now', 'draft']),
})

// ---------- Pure rules ----------

export type ChallengeState = 'draft' | 'scheduled' | 'live'

type When = Date | number | string | null | undefined

const ms = (v: Exclude<When, null | undefined>) =>
  v instanceof Date ? v.getTime() : new Date(v).getTime()

/** null = draft, future = scheduled, past (or now) = live. */
export function challengeState(publishedAt: When, now: Date | number): ChallengeState {
  if (publishedAt == null) return 'draft'
  return ms(publishedAt) <= ms(now) ? 'live' : 'scheduled'
}

/** How long after going live a challenge is still worth announcing. */
export const ANNOUNCE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

/** Live, not yet announced, and went live within the announce window. */
export function shouldAnnounce(
  c: { publishedAt: When; announcedAt: When },
  now: Date | number,
): boolean {
  if (c.announcedAt != null || c.publishedAt == null) return false
  const at = ms(c.publishedAt)
  const t = ms(now)
  return at <= t && t - at <= ANNOUNCE_WINDOW_MS
}

/** The next week number after the highest one in use. */
export function nextWeekNo(weeks: readonly number[]): number {
  return weeks.length === 0 ? 1 : Math.max(...weeks) + 1
}

export type SubmissionStatusValue = 'pending' | 'pass' | 'fail'
export type MemberProgress = 'not-started' | 'pending' | 'passed' | 'failed'

export function memberProgress(
  status: SubmissionStatusValue | null | undefined,
): MemberProgress {
  if (status === 'pass') return 'passed'
  if (status === 'fail') return 'failed'
  if (status === 'pending') return 'pending'
  return 'not-started'
}

export const PROGRESS_LABEL: Record<MemberProgress, string> = {
  'not-started': 'Not started',
  pending: 'Pending review',
  passed: 'Passed',
  failed: 'Needs another try',
}

/** A passed submission is locked; anything else can be (re)submitted. */
export function canSubmit(status: SubmissionStatusValue | null | undefined): boolean {
  return status !== 'pass'
}

// ---------- Club timezone wall time <-> instant ----------

const wallParts = new Intl.DateTimeFormat('en-US', {
  timeZone: CLUB_TIMEZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function partsOf(t: number) {
  const out: Record<string, number> = {}
  for (const p of wallParts.formatToParts(new Date(t))) {
    if (p.type !== 'literal') out[p.type] = Number(p.value)
  }
  return out as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>
}

/** Club offset from UTC at instant `t`, in ms (e.g. -7h during PDT). */
function offsetAt(t: number) {
  const p = partsOf(t)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - (t - (t % 1000))
}

const pad = (n: number) => String(n).padStart(2, '0')

/** An instant as the club-timezone value of a datetime-local input. */
export function toClubWallTime(value: Date | number): string {
  const p = partsOf(ms(value))
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}

/**
 * A datetime-local value read as club time (America/Los_Angeles), whatever
 * the browser's own timezone is. In the spring-forward gap the time is
 * pushed past the gap; in the fall-back overlap the earlier instant wins.
 */
export function fromClubWallTime(wall: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(wall)
  if (!m) return null
  const [y, mo, d, h, mi] = m.slice(1).map(Number)
  const naive = Date.UTC(y, mo - 1, d, h, mi)
  if (Number.isNaN(naive)) return null
  // Try both offsets around the instant; the earlier one that reads back
  // as the same wall time wins.
  const candidates = [
    naive - offsetAt(naive - 12 * 3600_000),
    naive - offsetAt(naive + 12 * 3600_000),
  ].sort((a, b) => a - b)
  for (const t of candidates) {
    if (toClubWallTime(t) === wall) return new Date(t)
  }
  return new Date(candidates[1])
}
