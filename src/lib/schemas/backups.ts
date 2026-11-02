import { z } from 'zod'
import { isBackupKey } from '#/lib/backups'

export const backupKeySchema = z.object({
  key: z.string().refine(isBackupKey, 'Not a backup.'),
})
