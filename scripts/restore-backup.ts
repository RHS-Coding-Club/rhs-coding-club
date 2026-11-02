/**
 * Loads a backup from the admin Backups page into a D1 database.
 *
 *   bun run db:restore <file> --database <name> [--remote] [--persist-to <dir>]
 *
 * Refuses a database that already has users, so it can't overwrite live data.
 * To recover production, create a new database and run migrations on it, restore
 * into that, check it, then point `database_id` in wrangler.jsonc at it and deploy.
 * The old database stays untouched until you're sure.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { restoreStatements } from '#/db/backup-tables'
import type { BackupFile } from '#/db/backup-tables'

function option(name: string): string | undefined {
  const at = process.argv.indexOf(name)
  return at === -1 ? undefined : process.argv[at + 1]
}

const file = process.argv[2]
const database = option('--database')
if (!file || file.startsWith('--') || !database) {
  console.error(
    'Usage: bun run db:restore <file> --database <name> [--remote] [--persist-to <dir>]',
  )
  process.exit(1)
}

const persistTo = option('--persist-to')
const target = process.argv.includes('--remote')
  ? ['--remote']
  : ['--local', ...(persistTo ? ['--persist-to', persistTo] : [])]

function wrangler(args: string[]) {
  return spawnSync(
    'bunx',
    ['wrangler', 'd1', 'execute', database as string, ...target, ...args],
    { encoding: 'utf8' },
  )
}

const check = wrangler(['--json', '--command', 'SELECT COUNT(*) AS n FROM "user"'])
if (check.status !== 0) {
  console.error(
    'Could not read the database. Has it been migrated?\n',
    check.stderr || check.stdout,
  )
  process.exit(1)
}
const count = (JSON.parse(check.stdout) as { results: { n: number }[] }[])[0]?.results[0]
  ?.n
if (count !== 0) {
  console.error(`"${database}" already has ${count} users. Restore into an empty one.`)
  process.exit(1)
}

const raw = readFileSync(file)
const json = file.endsWith('.gz')
  ? gunzipSync(raw).toString('utf8')
  : raw.toString('utf8')
const statements = restoreStatements(JSON.parse(json) as BackupFile)

const sqlFile = join(mkdtempSync(join(tmpdir(), 'rhs-restore-')), 'restore.sql')
writeFileSync(sqlFile, ['PRAGMA defer_foreign_keys = ON;', ...statements].join('\n'))

const result = wrangler(['--file', sqlFile, '--yes'])
if (result.status !== 0) {
  console.error('Restore failed.\n', result.stderr || result.stdout)
  process.exit(1)
}
console.log(`Restored ${statements.length} rows into "${database}".`)
