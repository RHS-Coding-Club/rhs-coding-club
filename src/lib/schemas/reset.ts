import { z } from 'zod'

// The admin reset tool: every action it can run, grouped for the checklist,
// and the presets that pre-select a set of them. Shared by the page and the
// server function so labels and validation never drift.

export const RESET_ACTIONS = [
  // Points
  'season',
  'points',
  'badge-awards',
  // People
  'memberships',
  'applications',
  'github-requests',
  'guests',
  'accounts',
  // Content
  'events',
  'challenges',
  'projects',
  'posts',
  'resources',
  'officers',
  'badges',
  'newsletter',
  'messages',
  // Site
  'settings',
  'sample',
] as const
export type ResetAction = (typeof RESET_ACTIONS)[number]

export interface ResetActionInfo {
  label: string
  description: string
  /** Deletes or rewrites data that can't come back without the backup. */
  destructive: boolean
  /** What the count next to it measures, e.g. "members". */
  unit: string
}

export const RESET_INFO: Record<ResetAction, ResetActionInfo> = {
  season: {
    label: 'Start a new points season',
    description:
      'The leaderboard and dashboards start at zero today. Past points stay in history and all-time totals.',
    destructive: false,
    unit: 'members on the board now',
  },
  points: {
    label: 'Erase all points',
    description: 'Deletes every point entry, all-time totals and history included.',
    destructive: true,
    unit: 'point entries',
  },
  'badge-awards': {
    label: 'Take back every badge',
    description: 'Removes awarded badges from everyone. The badges themselves stay.',
    destructive: true,
    unit: 'awards',
  },
  memberships: {
    label: 'Reset memberships',
    description:
      'Members go back to guest and re-apply on /join. Officers and admins keep their roles.',
    destructive: true,
    unit: 'members',
  },
  applications: {
    label: 'Delete membership applications',
    description: 'Clears every application, pending or reviewed.',
    destructive: true,
    unit: 'applications',
  },
  'github-requests': {
    label: 'Delete GitHub org requests',
    description: 'Clears the request queue and history. Nobody is removed from the org.',
    destructive: true,
    unit: 'requests',
  },
  guests: {
    label: 'Delete guest accounts',
    description:
      'Removes accounts that were never approved, and everything tied to them.',
    destructive: true,
    unit: 'guests',
  },
  accounts: {
    label: 'Delete every account except admins',
    description:
      'Removes members, officers, and guests, with their submissions, points, and RSVPs. Admins and you stay.',
    destructive: true,
    unit: 'accounts',
  },
  events: {
    label: 'Delete events',
    description: 'Every event, with its RSVPs and attendance.',
    destructive: true,
    unit: 'events',
  },
  challenges: {
    label: 'Delete challenges',
    description: 'Every challenge, with its submissions.',
    destructive: true,
    unit: 'challenges',
  },
  projects: {
    label: 'Delete projects',
    description: 'Every project in the showcase, with teammates and screenshots.',
    destructive: true,
    unit: 'projects',
  },
  posts: {
    label: 'Delete blog posts',
    description: 'Every post and draft.',
    destructive: true,
    unit: 'posts',
  },
  resources: {
    label: 'Delete resources',
    description: 'Every link on the resources page, with bookmarks.',
    destructive: true,
    unit: 'resources',
  },
  officers: {
    label: 'Clear the officer roster',
    description:
      'Empties the officers on the About page so the new ones can be added. Roles are not changed.',
    destructive: true,
    unit: 'officers',
  },
  badges: {
    label: 'Delete badges',
    description: 'Every badge and every award of it.',
    destructive: true,
    unit: 'badges',
  },
  newsletter: {
    label: 'Delete the newsletter',
    description: 'Past issues and the subscriber list.',
    destructive: true,
    unit: 'issues and subscribers',
  },
  messages: {
    label: 'Delete contact messages',
    description: 'Everything sent through the contact form.',
    destructive: true,
    unit: 'messages',
  },
  settings: {
    label: 'Reset settings to defaults',
    description: 'Club info, social links, point values, GitHub org, and email settings.',
    destructive: true,
    unit: 'saved groups',
  },
  sample: {
    label: 'Remove sample data',
    description:
      'The demo content and the @test.local accounts the seed script made. Real data stays.',
    destructive: true,
    unit: 'sample rows',
  },
}

export const RESET_GROUPS: { label: string; actions: ResetAction[] }[] = [
  { label: 'Points and badges', actions: ['season', 'points', 'badge-awards'] },
  {
    label: 'People',
    actions: ['memberships', 'applications', 'github-requests', 'guests', 'accounts'],
  },
  {
    label: 'Content',
    actions: [
      'events',
      'challenges',
      'projects',
      'posts',
      'resources',
      'officers',
      'badges',
      'newsletter',
      'messages',
    ],
  },
  { label: 'Site', actions: ['settings', 'sample'] },
]

export const RESET_PRESETS = [
  {
    id: 'new-year',
    label: 'New school year',
    description:
      'Fresh leaderboard, everyone re-applies, new officer roster. Challenges, events, projects, and history stay.',
    actions: ['season', 'memberships', 'applications', 'officers'],
  },
  {
    id: 'new-semester',
    label: 'New semester',
    description: 'Just restart the leaderboard. Nothing is deleted.',
    actions: ['season'],
  },
  {
    id: 'sample',
    label: 'Remove sample data',
    description:
      'Clear the demo content before the real launch. Imported and real data stay.',
    actions: ['sample'],
  },
  {
    id: 'content',
    label: 'Clear content, keep people',
    description:
      'Delete challenges, events, projects, posts, resources, and points. Accounts and roles stay.',
    actions: [
      'events',
      'challenges',
      'projects',
      'posts',
      'resources',
      'points',
      'badge-awards',
    ],
  },
  {
    id: 'full',
    label: 'Full wipe',
    description:
      'Everything except admin accounts. The site goes back to empty, as on day one.',
    actions: RESET_ACTIONS.filter((a) => a !== 'season'),
  },
] as const satisfies readonly {
  id: string
  label: string
  description: string
  actions: readonly ResetAction[]
}[]

/** The word to type before anything runs. */
export const RESET_CONFIRM = 'RESET'

export const runResetSchema = z.object({
  actions: z
    .array(z.enum(RESET_ACTIONS))
    .min(1, 'Pick at least one thing to reset.')
    .max(RESET_ACTIONS.length),
  confirm: z.literal(RESET_CONFIRM, `Type ${RESET_CONFIRM} to confirm.`),
})
export type RunResetInput = z.infer<typeof runResetSchema>
