import type { BackupFrequency } from '#/lib/settings'

// Scheduling, retention, and storage estimates for database backups. Pure, so
// the admin page can show a live estimate as the settings change.

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

export const INTERVAL_DAYS: Record<BackupFrequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
}

/** Kept however old they are, so failing backups can't age the last good ones out. */
export const MIN_BACKUPS_KEPT = 3

/** R2's free storage, shared by backups and uploaded files. */
export const R2_FREE_BYTES = 10 * 1000 * 1000 * 1000

const KEY_PATTERN = /^rhs-coding-club-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z\.json\.gz$/

export const isBackupKey = (key: string) => KEY_PATTERN.test(key)

export function backupKey(now: Date): string {
  const stamp = now
    .toISOString()
    .replace(/\.\d+Z$/, 'Z')
    .replace(/:/g, '-')
  return `rhs-coding-club-${stamp}.json.gz`
}

/**
 * The job runs once a day. The hour of slack stops a backup that ran a little
 * late last time from pushing the next one back a whole day.
 */
export function isBackupDue(
  latest: Date | null,
  frequency: BackupFrequency,
  now: Date,
): boolean {
  if (!latest) return true
  return now.getTime() - latest.getTime() >= INTERVAL_DAYS[frequency] * DAY - HOUR
}

/** Which backups to delete: past the retention period, and not one of the newest few. */
export function backupsToDelete<T extends { key: string; uploaded: Date }>(
  backups: T[],
  retentionDays: number,
  now: Date,
): T[] {
  const newestFirst = [...backups].sort(
    (a, b) => b.uploaded.getTime() - a.uploaded.getTime(),
  )
  const cutoff = now.getTime() - retentionDays * DAY
  return newestFirst
    .slice(MIN_BACKUPS_KEPT)
    .filter((backup) => backup.uploaded.getTime() < cutoff)
}

/** How many backups exist at once with these settings. */
export function backupsKept(frequency: BackupFrequency, retentionDays: number): number {
  const copies = Math.floor(retentionDays / INTERVAL_DAYS[frequency]) + 1
  return Math.max(MIN_BACKUPS_KEPT, copies)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1000 * 1000) return `${(bytes / 1000).toFixed(0)} KB`
  if (bytes < 1000 * 1000 * 1000) return `${(bytes / (1000 * 1000)).toFixed(1)} MB`
  return `${(bytes / (1000 * 1000 * 1000)).toFixed(2)} GB`
}
