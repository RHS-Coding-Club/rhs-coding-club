import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import {
  denyRequestSchema,
  githubRequestSchema,
  requestIdSchema,
} from '#/lib/schemas/github'
import { requireMember, requireOfficer, requireUser } from '#/server/auth'
import * as github from '#/services/github'
import { getSetting } from '#/services/settings'

/** /github: the viewer's latest request, prefill, and the org's welcome copy. */
export const getMyGithubRequest = createServerFn({ method: 'GET' })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = getDb()
    const [request, profile, orgSettings] = await Promise.all([
      github.latestRequestFor(db, context.user.id),
      db.query.user.findFirst({
        where: eq(schema.user.id, context.user.id),
        columns: { githubUsername: true },
      }),
      getSetting(db, 'github-org'),
    ])
    const { org } = github.githubConfig()
    return {
      request,
      prefill: profile?.githubUsername ?? '',
      org,
      orgUrl: `https://github.com/${org}`,
      welcomeMessage: orgSettings.welcomeMessage,
      inviteExpiryDays: orgSettings.inviteExpiryDays,
    }
  })

export const requestGithubInvite = createServerFn({ method: 'POST' })
  .middleware([requireMember])
  .validator(githubRequestSchema)
  .handler(async ({ data, context }) => {
    const { verified } = await github.createGithubRequest(getDb(), context.user.id, data)
    return { ok: true as const, verified }
  })

export const withdrawGithubRequest = createServerFn({ method: 'POST' })
  .middleware([requireUser])
  .validator(requestIdSchema)
  .handler(async ({ data, context }) => {
    await github.withdrawGithubRequest(getDb(), context.user.id, data.id)
    return { ok: true as const }
  })

// ---------- Officers ----------

export const listGithubRequests = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(async () => {
    const { token, org } = github.githubConfig()
    return {
      requests: await github.listGithubRequests(getDb()),
      org,
      tokenConfigured: token !== null,
      peopleUrl: github.orgPeopleUrl(org),
    }
  })

export const approveGithubRequest = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(requestIdSchema)
  .handler(({ data, context }) =>
    github.approveGithubRequest(getDb(), { id: data.id, reviewerId: context.user.id }),
  )

export const retryGithubInvite = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(requestIdSchema)
  .handler(({ data }) => github.retryGithubInvite(getDb(), data.id))

export const denyGithubRequest = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(denyRequestSchema)
  .handler(async ({ data, context }) => {
    await github.denyGithubRequest(getDb(), {
      id: data.id,
      note: data.note,
      reviewerId: context.user.id,
    })
    return { ok: true as const }
  })
