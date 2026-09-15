/**
 * Seeds the LOCAL D1 database with test users (one per role) and a little
 * content so the app has something to show. Run after `bun run db:migrate`.
 *
 *   bun run db:seed
 *
 * Passwords are hashed with Better Auth's own scrypt implementation so the
 * accounts work with normal email/password login. All seeded users share the
 * password below. Never run this against production.
 */
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { hashPassword } from 'better-auth/crypto'

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

function q(value: string | number | null | boolean): string {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? '1' : '0'
  return `'${value.replace(/'/g, "''")}'`
}

async function buildSql(): Promise<string> {
  const now = Date.now()
  const hash = await hashPassword(SEED_PASSWORD)
  const lines: string[] = ['PRAGMA foreign_keys = ON;']

  // Idempotent: wipe seeded rows first.
  lines.push(`DELETE FROM user WHERE email LIKE '%@test.local';`)
  lines.push(`DELETE FROM challenge WHERE id LIKE 'c_seed_%';`)
  lines.push(`DELETE FROM event WHERE id LIKE 'e_seed_%';`)
  lines.push(`DELETE FROM badge WHERE id LIKE 'b_seed_%';`)
  lines.push(`DELETE FROM setting WHERE key IN ('club-info','points');`)

  for (const u of SEED_USERS) {
    lines.push(
      `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at, role, bio, grad_year, skills) VALUES (${q(u.id)}, ${q(u.name)}, ${q(u.email)}, 1, NULL, ${now}, ${now}, ${q(u.role)}, NULL, NULL, '[]');`,
    )
    lines.push(
      `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES (${q(`acc_${u.id}`)}, ${q(u.id)}, 'credential', ${q(u.id)}, ${q(hash)}, ${now}, ${now});`,
    )
  }

  const challenges = [
    ['c_seed_1', 'FizzBuzz, but make it yours', 'easy', 50, 1],
    ['c_seed_2', 'Reverse a linked list', 'medium', 100, 2],
    ['c_seed_3', 'Build a tiny URL shortener', 'hard', 200, 3],
  ] as const
  for (const [id, title, difficulty, points, week] of challenges) {
    lines.push(
      `INSERT INTO challenge (id, title, description, prompt, difficulty, sample_input, sample_output, points, week_no, published_at, created_by, legacy_author_email, created_at, updated_at) VALUES (${q(id)}, ${q(title)}, ${q(`Week ${week} challenge.`)}, ${q('Write a solution and share a link to it.')}, ${q(difficulty)}, NULL, NULL, ${points}, ${week}, ${now}, 'u_officer', NULL, ${now}, ${now});`,
    )
  }

  const day = 24 * 60 * 60 * 1000
  lines.push(
    `INSERT INTO event (id, title, description, starts_at, ends_at, location, tags, cover_key, created_by, created_at, updated_at) VALUES ('e_seed_1', 'First Meeting', 'Ripon Afterschool Program volunteer dates, H2O hackathon groups, and more.', ${now + 7 * day}, ${now + 7 * day + 3600_000}, "Mr. Derrick's classroom", '["meeting"]', NULL, 'u_officer', ${now}, ${now});`,
  )
  lines.push(
    `INSERT INTO event (id, title, description, starts_at, ends_at, location, tags, cover_key, created_by, created_at, updated_at) VALUES ('e_seed_2', 'STEM Teaching Program w/ RAP', 'Teach afterschool students STEM and art principles through interactive activities.', ${now - 14 * day}, ${now - 14 * day + 3600_000}, 'Ripon Elementary', '["volunteering","rap"]', NULL, 'u_officer', ${now}, ${now});`,
  )

  lines.push(
    `INSERT INTO badge (id, name, description, image_key, rarity, criteria_type, threshold, auto_award, sort_order, is_active, created_at, updated_at) VALUES ('b_seed_1', 'First Blood', 'Passed your first challenge.', NULL, 'common', 'challenges', 1, 1, 1, 1, ${now}, ${now});`,
  )
  lines.push(
    `INSERT INTO badge (id, name, description, image_key, rarity, criteria_type, threshold, auto_award, sort_order, is_active, created_at, updated_at) VALUES ('b_seed_2', 'Centurion', 'Earned 100 points.', NULL, 'rare', 'points', 100, 1, 2, 1, ${now}, ${now});`,
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
  const sql = await buildSql()
  const dir = mkdtempSync(join(tmpdir(), 'rhs-seed-'))
  const file = join(dir, 'seed.sql')
  writeFileSync(file, sql)

  const result = spawnSync(
    'bunx',
    ['wrangler', 'd1', 'execute', 'rhs-coding-club', '--local', '--file', file],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    console.error('Seed failed.')
    process.exit(result.status ?? 1)
  }
  console.log(
    `Seeded ${SEED_USERS.length} users (password: ${SEED_PASSWORD}) and sample content.`,
  )
}

if (import.meta.main) {
  await main()
}
