import { getTableColumns, getTableName } from 'drizzle-orm'
import * as t from './schema'

/**
 * What a backup holds, parents before children so it restores in this order.
 * Login secrets (accounts, sessions, verification tokens) stay out on purpose:
 * after a restore, people sign in through Google, GitHub, or Forgot password.
 */
export const BACKUP_TABLES = {
  user: t.user,
  setting: t.setting,
  membership_application: t.membershipApplication,
  officer: t.officer,
  challenge: t.challenge,
  submission: t.submission,
  point_entry: t.pointEntry,
  event: t.event,
  rsvp: t.rsvp,
  attendance: t.attendance,
  project: t.project,
  project_member: t.projectMember,
  post: t.post,
  resource: t.resource,
  resource_bookmark: t.resourceBookmark,
  badge: t.badge,
  user_badge: t.userBadge,
  github_membership_request: t.githubMembershipRequest,
  newsletter_subscriber: t.newsletterSubscriber,
  newsletter_issue: t.newsletterIssue,
  contact_message: t.contactMessage,
}

export type BackupFile = {
  app: string
  version: number
  exportedAt: string
  tables: Record<string, Record<string, unknown>[]>
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
  throw new Error(`Can't restore a value of type ${typeof value}`)
}

/**
 * Turns a backup back into SQL, one INSERT per row. JSON turned dates into
 * strings and the file uses Drizzle's keys, so each value goes back through its
 * column's own conversion to match what the table stores.
 */
export function restoreStatements(backup: BackupFile): string[] {
  if (backup.app !== 'rhs-coding-club' || backup.version !== 1)
    throw new Error('This is not a backup this version can restore.')
  const statements: string[] = []
  for (const [name, table] of Object.entries(BACKUP_TABLES)) {
    const columns = Object.entries(getTableColumns(table))
    for (const row of backup.tables[name] ?? []) {
      const names: string[] = []
      const values: string[] = []
      for (const [key, column] of columns) {
        if (!(key in row)) continue
        const raw = row[key]
        const value =
          raw === null
            ? null
            : column.columnType === 'SQLiteTimestamp'
              ? column.mapToDriverValue(new Date(raw as string))
              : column.mapToDriverValue(raw)
        names.push(`"${column.name}"`)
        values.push(sqlLiteral(value))
      }
      statements.push(
        `INSERT OR REPLACE INTO "${getTableName(table)}" (${names.join(', ')}) VALUES (${values.join(', ')});`,
      )
    }
  }
  return statements
}
