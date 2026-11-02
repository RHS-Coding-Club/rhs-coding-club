import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import { backupKeySchema } from '#/lib/schemas/backups'
import { backupSchema } from '#/lib/settings'
import { requireAdmin } from '#/server/auth'
import {
  backupsOverview,
  createBackup,
  listBackups,
  readBackup,
} from '#/services/backups'
import { saveSettingAs } from '#/services/settings-admin'

// Automatic backups. Admins only, every call: a backup holds every member's
// email and application, so officers can't see or download them.

export const getBackups = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(() => backupsOverview(getDb()))

export const saveBackupSettings = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(backupSchema)
  .handler(({ data, context }) => saveSettingAs(getDb(), context.user, 'backup', data))

export const runBackupNow = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .handler(() => createBackup(getDb()))

export const downloadStoredBackup = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .validator(backupKeySchema)
  .handler(async ({ data }) => {
    const known = await listBackups()
    if (!known.some((backup) => backup.key === data.key)) return null
    return readBackup(data.key)
  })
