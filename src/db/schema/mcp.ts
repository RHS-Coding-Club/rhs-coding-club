import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth'
import { createdAt, id } from './helpers'

export const MCP_ACTION_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'failed',
  'expired',
] as const
export type McpActionStatus = (typeof MCP_ACTION_STATUSES)[number]

/**
 * A risky MCP tool call waiting for its caller to approve it on the website.
 * `args` is what the AI sent; it is validated again when approved.
 */
export const mcpPendingAction = sqliteTable(
  'mcp_pending_action',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    clientId: text('client_id'),
    tool: text('tool').notNull(),
    args: text('args').notNull(),
    /** Built on the server from the database, never from what the AI wrote. */
    summary: text('summary').notNull(),
    status: text('status', { enum: MCP_ACTION_STATUSES }).default('pending').notNull(),
    error: text('error'),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    decidedAt: integer('decided_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [index('mcp_pending_action_user_idx').on(t.userId, t.status)],
)

export const MCP_AUDIT_OUTCOMES = [
  'ok',
  'error',
  'denied',
  'awaiting-approval',
  'approved',
  'rejected',
] as const
export type McpAuditOutcome = (typeof MCP_AUDIT_OUTCOMES)[number]

/** Every MCP tool call: who, through which app, what, and how it ended. */
export const mcpAuditLog = sqliteTable(
  'mcp_audit_log',
  {
    id: id(),
    // The name survives in `userName` if the account is deleted later.
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    userName: text('user_name').notNull(),
    clientId: text('client_id'),
    tool: text('tool').notNull(),
    args: text('args').notNull(),
    outcome: text('outcome', { enum: MCP_AUDIT_OUTCOMES }).notNull(),
    detail: text('detail'),
    createdAt: createdAt(),
  },
  (t) => [index('mcp_audit_log_created_idx').on(t.createdAt)],
)
