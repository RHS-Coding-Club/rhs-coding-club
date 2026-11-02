import { z } from 'zod'
import { githubUsernameField } from './account'

// The membership application on /join, split into the Stepper's steps so the
// form validates one step at a time with the same rules the server applies to
// the whole thing. Ships to the browser.

export const GRADES = ['9', '10', '11', '12'] as const
export type Grade = (typeof GRADES)[number]

export const GRADE_LABEL: Record<Grade, string> = {
  '9': 'Freshman',
  '10': 'Sophomore',
  '11': 'Junior',
  '12': 'Senior',
}

export const EXPERIENCE_LEVELS = [
  { value: 'none', label: 'Brand new', hint: 'Never written code. That is fine.' },
  { value: 'some', label: 'A little', hint: 'A class, a tutorial, or Scratch.' },
  { value: 'comfortable', label: 'Comfortable', hint: 'I have built a few things.' },
  { value: 'advanced', label: 'Advanced', hint: 'I could teach a lunch session.' },
] as const
export type Experience = (typeof EXPERIENCE_LEVELS)[number]['value']
const EXPERIENCE_VALUES = EXPERIENCE_LEVELS.map((e) => e.value) as [
  Experience,
  ...Experience[],
]

export function experienceLabel(value: string) {
  return EXPERIENCE_LEVELS.find((e) => e.value === value)?.label ?? value
}

export const LANGUAGE_OPTIONS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'C#',
  'HTML/CSS',
  'Scratch',
  'Swift',
  'Rust',
  'Go',
  'Lua',
  'None yet',
] as const

export const INTEREST_OPTIONS = [
  'Web apps',
  'Games',
  'AI and machine learning',
  'Robotics',
  'Competitive programming',
  'Teaching at RAP',
  'Hackathons',
  'Mobile apps',
  'Cybersecurity',
  'Design',
] as const

export const AVAILABILITY_OPTIONS = [
  'Lunch meetings',
  'RAP afternoons',
  'Weekend hackathons',
  'Online only',
] as const

const pickSome = (options: readonly string[], message: string, max = options.length) =>
  z
    .array(z.string())
    .transform((list) => [...new Set(list)].filter((v) => options.includes(v)))
    .refine((list) => list.length > 0, message)
    .refine((list) => list.length <= max, `Pick up to ${max}.`)

const longAnswer = (label: string, min = 10) =>
  z
    .string()
    .trim()
    .min(min, `${label} needs a sentence or two.`)
    .max(1000, `${label} is 1000 characters max.`)

export const applicationSteps = [
  z.object({
    grade: z.enum(GRADES, { message: 'Pick your grade.' }),
    experience: z.enum(EXPERIENCE_VALUES, { message: 'Pick the closest fit.' }),
  }),
  z.object({
    languages: pickSome(LANGUAGE_OPTIONS, 'Pick at least one (or "None yet").'),
    interests: pickSome(INTEREST_OPTIONS, 'Pick at least one thing you want to do.'),
  }),
  z.object({
    goals: longAnswer('What you want to build or learn'),
    whyJoin: longAnswer('Why you want to join'),
  }),
  z.object({
    availability: pickSome(AVAILABILITY_OPTIONS, 'Pick when you can usually make it.'),
    githubUsername: githubUsernameField,
  }),
] as const

export const applicationSchema = applicationSteps[0].extend({
  ...applicationSteps[1].shape,
  ...applicationSteps[2].shape,
  ...applicationSteps[3].shape,
})

export type ApplicationInput = z.input<typeof applicationSchema>
export type Application = z.output<typeof applicationSchema>

/** What the admin sees in the queue for availability (stored as one line of text). */
export function joinAvailability(list: string[]) {
  return list.join(', ')
}

export const reviewApplicationSchema = z
  .object({
    id: z.string().min(1),
    decision: z.enum(['approve', 'reject']),
    note: z
      .string()
      .trim()
      .max(1000, 'Keep the note under 1000 characters.')
      .transform((v) => v || null),
  })
  .refine((v) => v.decision === 'approve' || v.note, {
    message: 'Tell them why, so they know what to change before reapplying.',
    path: ['note'],
  })

export type ReviewApplicationInput = z.input<typeof reviewApplicationSchema>

export const applicationFilterSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).default('pending'),
})
