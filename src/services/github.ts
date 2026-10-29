import { desc, eq, inArray, sql } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import type { Db } from '#/db'
import { schema } from '#/db'
import {
  blocksNewRequest,
  canSendInvite,
  classifyInviteResponse,
} from '#/lib/schemas/github'
import type { GithubRequestInput } from '#/lib/schemas/github'

// Invites to the club's GitHub org. Members request one; an officer approves
// it, which sends the org invitation through the GitHub API when a token is
// configured (otherwise the officer sends it by hand on github.com). The
// hourly cron then watches for the invite being accepted.

const API = 'https://api.github.com'
const DEFAULT_ORG = 'RHS-Coding-Club'

export class GithubError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GithubError'
  }
}

/** Token and org from the environment, read lazily. No token means manual invites. */
export function githubConfig() {
  // Both are plain strings at runtime; GITHUB_ORG may be unset in tests.
  const vars = env as { GITHUB_TOKEN?: string; GITHUB_ORG?: string }
  return { token: vars.GITHUB_TOKEN || null, org: vars.GITHUB_ORG || DEFAULT_ORG }
}

export function orgPeopleUrl(org: string) {
  return `https://github.com/orgs/${org}/people`
}

function headers(token: string | null): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'rhs-coding-club-site',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export type GithubLookup =
  | { ok: true; id: number; login: string; name: string | null; avatarUrl: string | null }
  | { ok: false; reason: 'not-found' | 'rate-limited' | 'unavailable' }

/** `GET /users/{name}`: does the account exist, and what is its numeric id? */
export async function lookupGithubUser(username: string): Promise<GithubLookup> {
  const { token } = githubConfig()
  try {
    const res = await fetch(`${API}/users/${encodeURIComponent(username)}`, {
      headers: headers(token),
    })
    if (res.status === 404) return { ok: false, reason: 'not-found' }
    if (
      res.status === 429 ||
      (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0')
    ) {
      return { ok: false, reason: 'rate-limited' }
    }
    if (!res.ok) return { ok: false, reason: 'unavailable' }
    const body = await res.json<{
      id?: unknown
      login?: unknown
      name?: unknown
      avatar_url?: unknown
    }>()
    if (typeof body.id !== 'number' || typeof body.login !== 'string') {
      return { ok: false, reason: 'unavailable' }
    }
    return {
      ok: true,
      id: body.id,
      login: body.login,
      name: typeof body.name === 'string' ? body.name : null,
      avatarUrl: typeof body.avatar_url === 'string' ? body.avatar_url : null,
    }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}

/** The user's most recent request, or null. */
export async function latestRequestFor(db: Db, userId: string) {
  const row = await db.query.githubMembershipRequest.findFirst({
    where: eq(schema.githubMembershipRequest.userId, userId),
    orderBy: desc(schema.githubMembershipRequest.createdAt),
  })
  return row ?? null
}

/**
 * Files a request. One open request at a time: a new one is allowed only
 * when there is none or the last was denied. The username must exist on
 * GitHub; if GitHub is rate limiting or down, the request is still filed
 * and the id is looked up again when an officer approves it.
 */
export async function createGithubRequest(
  db: Db,
  userId: string,
  input: GithubRequestInput,
) {
  const latest = await latestRequestFor(db, userId)
  if (latest && blocksNewRequest(latest.status)) {
    throw new GithubError('You already have a request. Its status is below.')
  }

  const lookup = await lookupGithubUser(input.githubUsername)
  if (!lookup.ok && lookup.reason === 'not-found') {
    throw new GithubError(`There is no GitHub account named "${input.githubUsername}".`)
  }

  const row = await db
    .insert(schema.githubMembershipRequest)
    .values({
      userId,
      githubUsername: lookup.ok ? lookup.login : input.githubUsername,
      githubId: lookup.ok ? lookup.id : null,
      note: input.note || null,
    })
    .returning()
    .then((rows) => rows.at(0))
  if (!row) throw new GithubError('Could not save that. Try again.')

  // Remember the username on the profile if they had not set one.
  await db
    .update(schema.user)
    .set({ githubUsername: row.githubUsername })
    .where(sql`${schema.user.id} = ${userId} AND ${schema.user.githubUsername} IS NULL`)

  return { request: row, verified: lookup.ok }
}

/** A member takes back a request nobody has reviewed yet. */
export async function withdrawGithubRequest(db: Db, userId: string, id: string) {
  const row = await db.query.githubMembershipRequest.findFirst({
    where: eq(schema.githubMembershipRequest.id, id),
  })
  if (!row || row.userId !== userId) throw new GithubError('That request is not yours.')
  if (row.status !== 'pending') {
    throw new GithubError('An officer already reviewed this request.')
  }
  await db
    .delete(schema.githubMembershipRequest)
    .where(eq(schema.githubMembershipRequest.id, id))
}

// ---------- officer tools ----------

export async function listGithubRequests(db: Db) {
  const reviewer = schema.user
  const rows = await db
    .select({
      request: schema.githubMembershipRequest,
      userName: schema.user.name,
      userEmail: schema.user.email,
      userImage: schema.user.image,
      userAvatarKey: schema.user.avatarKey,
    })
    .from(schema.githubMembershipRequest)
    .innerJoin(schema.user, eq(schema.user.id, schema.githubMembershipRequest.userId))
    .orderBy(
      desc(sql`${schema.githubMembershipRequest.status} = 'pending'`),
      desc(schema.githubMembershipRequest.createdAt),
    )
  const reviewerIds = [
    ...new Set(rows.map((r) => r.request.reviewedBy).filter((v): v is string => !!v)),
  ]
  const reviewers = reviewerIds.length
    ? await db
        .select({ id: reviewer.id, name: reviewer.name })
        .from(reviewer)
        .where(inArray(reviewer.id, reviewerIds))
    : []
  const names = new Map(reviewers.map((r) => [r.id, r.name]))
  return rows.map((r) => ({
    ...r.request,
    user: {
      name: r.userName,
      email: r.userEmail,
      image: r.userImage,
      avatarKey: r.userAvatarKey,
    },
    reviewedByName: r.request.reviewedBy
      ? (names.get(r.request.reviewedBy) ?? null)
      : null,
  }))
}

export type AdminGithubRow = Awaited<ReturnType<typeof listGithubRequests>>[number]

async function requireRequest(db: Db, id: string) {
  const row = await db.query.githubMembershipRequest.findFirst({
    where: eq(schema.githubMembershipRequest.id, id),
  })
  if (!row) throw new GithubError('That request no longer exists.')
  return row
}

type RequestRow = typeof schema.githubMembershipRequest.$inferSelect

/**
 * Sends (or re-sends) the org invitation for an approved request and records
 * the outcome. Without a token the request just stays approved and the
 * officer invites them on github.com.
 */
async function sendInvite(db: Db, row: RequestRow, now: Date) {
  const { token, org } = githubConfig()
  if (!token) {
    await db
      .update(schema.githubMembershipRequest)
      .set({ status: 'approved', inviteError: null })
      .where(eq(schema.githubMembershipRequest.id, row.id))
    return { status: 'approved' as const, manual: true, error: null }
  }

  let githubId = row.githubId
  if (githubId === null) {
    const lookup = await lookupGithubUser(row.githubUsername)
    if (!lookup.ok) {
      const error =
        lookup.reason === 'not-found'
          ? `GitHub has no account named "${row.githubUsername}" anymore.`
          : 'Could not reach GitHub to look up the account. Try again in a few minutes.'
      await db
        .update(schema.githubMembershipRequest)
        .set({ status: 'approved', inviteError: error })
        .where(eq(schema.githubMembershipRequest.id, row.id))
      return { status: 'approved' as const, manual: false, error }
    }
    githubId = lookup.id
  }

  let outcome: ReturnType<typeof classifyInviteResponse>
  try {
    const res = await fetch(`${API}/orgs/${encodeURIComponent(org)}/invitations`, {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitee_id: githubId, role: 'direct_member' }),
    })
    const body: unknown = await res.json().catch(() => null)
    outcome = classifyInviteResponse(res.status, body)
  } catch {
    outcome = {
      status: 'approved',
      error: 'Could not reach GitHub. Try again in a few minutes.',
    }
  }

  await db
    .update(schema.githubMembershipRequest)
    .set({
      githubId,
      status: outcome.status,
      inviteError: outcome.status === 'approved' ? outcome.error : null,
      ...(outcome.status === 'invite-sent' ? { inviteSentAt: now } : {}),
      ...(outcome.status === 'already-member' ? { joinedAt: row.joinedAt ?? now } : {}),
    })
    .where(eq(schema.githubMembershipRequest.id, row.id))

  return {
    status: outcome.status,
    manual: false,
    error: outcome.status === 'approved' ? outcome.error : null,
  }
}

export async function approveGithubRequest(
  db: Db,
  input: { id: string; reviewerId: string },
  now = new Date(),
) {
  const row = await requireRequest(db, input.id)
  if (row.status !== 'pending')
    throw new GithubError('This request was already reviewed.')
  await db
    .update(schema.githubMembershipRequest)
    .set({
      status: 'approved',
      reviewedBy: input.reviewerId,
      reviewedAt: now,
      adminNote: null,
    })
    .where(eq(schema.githubMembershipRequest.id, row.id))
  return sendInvite(db, { ...row, status: 'approved' }, now)
}

export async function retryGithubInvite(db: Db, id: string, now = new Date()) {
  const row = await requireRequest(db, id)
  if (!canSendInvite(row.status)) {
    throw new GithubError('Only approved requests can be invited.')
  }
  return sendInvite(db, row, now)
}

export async function denyGithubRequest(
  db: Db,
  input: { id: string; reviewerId: string; note: string },
  now = new Date(),
) {
  const row = await requireRequest(db, input.id)
  if (row.status !== 'pending' && row.status !== 'approved') {
    throw new GithubError('The invite already went out; remove them on GitHub instead.')
  }
  await db
    .update(schema.githubMembershipRequest)
    .set({
      status: 'denied',
      adminNote: input.note,
      reviewedBy: input.reviewerId,
      reviewedAt: now,
      inviteError: null,
    })
    .where(eq(schema.githubMembershipRequest.id, row.id))
}

/**
 * Cron: for every request whose invite went out, ask GitHub whether the
 * person is in the org now (`204` from the membership check) and mark them
 * joined. Skips entirely without a token. Idempotent.
 */
export async function syncGithubInvites(db: Db, now: Date) {
  const { token, org } = githubConfig()
  if (!token) return { skipped: true, checked: 0, joined: 0 }

  const waiting = await db
    .select({
      id: schema.githubMembershipRequest.id,
      githubUsername: schema.githubMembershipRequest.githubUsername,
    })
    .from(schema.githubMembershipRequest)
    .where(
      inArray(schema.githubMembershipRequest.status, ['invite-sent', 'already-invited']),
    )

  let joined = 0
  let failed = 0
  for (const r of waiting) {
    try {
      const res = await fetch(
        `${API}/orgs/${encodeURIComponent(org)}/members/${encodeURIComponent(r.githubUsername)}`,
        { headers: headers(token), redirect: 'manual' },
      )
      if (res.status === 204) {
        await db
          .update(schema.githubMembershipRequest)
          .set({ status: 'joined', joinedAt: now, inviteError: null })
          .where(eq(schema.githubMembershipRequest.id, r.id))
        joined++
      }
    } catch {
      failed++
    }
  }
  return { skipped: false, checked: waiting.length, joined, failed }
}
