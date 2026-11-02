import { beforeEach, describe, expect, it, vi } from 'vitest'
import { env } from 'cloudflare:test'
import { gunzipSync } from 'node:zlib'
import { getDb, schema } from '#/db'
import { BACKUP_TABLES, restoreStatements } from '#/db/backup-tables'
import type { BackupFile } from '#/db/backup-tables'
import { MIN_BACKUPS_KEPT, backupKey } from '#/lib/backups'
import {
  backupsOverview,
  createBackup,
  listBackups,
  readBackup,
  runScheduledBackup,
} from '#/services/backups'
import { DAILY, runScheduled } from '#/services/cron'
import { exportBackup } from '#/services/reset'
import { getSetting, setSetting } from '#/services/settings'

const db = getDb()
const now = new Date('2026-11-02T06:30:00Z')
const DAY = 24 * 60 * 60 * 1000
const ago = (days: number) => new Date(now.getTime() - days * DAY)

async function clearBucket(bucket: R2Bucket) {
  const { objects } = await bucket.list()
  if (objects.length) await bucket.delete(objects.map((o) => o.key))
}

/** R2 stamps the real upload time, so age is simulated by running the clock forward. */
const fakeBucket = () => {
  const store = new Map<string, { size: number; uploaded: Date; body: ArrayBuffer }>()
  return {
    store,
    bucket: {
      list: () =>
        Promise.resolve({
          truncated: false,
          objects: [...store].map(([key, o]) => ({
            key,
            size: o.size,
            uploaded: o.uploaded,
          })),
        }),
      put: (key: string, body: ArrayBuffer) => {
        const stamp = /(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})Z/.exec(key)
        const uploaded = new Date(
          `${stamp?.[1]}T${stamp?.[2]}:${stamp?.[3]}:${stamp?.[4]}Z`,
        )
        store.set(key, { size: body.byteLength, uploaded, body })
        return Promise.resolve()
      },
      delete: (keys: string[]) => {
        for (const key of keys) store.delete(key)
        return Promise.resolve()
      },
    } as unknown as R2Bucket,
  }
}

beforeEach(async () => {
  await clearBucket(env.BACKUPS)
  await db.delete(schema.setting)
  await db.delete(schema.user)
  await db.insert(schema.user).values({
    id: 'u1',
    name: "Ada O'Neill",
    email: 'ada@test.local',
    emailVerified: true,
    role: 'admin',
    createdAt: new Date('2026-09-01T10:00:00.123Z'),
    updatedAt: new Date('2026-09-02T10:00:00Z'),
  })
  await setSetting(db, 'club-info', { clubName: 'Test club' } as never, 'u1')
})

describe('createBackup', () => {
  it('stores a gzipped export in the private bucket', async () => {
    const { key, size } = await createBackup(db, now)
    expect(key).toBe(backupKey(now))
    const stored = await env.BACKUPS.get(key)
    expect(stored?.size).toBe(size)
    const file = JSON.parse(
      gunzipSync(new Uint8Array(await (stored as R2ObjectBody).arrayBuffer())).toString(),
    ) as BackupFile
    expect(file.tables.user[0]?.email).toBe('ada@test.local')
    expect(await env.FILES.head(key)).toBeNull()
  })

  it('leaves login secrets out', async () => {
    const file = JSON.parse(await exportBackup(db, now)) as BackupFile
    for (const table of ['account', 'session', 'verification'])
      expect(Object.keys(file.tables)).not.toContain(table)
  })

  it('records success', async () => {
    await createBackup(db, now)
    expect(await getSetting(db, 'backup-status')).toMatchObject({
      lastSuccessAt: now.getTime(),
      lastError: null,
    })
  })

  it('records a failure, keeps the backups, and deletes nothing', async () => {
    const { bucket, store } = fakeBucket()
    for (let i = 0; i < 5; i++) await createBackup(db, ago(200 + i), bucket)
    const before = store.size
    const failing = {
      ...bucket,
      put: () => Promise.reject(new Error('R2 is down')),
      list: bucket.list,
      delete: vi.fn(),
    } as unknown as R2Bucket
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(createBackup(db, now, failing)).rejects.toThrow('R2 is down')
    quiet.mockRestore()
    expect(store.size).toBe(before)
    expect((failing.delete as unknown as ReturnType<typeof vi.fn>).mock.calls).toEqual([])
    const status = await getSetting(db, 'backup-status')
    expect(status.lastError).toBe('The backup failed.')
    expect(status.lastErrorAt).toBe(now.getTime())
  })
})

describe('retention', () => {
  it('deletes aged-out backups after a good one, keeping the newest few', async () => {
    const { bucket, store } = fakeBucket()
    for (const days of [300, 200, 100, 50, 10]) await createBackup(db, ago(days), bucket)
    await createBackup(db, now, bucket)
    const kept = [...store.keys()].sort()
    expect(kept).toEqual([ago(50), ago(10), now].map((date) => backupKey(date)).sort())
    expect(kept.length).toBe(MIN_BACKUPS_KEPT)
  })

  it('uses the retention setting', async () => {
    await setSetting(
      db,
      'backup',
      { enabled: true, frequency: 'weekly', retentionDays: 365 },
      'u1',
    )
    const { bucket, store } = fakeBucket()
    for (const days of [300, 200, 100, 50]) await createBackup(db, ago(days), bucket)
    await createBackup(db, now, bucket)
    expect(store.size).toBe(5)
  })
})

describe('runScheduledBackup', () => {
  it('backs up when nothing exists, then waits for the interval', async () => {
    const { bucket, store } = fakeBucket()
    expect(await runScheduledBackup(db, now, bucket)).toMatchObject({ deleted: 0 })
    expect(store.size).toBe(1)
    // A repeated tick is a no-op.
    expect(await runScheduledBackup(db, now, bucket)).toEqual({ skipped: 'not-due' })
    const nextDay = new Date(now.getTime() + DAY)
    expect(await runScheduledBackup(db, nextDay, bucket)).toEqual({ skipped: 'not-due' })
    const nextWeek = new Date(now.getTime() + 7 * DAY)
    expect(await runScheduledBackup(db, nextWeek, bucket)).toMatchObject({ deleted: 0 })
    expect(store.size).toBe(2)
  })

  it('follows a daily setting', async () => {
    await setSetting(
      db,
      'backup',
      { enabled: true, frequency: 'daily', retentionDays: 30 },
      'u1',
    )
    const { bucket, store } = fakeBucket()
    await runScheduledBackup(db, now, bucket)
    await runScheduledBackup(db, new Date(now.getTime() + DAY), bucket)
    expect(store.size).toBe(2)
  })

  it('does nothing when turned off, and deletes nothing either', async () => {
    await setSetting(
      db,
      'backup',
      { enabled: false, frequency: 'weekly', retentionDays: 7 },
      'u1',
    )
    const { bucket, store } = fakeBucket()
    expect(await runScheduledBackup(db, now, bucket)).toEqual({ skipped: 'disabled' })
    expect(store.size).toBe(0)
  })

  it('runs from the daily cron tick against the real bucket', async () => {
    await runScheduled(DAILY, now)
    expect((await listBackups()).map((b) => b.key)).toEqual([backupKey(now)])
  })
})

describe('reading backups', () => {
  it('reports storage for the estimate', async () => {
    const { size } = await createBackup(db, now)
    await env.FILES.put('avatars/test.png', new Uint8Array(1000))
    const overview = await backupsOverview(db)
    expect(overview.usage).toEqual({ backupBytes: size, fileBytes: 1000 })
    expect(overview.backups).toHaveLength(1)
    await env.FILES.delete('avatars/test.png')
  })

  it('downloads a stored backup intact', async () => {
    const { key } = await createBackup(db, now)
    const { base64 } = await readBackup(key)
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const file = JSON.parse(gunzipSync(bytes).toString()) as BackupFile
    expect(file.tables.user[0]?.id).toBe('u1')
  })

  it('refuses keys that are not backups', async () => {
    await env.BACKUPS.put('other.txt', 'nope')
    await expect(readBackup('other.txt')).rejects.toThrow(/no longer exists/)
    expect(await listBackups()).toEqual([])
  })
})

describe('restoring', () => {
  it('puts back exactly what was exported', async () => {
    // Dates, nullable dates, booleans, quotes, and JSON-looking text together.
    await db.insert(schema.post).values({
      id: 'p1',
      title: "It's a post; DROP TABLE user",
      slug: 'p1',
      summary: 'Line one\nLine two',
      content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
      authorId: 'u1',
      publishedAt: new Date('2026-10-01T12:00:00.500Z'),
    })
    await db.insert(schema.event).values({
      id: 'e1',
      title: 'Hack night',
      description: 'Bring a laptop',
      startsAt: new Date('2026-12-01T18:00:00Z'),
      endsAt: new Date('2026-12-01T20:00:00Z'),
      location: 'C3',
      createdBy: 'u1',
    })
    await db
      .insert(schema.newsletterSubscriber)
      .values({ email: 'sub@test.local', unsubscribeToken: 'token-12345' })
    const original = await exportBackup(db, now)
    const parsed = JSON.parse(original) as BackupFile
    expect(parsed.tables.user[0]?.name).toBe("Ada O'Neill")
    expect(parsed.tables.post).toHaveLength(1)
    expect(parsed.tables.event).toHaveLength(1)
    expect(parsed.tables.newsletter_subscriber).toHaveLength(1)

    // Empty every backed-up table, children first.
    const tables = Object.values(BACKUP_TABLES).reverse()
    for (const table of tables) await db.delete(table)
    expect(JSON.parse(await exportBackup(db, now))).not.toEqual(parsed)

    await env.DB.batch(
      ['PRAGMA defer_foreign_keys = ON', ...restoreStatements(parsed)].map((sql) =>
        env.DB.prepare(sql),
      ),
    )
    expect(await exportBackup(db, now)).toBe(original)
  })

  it('refuses a file that is not one of our backups', () => {
    expect(() =>
      restoreStatements({ app: 'other', version: 1, exportedAt: '', tables: {} }),
    ).toThrow(/not a backup/)
    expect(() =>
      restoreStatements({
        app: 'rhs-coding-club',
        version: 2,
        exportedAt: '',
        tables: {},
      }),
    ).toThrow(/not a backup/)
  })
})
