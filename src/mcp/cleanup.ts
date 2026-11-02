import { and, isNotNull, lt, notInArray } from 'drizzle-orm'
import { schema } from '#/db'
import type { Db } from '#/db'

const KEEP_MS = 90 * 24 * 60 * 60_000
const UNUSED_CLIENT_MS = 7 * 24 * 60 * 60_000

/**
 * Hourly: drop audit rows and old approval requests past the retention window,
 * and apps nobody connected. Starting a sign-in saves the app's details before
 * anyone has logged in, so anyone can add those rows.
 */
export async function cleanUpMcp(db: Db, now = new Date()) {
  const cutoff = new Date(now.getTime() - KEEP_MS)
  await db.delete(schema.mcpAuditLog).where(lt(schema.mcpAuditLog.createdAt, cutoff))
  await db
    .delete(schema.mcpPendingAction)
    .where(lt(schema.mcpPendingAction.expiresAt, cutoff))
  const { oauthClient, oauthConsent } = schema
  await db
    .delete(oauthClient)
    .where(
      and(
        isNotNull(oauthClient.clientDiscoveryId),
        lt(oauthClient.createdAt, new Date(now.getTime() - UNUSED_CLIENT_MS)),
        notInArray(
          oauthClient.clientId,
          db.select({ clientId: oauthConsent.clientId }).from(oauthConsent),
        ),
      ),
    )
}
