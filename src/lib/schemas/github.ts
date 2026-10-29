import { z } from 'zod'

// GitHub org invites: the request form schema plus the pure rules both the
// page and the service need (username format, the status timeline, and how
// GitHub's invite responses map onto request statuses). Ships to the browser.

export const REQUEST_STATUSES = [
  'pending',
  'approved',
  'denied',
  'invite-sent',
  'already-member',
  'already-invited',
  'joined',
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  denied: 'Denied',
  'invite-sent': 'Invite sent',
  'already-member': 'Already a member',
  'already-invited': 'Already invited',
  joined: 'Joined',
}

/** Statuses that block a new request (anything not denied). */
export function blocksNewRequest(status: RequestStatus): boolean {
  return status !== 'denied'
}

/** Approved by an officer and not finished yet: the invite can be (re)sent. */
export function canSendInvite(status: RequestStatus): boolean {
  return status === 'approved' || status === 'invite-sent' || status === 'already-invited'
}

/** GitHub's rules: 1-39 letters, digits, or single hyphens, no leading/trailing hyphen. */
export const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export const githubUsernameField = z
  .string()
  .trim()
  .transform((s) => s.replace(/^@/, '').replace(/^https?:\/\/(www\.)?github\.com\//i, ''))
  .pipe(
    z
      .string()
      .min(1, 'Enter your GitHub username.')
      .max(39, 'GitHub usernames are 39 characters at most.')
      .regex(GITHUB_USERNAME, 'That is not a valid GitHub username.'),
  )

export const githubRequestSchema = z.object({
  githubUsername: githubUsernameField,
  note: z.string().trim().max(500, 'Keep the note under 500 characters.').optional(),
})
export type GithubRequestInput = z.infer<typeof githubRequestSchema>

export const requestIdSchema = z.object({ id: z.string().min(1) })

export const denyRequestSchema = z.object({
  id: z.string().min(1),
  note: z
    .string()
    .trim()
    .min(3, 'Tell them why (they will see this).')
    .max(500, 'Keep the note under 500 characters.'),
})

export type StepState = 'done' | 'current' | 'upcoming' | 'denied'

export interface TimelineStep {
  key: 'requested' | 'approved' | 'invited' | 'joined' | 'denied'
  label: string
  state: StepState
  at: Date | null
  detail?: string
}

/**
 * The steps shown on /github for a request: requested, approved, invite sent,
 * joined. A denied request ends at a red "denied" step carrying the officer's
 * note. "Already a member" jumps straight to joined.
 */
export function requestTimeline(r: {
  status: RequestStatus
  createdAt: Date
  reviewedAt: Date | null
  inviteSentAt: Date | null
  joinedAt: Date | null
  adminNote: string | null
}): TimelineStep[] {
  const requested: TimelineStep = {
    key: 'requested',
    label: 'Requested',
    state: 'done',
    at: r.createdAt,
  }
  if (r.status === 'denied') {
    return [
      requested,
      {
        key: 'denied',
        label: 'Denied',
        state: 'denied',
        at: r.reviewedAt,
        detail: r.adminNote ?? undefined,
      },
    ]
  }
  const rank: Record<Exclude<RequestStatus, 'denied'>, number> = {
    pending: 0,
    approved: 1,
    'already-invited': 2,
    'invite-sent': 2,
    'already-member': 3,
    joined: 3,
  }
  const reached = rank[r.status]
  const state = (step: number): StepState =>
    reached >= step ? 'done' : reached === step - 1 ? 'current' : 'upcoming'
  return [
    requested,
    { key: 'approved', label: 'Approved', state: state(1), at: r.reviewedAt },
    {
      key: 'invited',
      label: 'Invite sent',
      state: r.status === 'already-member' ? 'done' : state(2),
      at: r.inviteSentAt,
      detail: r.status === 'already-member' ? 'You were already in the org.' : undefined,
    },
    { key: 'joined', label: 'Joined', state: state(3), at: r.joinedAt },
  ]
}

export type InviteOutcome =
  | { status: 'invite-sent' }
  | { status: 'already-member' }
  | { status: 'already-invited' }
  | { status: 'approved'; error: string }

/** Collects every human-readable message in a GitHub error body. */
function githubMessages(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const b = body as { message?: unknown; errors?: unknown }
  const parts: string[] = []
  if (typeof b.message === 'string') parts.push(b.message)
  if (Array.isArray(b.errors)) {
    for (const e of b.errors) {
      if (typeof e === 'string') parts.push(e)
      else if (
        e &&
        typeof e === 'object' &&
        typeof (e as { message?: unknown }).message === 'string'
      )
        parts.push((e as { message: string }).message)
    }
  }
  return parts.join('; ')
}

/**
 * Maps the response to `POST /orgs/{org}/invitations` onto a request status.
 * 201 means the invite went out; a 422 that says the person is already in
 * the org (or already invited) is a success of a different kind; anything
 * else leaves the request approved with the error recorded for a retry.
 */
export function classifyInviteResponse(status: number, body: unknown): InviteOutcome {
  if (status === 201) return { status: 'invite-sent' }
  const text = githubMessages(body)
  if (status === 422) {
    if (/already (a )?(part|member)/i.test(text)) return { status: 'already-member' }
    if (/already.*invit|pending invitation|invit.*already/i.test(text))
      return { status: 'already-invited' }
  }
  const reason = text || 'no details'
  return {
    status: 'approved',
    error: `GitHub returned ${status}: ${reason}`.slice(0, 500),
  }
}
