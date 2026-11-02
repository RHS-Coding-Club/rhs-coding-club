import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { getDb, schema } from '#/db'
import {
  approveGithubRequest,
  createGithubRequest,
  denyGithubRequest,
  latestRequestFor,
  lookupGithubUser,
  retryGithubInvite,
  syncGithubInvites,
  withdrawGithubRequest,
} from '#/services/github'

const db = getDb()

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>
const calls: {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}[] = []

/** Routes stubbed GitHub API calls through `handler` and records them. */
function stubGithub(handler: Handler) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input instanceof Request ? input.url : input)
    calls.push({
      url,
      method: init?.method ?? 'GET',
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: init?.body ? String(init.body) : undefined,
    })
    return handler(url, init)
  })
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })

const user = (login: string, id: number) =>
  json(200, { login, id, name: null, avatar_url: null })

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'u_ada', name: 'Ada', email: 'ada@test.local', role: 'member' },
    {
      id: 'u_bo',
      name: 'Bo',
      email: 'bo@test.local',
      role: 'member',
      githubUsername: 'bo-old',
    },
    { id: 'u_cy', name: 'Cy', email: 'cy@test.local', role: 'member' },
    { id: 'u_off', name: 'Olive', email: 'olive@test.local', role: 'officer' },
  ])
})

beforeEach(() => {
  calls.length = 0
  env.GITHUB_TOKEN = ''
  env.GITHUB_ORG = 'RHS-Coding-Club'
})

afterEach(() => {
  vi.restoreAllMocks()
  env.GITHUB_TOKEN = ''
})

describe('lookupGithubUser', () => {
  it('sends the headers GitHub requires and maps 404 and rate limits', async () => {
    stubGithub((url) => {
      if (url.endsWith('/users/ghost-person')) return json(404, { message: 'Not Found' })
      if (url.endsWith('/users/limited'))
        return json(
          403,
          { message: 'API rate limit exceeded' },
          { 'x-ratelimit-remaining': '0' },
        )
      return user('Ada-L', 42)
    })
    expect(await lookupGithubUser('ada-l')).toMatchObject({
      ok: true,
      id: 42,
      login: 'Ada-L',
    })
    expect(calls[0].headers['User-Agent']).toBeTruthy()
    expect(calls[0].headers['X-GitHub-Api-Version']).toBe('2022-11-28')
    expect(calls[0].headers.Authorization).toBeUndefined()

    expect(await lookupGithubUser('ghost-person')).toEqual({
      ok: false,
      reason: 'not-found',
    })
    expect(await lookupGithubUser('limited')).toEqual({
      ok: false,
      reason: 'rate-limited',
    })
  })
})

describe('request lifecycle with a token', () => {
  it('request -> approve (invite sent) -> cron marks joined', async () => {
    env.GITHUB_TOKEN = 'ghp_test'
    let member = false
    stubGithub((url, init) => {
      if (url.endsWith('/users/ada-l')) return user('Ada-L', 42)
      if (url.endsWith('/orgs/RHS-Coding-Club/invitations') && init?.method === 'POST')
        return json(201, { id: 1 })
      if (url.endsWith('/orgs/RHS-Coding-Club/members/Ada-L'))
        return new Response(null, { status: member ? 204 : 404 })
      return json(500, {})
    })

    const { request } = await createGithubRequest(db, 'u_ada', {
      githubUsername: 'ada-l',
      note: 'I want to push to the website repo.',
    })
    expect(request).toMatchObject({
      status: 'pending',
      githubId: 42,
      githubUsername: 'Ada-L',
    })
    const profile = await db.query.user.findFirst({ where: eq(schema.user.id, 'u_ada') })
    expect(profile?.githubUsername).toBe('Ada-L')

    // One open request at a time.
    await expect(
      createGithubRequest(db, 'u_ada', { githubUsername: 'ada-l' }),
    ).rejects.toThrow(/already have a request/)

    const approved = await approveGithubRequest(
      db,
      { id: request.id, reviewerId: 'u_off' },
      new Date(1000),
    )
    expect(approved.status).toBe('invite-sent')
    const invite = calls.find((c) => c.method === 'POST')
    expect(JSON.parse(invite?.body ?? '{}')).toMatchObject({ invitee_id: 42 })
    expect(invite?.headers.Authorization).toBe('Bearer ghp_test')

    // Not accepted yet: the cron leaves it alone.
    expect(await syncGithubInvites(db, new Date(2000))).toMatchObject({
      checked: 1,
      joined: 0,
    })
    member = true
    expect(await syncGithubInvites(db, new Date(3000))).toMatchObject({
      checked: 1,
      joined: 1,
    })
    const done = await latestRequestFor(db, 'u_ada')
    expect(done).toMatchObject({ status: 'joined', reviewedBy: 'u_off' })
    expect(done?.inviteSentAt?.getTime()).toBe(1000)
    expect(done?.joinedAt?.getTime()).toBe(3000)

    // Idempotent: nothing left to check.
    expect(await syncGithubInvites(db, new Date(4000))).toMatchObject({ checked: 0 })
  })

  it('maps 422 "already a member" and keeps other failures retryable', async () => {
    env.GITHUB_TOKEN = 'ghp_test'
    let inviteResponse = () =>
      json(422, {
        message: 'Validation Failed',
        errors: [{ message: 'Invitee is already a part of this organization' }],
      })
    stubGithub((url) => {
      if (url.includes('/users/')) return user('bo-gh', 7)
      return inviteResponse()
    })
    const bo = await createGithubRequest(db, 'u_bo', { githubUsername: 'bo-gh' })
    // An existing profile username is not overwritten.
    const profile = await db.query.user.findFirst({ where: eq(schema.user.id, 'u_bo') })
    expect(profile?.githubUsername).toBe('bo-old')
    expect(
      (await approveGithubRequest(db, { id: bo.request.id, reviewerId: 'u_off' })).status,
    ).toBe('already-member')

    inviteResponse = () => json(500, { message: 'Server Error' })
    stubGithub((url) => (url.includes('/users/') ? user('cy-gh', 9) : inviteResponse()))
    const cy = await createGithubRequest(db, 'u_cy', { githubUsername: 'cy-gh' })
    const failed = await approveGithubRequest(db, {
      id: cy.request.id,
      reviewerId: 'u_off',
    })
    expect(failed.status).toBe('approved')
    expect(failed.error).toMatch(/500/)
    const stored = await latestRequestFor(db, 'u_cy')
    expect(stored?.inviteError).toMatch(/Server Error/)

    inviteResponse = () => json(201, {})
    const retried = await retryGithubInvite(db, cy.request.id)
    expect(retried.status).toBe('invite-sent')
    expect((await latestRequestFor(db, 'u_cy'))?.inviteError).toBeNull()
  })
})

describe('request lifecycle without a token', () => {
  it('rejects unknown usernames and files despite rate limits', async () => {
    await db.delete(schema.githubMembershipRequest)
    stubGithub((url) =>
      url.endsWith('/users/nobody-here')
        ? json(404, { message: 'Not Found' })
        : json(429, { message: 'slow down' }),
    )
    await expect(
      createGithubRequest(db, 'u_ada', { githubUsername: 'nobody-here' }),
    ).rejects.toThrow(/no GitHub account/)

    const r = await createGithubRequest(db, 'u_ada', { githubUsername: 'ada-l' })
    expect(r.verified).toBe(false)
    expect(r.request.githubId).toBeNull()
  })

  it('approval stays manual, deny records the note, and a denied member can ask again', async () => {
    const fetchSpy = stubGithub(() => user('ada-l', 42))
    const pending = await latestRequestFor(db, 'u_ada')
    if (!pending) throw new Error('expected a request')

    const approved = await approveGithubRequest(db, {
      id: pending.id,
      reviewerId: 'u_off',
    })
    expect(approved).toMatchObject({ status: 'approved', manual: true })
    expect(fetchSpy).not.toHaveBeenCalled()

    await denyGithubRequest(db, {
      id: pending.id,
      reviewerId: 'u_off',
      note: 'Use your school account.',
    })
    expect(await latestRequestFor(db, 'u_ada')).toMatchObject({
      status: 'denied',
      adminNote: 'Use your school account.',
    })

    // Cron is a no-op without a token.
    expect(await syncGithubInvites(db, new Date())).toMatchObject({ skipped: true })

    const again = await createGithubRequest(db, 'u_ada', { githubUsername: 'ada-l' })
    expect(again.request.status).toBe('pending')
  })

  it('lets a member withdraw only their own pending request', async () => {
    const mine = await latestRequestFor(db, 'u_ada')
    if (!mine) throw new Error('expected a request')
    await expect(withdrawGithubRequest(db, 'u_bo', mine.id)).rejects.toThrow(/not yours/)
    await withdrawGithubRequest(db, 'u_ada', mine.id)
    const left = await db
      .select()
      .from(schema.githubMembershipRequest)
      .where(eq(schema.githubMembershipRequest.id, mine.id))
    expect(left).toHaveLength(0)
  })
})
