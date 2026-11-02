import { describe, expect, it } from 'vitest'
import {
  MIN_BACKUPS_KEPT,
  backupKey,
  backupsKept,
  backupsToDelete,
  formatBytes,
  isBackupDue,
  isBackupKey,
} from '#/lib/backups'
import { resolveSetting } from '#/lib/settings'
import { backupKeySchema } from '#/lib/schemas/backups'

const now = new Date('2026-11-02T06:30:00Z')
const DAY = 24 * 60 * 60 * 1000
const ago = (days: number) => new Date(now.getTime() - days * DAY)
const backup = (days: number) => ({ key: `k${days}`, uploaded: ago(days) })

describe('backup keys', () => {
  it('round-trips the key it makes', () => {
    const key = backupKey(now)
    expect(key).toBe('rhs-coding-club-2026-11-02T06-30-00Z.json.gz')
    expect(isBackupKey(key)).toBe(true)
  })

  it('rejects anything else, including path tricks', () => {
    for (const key of ['', '../secret', 'rhs-coding-club-x.json.gz', 'a/b.json.gz'])
      expect(backupKeySchema.safeParse({ key }).success).toBe(false)
  })
})

describe('isBackupDue', () => {
  it('is due when there are no backups', () => {
    expect(isBackupDue(null, 'monthly', now)).toBe(true)
  })

  it('waits for the interval', () => {
    expect(isBackupDue(ago(6), 'weekly', now)).toBe(false)
    expect(isBackupDue(ago(7), 'weekly', now)).toBe(true)
    expect(isBackupDue(ago(29), 'monthly', now)).toBe(false)
  })

  it('tolerates a run that was a little late last time', () => {
    const lateLastTime = new Date(now.getTime() - DAY + 20 * 60 * 1000)
    expect(isBackupDue(lateLastTime, 'daily', now)).toBe(true)
  })
})

describe('backupsToDelete', () => {
  it('deletes only what is past retention', () => {
    const all = [0, 7, 14, 21, 80, 91, 120].map(backup)
    expect(backupsToDelete(all, 90, now).map((b) => b.key)).toEqual(['k91', 'k120'])
  })

  it('keeps the newest few however old they are', () => {
    const stale = [200, 300, 400, 500].map(backup)
    expect(backupsToDelete(stale, 90, now).map((b) => b.key)).toEqual(['k500'])
    expect(backupsToDelete(stale.slice(0, MIN_BACKUPS_KEPT), 90, now)).toEqual([])
  })

  it('does not depend on input order', () => {
    const all = [500, 1, 400, 2, 300].map(backup)
    expect(backupsToDelete(all, 90, now).map((b) => b.key)).toEqual(['k400', 'k500'])
  })
})

describe('estimates', () => {
  it('counts the copies kept at once', () => {
    expect(backupsKept('weekly', 90)).toBe(13)
    expect(backupsKept('daily', 30)).toBe(31)
  })

  it('never estimates fewer than the minimum kept', () => {
    expect(backupsKept('monthly', 7)).toBe(MIN_BACKUPS_KEPT)
  })

  it('formats sizes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(561_000)).toBe('561 KB')
    expect(formatBytes(7_300_000)).toBe('7.3 MB')
    expect(formatBytes(2_500_000_000)).toBe('2.50 GB')
  })
})

describe('backup settings', () => {
  it('defaults to weekly, kept for 90 days', () => {
    expect(resolveSetting('backup', null)).toEqual({
      enabled: true,
      frequency: 'weekly',
      retentionDays: 90,
    })
  })

  it('falls back to defaults rather than an out-of-range retention', () => {
    expect(resolveSetting('backup', { retentionDays: 1 }).retentionDays).toBe(90)
  })
})
