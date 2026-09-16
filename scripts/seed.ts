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

/** Extra members so the leaderboard and badge shelf have something to show. */
const SEED_MEMBERS = [
  { id: 'u_seed_m1', name: 'Priya Natarajan', email: 'priya@test.local' },
  { id: 'u_seed_m2', name: 'Diego Ramirez', email: 'diego@test.local' },
  { id: 'u_seed_m3', name: 'Lena Kowalski', email: 'lena@test.local' },
  { id: 'u_seed_m4', name: 'Theo Bassett', email: 'theo@test.local' },
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
  lines.push(`DELETE FROM point_entry WHERE id LIKE 'pe_seed_%';`)
  lines.push(`DELETE FROM rsvp WHERE id LIKE 'r_seed_%';`)

  for (const u of SEED_USERS) {
    lines.push(
      `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at, role, bio, grad_year, skills) VALUES (${q(u.id)}, ${q(u.name)}, ${q(u.email)}, 1, NULL, ${now}, ${now}, ${q(u.role)}, NULL, NULL, '[]');`,
    )
    lines.push(
      `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES (${q(`acc_${u.id}`)}, ${q(u.id)}, 'credential', ${q(u.id)}, ${q(hash)}, ${now}, ${now});`,
    )
  }

  for (const u of SEED_MEMBERS) {
    lines.push(
      `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at, role, bio, grad_year, skills) VALUES (${q(u.id)}, ${q(u.name)}, ${q(u.email)}, 1, NULL, ${now}, ${now}, 'member', NULL, NULL, '[]');`,
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

  lines.push(`DELETE FROM officer WHERE id LIKE 'o_seed_%';`)
  const officers = [
    [
      'o_seed_1',
      'Jashan Maan',
      'President',
      'Runs the club, ships the website, and teaches at RAP.',
      'https://github.com/JashanMaan28',
      1,
    ],
    [
      'o_seed_2',
      'Sahib S.',
      'Vice President',
      'Plans hackathons and keeps the Discord alive.',
      null,
      2,
    ],
    [
      'o_seed_3',
      'Miguel A.',
      'Outreach',
      'Coordinates the Ripon Afterschool Program volunteers.',
      null,
      3,
    ],
  ] as const
  for (const [id, name, title, bio, gh, order] of officers) {
    lines.push(
      `INSERT INTO officer (id, name, title, bio, email, github_url, image_key, sort_order, is_active, created_at, updated_at) VALUES (${q(id)}, ${q(name)}, ${q(title)}, ${q(bio)}, NULL, ${q(gh)}, NULL, ${order}, 1, ${now}, ${now});`,
    )
  }

  lines.push(`DELETE FROM post WHERE id LIKE 'p_seed_%';`)
  lines.push(
    `INSERT INTO post (id, title, slug, summary, content, tags, author_id, legacy_author_email, published_at, created_at, updated_at) VALUES ('p_seed_1', 'Welcome to the new site', 'welcome-to-the-new-site', 'We rebuilt the club website from scratch. Here is what changed and why.', ${q('# Welcome\n\nThe club site now runs on **TanStack Start** and Cloudflare. Points are a ledger, badges award themselves, and the leaderboard finally has a weekly view.\n\n```ts\nconst hello = "world"\n```')}, '["announcement"]', 'u_officer', NULL, ${now - 2 * day}, ${now - 2 * day}, ${now - 2 * day});`,
  )
  lines.push(
    `INSERT INTO post (id, title, slug, summary, content, tags, author_id, legacy_author_email, published_at, created_at, updated_at) VALUES ('p_seed_2', 'How the STEM teaching program works', 'how-the-stem-teaching-program-works', 'What to expect on your first Tuesday at Ripon Elementary.', ${q('Show up at 2:45, grab a lanyard, and find your group. Lessons are 40 minutes.')}, '["rap","volunteering"]', 'u_officer', NULL, ${now - 9 * day}, ${now - 9 * day}, ${now - 9 * day});`,
  )

  lines.push(`DELETE FROM project WHERE id LIKE 'pr_seed_%';`)
  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_1', 'H2O usage tracker', 'A dashboard that shows how much water the school uses per week, built for the H2O hackathon.', '["TypeScript","React","D1"]', 'https://github.com/RHS-Coding-Club', NULL, '[]', 'u_member', 'approved', NULL, 1, 2026, 'u_officer', ${now - 3 * day}, ${now - 5 * day}, ${now - 3 * day});`,
  )
  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_2', 'Lunch line estimator', 'Predicts how long the cafeteria line is from a photo.', '["Python","OpenCV"]', NULL, NULL, '[]', 'u_member', 'pending', NULL, 0, 2026, NULL, NULL, ${now - 1 * day}, ${now - 1 * day});`,
  )

  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_3', 'Bell schedule widget', 'A tiny PWA that shows the current period and minutes left, with the rally-day schedule built in.', '["JavaScript","PWA"]', 'https://github.com/RHS-Coding-Club', NULL, '[]', 'u_officer', 'approved', NULL, 0, 2026, 'u_admin', ${now - 8 * day}, ${now - 12 * day}, ${now - 8 * day});`,
  )
  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_4', 'RAP lesson planner', 'Drag-and-drop planner the volunteers use to build 40-minute STEM lessons for Ripon Elementary.', '["TypeScript","React"]', NULL, 'https://example.com', '[]', 'u_member', 'approved', NULL, 0, 2026, 'u_officer', ${now - 20 * day}, ${now - 25 * day}, ${now - 20 * day});`,
  )
  lines.push(`DELETE FROM user_badge WHERE id LIKE 'ub_seed_%';`)
  const awards = [
    ['ub_seed_1', 'u_member', 'b_seed_1', 4],
    ['ub_seed_2', 'u_seed_m1', 'b_seed_1', 6],
    ['ub_seed_3', 'u_seed_m1', 'b_seed_2', 2],
    ['ub_seed_4', 'u_seed_m2', 'b_seed_1', 5],
  ] as const
  for (const [id, userId, badgeId, daysAgo] of awards) {
    lines.push(
      `INSERT INTO user_badge (id, user_id, badge_id, awarded_by, awarded_at) VALUES (${q(id)}, ${q(userId)}, ${q(badgeId)}, NULL, ${now - daysAgo * day});`,
    )
  }

  // Points ledger: one row per award, never a stored total.
  const entries = [
    ['pe_seed_1', 'u_seed_m1', 50, 'submission', 'c_seed_1', 6],
    ['pe_seed_2', 'u_seed_m1', 100, 'submission', 'c_seed_2', 3],
    ['pe_seed_3', 'u_seed_m1', 25, 'attendance', 'e_seed_2', 14],
    ['pe_seed_4', 'u_seed_m2', 50, 'submission', 'c_seed_1', 5],
    ['pe_seed_5', 'u_seed_m2', 25, 'attendance', 'e_seed_2', 14],
    ['pe_seed_6', 'u_member', 50, 'submission', 'c_seed_1', 4],
    ['pe_seed_7', 'u_member', 150, 'project', 'pr_seed_1', 3],
    ['pe_seed_8', 'u_seed_m3', 25, 'attendance', 'e_seed_2', 14],
    ['pe_seed_9', 'u_seed_m3', 100, 'submission', 'c_seed_2', 1],
    ['pe_seed_10', 'u_seed_m4', 25, 'attendance', 'e_seed_2', 14],
  ] as const
  for (const [id, userId, delta, source, sourceId, daysAgo] of entries) {
    lines.push(
      `INSERT INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) VALUES (${q(id)}, ${q(userId)}, ${delta}, ${q(source)}, ${q(sourceId)}, NULL, 'u_officer', ${now - daysAgo * day});`,
    )
  }

  const rsvps = ['u_member', 'u_seed_m1', 'u_seed_m2', 'u_seed_m3', 'u_officer'] as const
  rsvps.forEach((userId, i) => {
    lines.push(
      `INSERT INTO rsvp (id, event_id, user_id, status, created_at, updated_at) VALUES (${q(`r_seed_${i + 1}`)}, 'e_seed_1', ${q(userId)}, 'yes', ${now}, ${now});`,
    )
  })

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
    `Seeded ${SEED_USERS.length + SEED_MEMBERS.length} users (password: ${SEED_PASSWORD}) and sample content.`,
  )
}

if (import.meta.main) {
  await main()
}
