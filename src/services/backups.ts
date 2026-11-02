import { env } from 'cloudflare:workers'
import type { Db } from '#/db'
import { backupKey, backupsToDelete, isBackupDue, isBackupKey } from '#/lib/backups'
import { exportBackup } from './reset'
import { getSetting, setSetting } from './settings'

// Automatic database backups, stored in their own private R2 bucket. Unlike
// FILES, nothing serves this bucket publicly: the only way out is the admin-only
// download below.

export class BackupNotFoundError extends Error {
  constructor() {
    super('That backup no longer exists.')
    this.name = 'BackupNotFoundError'
  }
}

type StoredObject = { key: string; size: number; uploaded: Date }

async function listAll(bucket: R2Bucket): Promise<StoredObject[]> {
  const objects: StoredObject[] = []
  let cursor: string | undefined
  do {
    const page = await bucket.list({ cursor })
    for (const { key, size, uploaded } of page.objects)
      objects.push({ key, size, uploaded })
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return objects
}

export async function listBackups(bucket: R2Bucket = env.BACKUPS) {
  const objects = await listAll(bucket)
  return objects
    .filter((object) => isBackupKey(object.key))
    .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime())
}

async function gzip(text: string): Promise<ArrayBuffer> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Response(stream).arrayBuffer()
}

/** Writes one backup, then deletes whatever has aged out. Failures are recorded for the page. */
export async function createBackup(
  db: Db,
  now = new Date(),
  bucket: R2Bucket = env.BACKUPS,
) {
  let stored: { key: string; size: number }
  try {
    const key = backupKey(now)
    const body = await gzip(await exportBackup(db, now))
    await bucket.put(key, body, {
      httpMetadata: { contentType: 'application/gzip' },
    })
    stored = { key, size: body.byteLength }
  } catch (err) {
    console.error('[backups] backup failed', err)
    const status = await getSetting(db, 'backup-status')
    await setSetting(
      db,
      'backup-status',
      { ...status, lastError: 'The backup failed.', lastErrorAt: now.getTime() },
      null,
    )
    throw err
  }
  await setSetting(
    db,
    'backup-status',
    { lastSuccessAt: now.getTime(), lastError: null, lastErrorAt: null },
    null,
  )
  // Only after a good backup, so a failing job never removes anything.
  const { retentionDays } = await getSetting(db, 'backup')
  const expired = backupsToDelete(await listBackups(bucket), retentionDays, now)
  if (expired.length) await bucket.delete(expired.map((backup) => backup.key))
  return { ...stored, deleted: expired.length }
}

/**
 * The daily cron job. Idempotent: it does nothing until a backup is due, and
 * a repeated tick finds the backup it just wrote.
 */
export async function runScheduledBackup(
  db: Db,
  now = new Date(),
  bucket: R2Bucket = env.BACKUPS,
) {
  const settings = await getSetting(db, 'backup')
  if (!settings.enabled) return { skipped: 'disabled' as const }
  const latest = (await listBackups(bucket)).at(0)
  if (!isBackupDue(latest?.uploaded ?? null, settings.frequency, now))
    return { skipped: 'not-due' as const }
  return createBackup(db, now, bucket)
}

export async function backupsOverview(
  db: Db,
  backupsBucket: R2Bucket = env.BACKUPS,
  filesBucket: R2Bucket = env.FILES,
) {
  const [settings, status, backups, files] = await Promise.all([
    getSetting(db, 'backup'),
    getSetting(db, 'backup-status'),
    listBackups(backupsBucket),
    listAll(filesBucket),
  ])
  const sum = (objects: StoredObject[]) =>
    objects.reduce((total, object) => total + object.size, 0)
  return {
    settings,
    status,
    backups,
    usage: { backupBytes: sum(backups), fileBytes: sum(files) },
  }
}

/** The file as base64, so it survives the server function's JSON response. */
export async function readBackup(key: string, bucket: R2Bucket = env.BACKUPS) {
  const object = isBackupKey(key) ? await bucket.get(key) : null
  if (!object) throw new BackupNotFoundError()
  const bytes = new Uint8Array(await object.arrayBuffer())
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk)
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  return { key, base64: btoa(binary) }
}
