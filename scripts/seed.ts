/**
 * Seeds the LOCAL D1 database with test users (one per role) and a little
 * content so the app has something to show. Run after `bun run db:migrate`.
 *
 *   bun run db:seed
 *
 * Passwords are hashed with Better Auth's own scrypt implementation so the
 * accounts work with normal email/password login. All seeded users share the
 * password below.
 *
 * `bun run db:seed:prod` (this script with --remote) seeds the DEPLOYED
 * database with the same sample content for demos, but writes NO login
 * accounts, so nobody can sign in as a seeded user on the public site.
 */
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { hashPassword } from 'better-auth/crypto'
import { q } from './seed/util'
import { seedChallenges } from './seed/challenges'
import { seedEvents } from './seed/events'
import { seedContent } from './seed/content'
import { seedCommunity } from './seed/community'
import { seedMembers } from './seed/members'

export const SEED_PASSWORD = 'password123'

export const SEED_USERS = [
  { id: 'u_admin', name: 'Ada Admin', email: 'admin@test.local', role: 'admin' },
  {
    id: 'u_officer',
    name: 'Olive Officer',
    email: 'officer@test.local',
    role: 'officer',
  },
  { id: 'u_member', name: 'Max Member', email: 'member@test.local', role: 'member' },
  { id: 'u_guest', name: 'Gus Guest', email: 'guest@test.local', role: 'guest' },
] as const

/** Extra members so the leaderboard and badge shelf have something to show. */
const SEED_MEMBERS = [
  { id: 'u_seed_m1', name: 'Priya Natarajan', email: 'priya@test.local' },
  { id: 'u_seed_m2', name: 'Diego Ramirez', email: 'diego@test.local' },
  { id: 'u_seed_m3', name: 'Lena Kowalski', email: 'lena@test.local' },
  { id: 'u_seed_m4', name: 'Theo Bassett', email: 'theo@test.local' },
] as const

async function buildSql(withLogins: boolean): Promise<string> {
  const now = Date.now()
  const hash = await hashPassword(SEED_PASSWORD)
  const account = (id: string) =>
    withLogins
      ? `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES (${q(`acc_${id}`)}, ${q(id)}, 'credential', ${q(id)}, ${q(hash)}, ${now}, ${now});`
      : null
  const lines: string[] = ['PRAGMA foreign_keys = ON;']

  // Idempotent: wipe seeded rows first.
  lines.push(`DELETE FROM user WHERE email LIKE '%@test.local';`)
  lines.push(`DELETE FROM challenge WHERE id LIKE 'c_seed_%';`)
  lines.push(`DELETE FROM event WHERE id LIKE 'e_seed_%';`)
  lines.push(`DELETE FROM badge WHERE id LIKE 'b_seed_%';`)
  lines.push(`DELETE FROM setting WHERE key IN ('club-info','points');`)
  lines.push(`DELETE FROM point_entry WHERE id LIKE 'pe_seed_%';`)
  lines.push(`DELETE FROM rsvp WHERE id LIKE 'r_seed_%';`)

  for (const u of SEED_USERS) {
    lines.push(
      `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at, role, bio, grad_year, skills) VALUES (${q(u.id)}, ${q(u.name)}, ${q(u.email)}, 1, NULL, ${now}, ${now}, ${q(u.role)}, NULL, NULL, '[]');`,
    )
    const acc = account(u.id)
    if (acc) lines.push(acc)
  }

  for (const u of SEED_MEMBERS) {
    lines.push(
      `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at, role, bio, grad_year, skills) VALUES (${q(u.id)}, ${q(u.name)}, ${q(u.email)}, 1, NULL, ${now}, ${now}, 'member', NULL, NULL, '[]');`,
    )
    const acc = account(u.id)
    if (acc) lines.push(acc)
  }

  const ctx = { now }
  lines.push(
    ...seedChallenges(ctx),
    ...seedEvents(ctx),
    ...seedContent(ctx),
    ...seedCommunity(ctx),
    ...seedMembers(ctx),
  )

  lines.push(
    `INSERT INTO setting (key, value, updated_by, updated_at) VALUES ('club-info', ${q(
      JSON.stringify({
        clubName: 'RHS Coding Club',
        tagline: 'Most active club at RHS',
        meetingLocation: "Mr. Derrick's classroom",
        meetingSchedule: 'Lunch',
      }),
    )}, 'u_admin', ${now});`,
  )
  lines.push(
    `INSERT INTO setting (key, value, updated_by, updated_at) VALUES ('points', ${q(
      JSON.stringify({
        easy: 50,
        medium: 100,
        hard: 200,
        project: 150,
        attendance: 25,
        showTop: 25,
      }),
    )}, 'u_admin', ${now});`,
  )

  return lines.join('\n')
}

async function main() {
  const remote = process.argv.includes('--remote')
  const sql = await buildSql(!remote)
  const dir = mkdtempSync(join(tmpdir(), 'rhs-seed-'))
  const file = join(dir, 'seed.sql')
  writeFileSync(file, sql)

  const result = spawnSync(
    'bunx',
    [
      'wrangler',
      'd1',
      'execute',
      'rhs-coding-club',
      remote ? '--remote' : '--local',
      '--file',
      file,
    ],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    console.error('Seed failed.')
    process.exit(result.status ?? 1)
  }
  const users = SEED_USERS.length + SEED_MEMBERS.length
  console.log(
    remote
      ? `Seeded ${users} users (no login accounts) and sample content into the deployed database.`
      : `Seeded ${users} users (password: ${SEED_PASSWORD}) and sample content.`,
  )
}

if (import.meta.main) {
  await main()
}
