import { eq, inArray } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import { SETTINGS } from '#/lib/settings'
import type { SettingKey, SettingValue } from '#/lib/settings'
import { getSetting, setSetting } from './settings'

// The admin settings page: every group's current value plus who saved it
// last. Reading is for officers; writing is admin-only, enforced here as well
// as in the server function's middleware.

export class SettingsPermissionError extends Error {
  constructor() {
    super('Only admins can change settings.')
    this.name = 'SettingsPermissionError'
  }
}

const KEYS = Object.keys(SETTINGS) as SettingKey[]

export async function settingsOverview(db: Db) {
  const [values, rows] = await Promise.all([
    Promise.all(KEYS.map(async (k) => [k, await getSetting(db, k)] as const)),
    db
      .select({
        key: schema.setting.key,
        updatedAt: schema.setting.updatedAt,
        updatedBy: schema.setting.updatedBy,
      })
      .from(schema.setting)
      .where(inArray(schema.setting.key, KEYS)),
  ])
  const ids = [...new Set(rows.map((r) => r.updatedBy).filter((v): v is string => !!v))]
  const users = ids.length
    ? await db
        .select({ id: schema.user.id, name: schema.user.name })
        .from(schema.user)
        .where(inArray(schema.user.id, ids))
    : []
  const names = new Map(users.map((u) => [u.id, u.name]))
  const meta = Object.fromEntries(
    rows.map((r) => [
      r.key,
      {
        updatedAt: r.updatedAt,
        updatedByName: r.updatedBy ? (names.get(r.updatedBy) ?? null) : null,
      },
    ]),
  ) as Partial<Record<SettingKey, { updatedAt: Date; updatedByName: string | null }>>

  return {
    values: Object.fromEntries(values) as { [K in SettingKey]: SettingValue<K> },
    meta,
  }
}

export type SettingsOverview = Awaited<ReturnType<typeof settingsOverview>>

/** Saves one settings group. Throws unless `actor` is an admin. */
export async function saveSettingAs<TKey extends SettingKey>(
  db: Db,
  actor: { id: string; role: Role },
  key: TKey,
  value: SettingValue<TKey>,
) {
  if (!hasRole(actor.role, 'admin')) throw new SettingsPermissionError()
  const saved = await setSetting(db, key, value, actor.id)
  const row = await db.query.setting.findFirst({
    where: eq(schema.setting.key, key),
    columns: { updatedAt: true },
  })
  return { value: saved, updatedAt: row?.updatedAt ?? new Date() }
}
