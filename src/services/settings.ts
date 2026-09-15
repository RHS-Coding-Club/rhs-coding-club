import { eq } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import { resolveSetting } from '#/lib/settings'
import type { SettingKey, SettingValue } from '#/lib/settings'

// Services take the db explicitly so they can be exercised from integration
// tests and cron jobs without going through a server function.

export async function getSetting<TKey extends SettingKey>(
  db: Db,
  key: TKey,
): Promise<SettingValue<TKey>> {
  const row = await db.query.setting.findFirst({ where: eq(schema.setting.key, key) })
  return resolveSetting(key, row?.value)
}

export async function setSetting<TKey extends SettingKey>(
  db: Db,
  key: TKey,
  value: SettingValue<TKey>,
  updatedBy: string,
): Promise<SettingValue<TKey>> {
  const clean = resolveSetting(key, value)
  await db
    .insert(schema.setting)
    .values({ key, value: clean, updatedBy })
    .onConflictDoUpdate({
      target: schema.setting.key,
      set: { value: clean, updatedBy, updatedAt: new Date() },
    })
  return clean
}
