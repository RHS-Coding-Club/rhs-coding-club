import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '#/db'
import { mcpResource } from '#/lib/mcp-config'
import { redirectKind } from '#/lib/redirect-kind'
import { hasRole } from '#/lib/roles'
import { requireOfficer, requireUser } from '#/server/auth'

// The website side of the MCP server: signing an app in, approving what it asks
// for, and seeing or cutting off what's connected. The tool code loads only when
// one of these needs it, so the rest of the site doesn't carry it.

const idSchema = z.object({ id: z.string().min(1).max(64) })

const hostOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).host : null
  } catch {
    return null
  }
}

/** What the consent page shows: who is asking, and where the sign-in goes back to. */
export const getConsentInfo = createServerFn({ method: 'GET' })
  .middleware([requireUser])
  .validator(
    z.object({
      clientId: z.string().max(2000),
      redirectUri: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const client = await getDb().query.oauthClient.findFirst({
      where: eq(schema.oauthClient.clientId, data.clientId),
      columns: { name: true, uri: true },
    })
    return {
      name: client?.name ?? 'An unknown app',
      // A metadata-document client's id is the URL of the site vouching for it.
      publisher: hostOf(data.clientId) ?? hostOf(client?.uri ?? undefined),
      redirectUri: data.redirectUri ?? null,
      redirect: redirectKind(data.redirectUri),
      allowed: hasRole(context.user.role, 'officer'),
    }
  })

export const getPendingMcpAction = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const { getPendingAction } = await import('#/mcp/execute')
    return getPendingAction(getDb(), context.user, data.id)
  })

export const approveMcpAction = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const { approvePendingAction } = await import('#/mcp/execute')
    return approvePendingAction(getDb(), context.user, data.id)
  })

export const rejectMcpAction = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(idSchema)
  .handler(async ({ data, context }) => {
    const { rejectPendingAction } = await import('#/mcp/execute')
    return rejectPendingAction(getDb(), context.user, data.id)
  })

/** Your own connected apps and waiting approvals; recent activity, everyone's for admins. */
export const getMcpOverview = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(async ({ context }) => {
    const db = getDb()
    const { user } = context
    const { listMcpActivity } = await import('#/mcp/execute')
    const [connections, pending, activity] = await Promise.all([
      db
        .select({
          clientId: schema.oauthConsent.clientId,
          name: schema.oauthClient.name,
          connectedAt: schema.oauthConsent.createdAt,
        })
        .from(schema.oauthConsent)
        .innerJoin(
          schema.oauthClient,
          eq(schema.oauthClient.clientId, schema.oauthConsent.clientId),
        )
        .where(eq(schema.oauthConsent.userId, user.id))
        .orderBy(desc(schema.oauthConsent.createdAt)),
      db
        .select({
          id: schema.mcpPendingAction.id,
          summary: schema.mcpPendingAction.summary,
          expiresAt: schema.mcpPendingAction.expiresAt,
        })
        .from(schema.mcpPendingAction)
        .where(
          and(
            eq(schema.mcpPendingAction.userId, user.id),
            eq(schema.mcpPendingAction.status, 'pending'),
          ),
        )
        .orderBy(desc(schema.mcpPendingAction.createdAt)),
      listMcpActivity(db, hasRole(user.role, 'admin') ? null : user.id),
    ])
    return {
      mcpUrl: mcpResource(),
      connections,
      pending: pending.filter((p) => p.expiresAt.getTime() > Date.now()),
      activity,
      seesEveryone: hasRole(user.role, 'admin'),
    }
  })

/** Forgets the approval and refresh tokens. Access tokens die within 15 minutes. */
export const disconnectMcpClient = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(z.object({ clientId: z.string().min(1).max(2000) }))
  .handler(async ({ data, context }) => {
    const db = getDb()
    const { clientId } = data
    const userId = context.user.id
    const {
      oauthAccessToken: access,
      oauthRefreshToken: refresh,
      oauthConsent: consent,
    } = schema
    // Access tokens first: they point at the refresh tokens.
    await db.batch([
      db
        .delete(access)
        .where(and(eq(access.clientId, clientId), eq(access.userId, userId))),
      db
        .delete(refresh)
        .where(and(eq(refresh.clientId, clientId), eq(refresh.userId, userId))),
      db
        .delete(consent)
        .where(and(eq(consent.clientId, clientId), eq(consent.userId, userId))),
    ])
    return { ok: true as const }
  })
