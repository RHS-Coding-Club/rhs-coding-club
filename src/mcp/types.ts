import type { z } from 'zod'
import type { Db } from '#/db'
import type { Role } from '#/lib/roles'

export interface McpUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface ToolContext {
  db: Db
  user: McpUser
}

/**
 * - `read` changes nothing.
 * - `write` creates or edits, and can be changed back.
 * - `destructive` deletes, or does something people outside the app will see.
 */
export type ToolEffect = 'read' | 'write' | 'destructive'

export interface McpTool {
  name: string
  title: string
  description: string
  minRole: 'officer' | 'admin'
  effect: ToolEffect
  input: z.ZodType
  run: (ctx: ToolContext, data: never) => Promise<unknown>
  /** Stops the call until a person approves it on the website. */
  confirm?: true | ((data: never) => boolean)
  /**
   * What the approval page says will happen. Built from the database, because
   * the arguments come from an AI that may have read something malicious.
   */
  preview?: (ctx: ToolContext, data: never) => Promise<string>
  /** Results keep email addresses. Everything else has them removed. */
  revealEmails?: boolean
  /** Results include text written by visitors or members. */
  untrusted?: boolean
}
