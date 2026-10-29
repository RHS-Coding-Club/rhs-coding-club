import { DAY, q } from './util'
import type { SeedContext } from './util'

/**
 * Member profiles, badges and awards, the points ledger, and membership
 * applications. Runs LAST, after every other module, so it can read what they
 * seeded:
 *
 * - Ledger rows for passed submissions (`s_seed_*`) and attendance
 *   (`a_seed_*`) are derived with INSERT ... SELECT from those tables, so the
 *   points always match the challenge values and who actually checked in.
 *   `sourceId` is the submission id / event id, as the app writes it.
 * - `pe_seed_7` (u_member, pr_seed_1) stays hand-written; the content module
 *   skips that row on purpose. Other project points come from content.ts.
 * - Auto-award badges are granted from the same numbers the badge engine
 *   uses, so every badge on a profile is one the member actually qualifies for.
 */

const ATTENDANCE_POINTS = 25

const BADGES = [
  // id, name, description, rarity, criteria, threshold, autoAward, sort
  [
    'b_seed_1',
    'First Blood',
    'Passed your first weekly challenge.',
    'common',
    'challenges',
    1,
    true,
    1,
  ],
  [
    'b_seed_3',
    'Showed Up',
    'Checked in at your first club event.',
    'common',
    'events',
    1,
    true,
    2,
  ],
  ['b_seed_2', 'Centurion', 'Earned 100 points.', 'rare', 'points', 100, true, 3],
  [
    'b_seed_4',
    'Regular',
    'Checked in at five club events.',
    'rare',
    'events',
    5,
    true,
    4,
  ],
  [
    'b_seed_5',
    'Shipped It',
    'Credited on a project approved for the showcase.',
    'rare',
    'projects',
    1,
    true,
    5,
  ],
  [
    'b_seed_6',
    'Hat Trick',
    'Passed three weekly challenges.',
    'epic',
    'challenges',
    3,
    true,
    6,
  ],
  ['b_seed_7', 'High Scorer', 'Earned 500 points.', 'epic', 'points', 500, true, 7],
  [
    'b_seed_8',
    'Serial Shipper',
    'Credited on three approved projects.',
    'epic',
    'projects',
    3,
    true,
    8,
  ],
  [
    'b_seed_9',
    'Legend of the Board',
    'Earned 1,000 points.',
    'legendary',
    'points',
    1000,
    true,
    9,
  ],
  [
    'b_seed_10',
    'RAP Mentor',
    'Taught a full semester of STEM afternoons at the Ripon Afterschool Program.',
    'epic',
    'custom',
    null,
    false,
    10,
  ],
  [
    'b_seed_11',
    'H2O Finalist',
    'Made the final round of the H2O hackathon.',
    'rare',
    'custom',
    null,
    false,
    11,
  ],
  [
    'b_seed_12',
    'Founding Member',
    'Helped rebuild the club in its first year on the new site.',
    'legendary',
    'custom',
    null,
    false,
    12,
  ],
] as const

/** Hand-picked custom badges: [userId, badgeId, awardedBy, daysAgo]. */
const CUSTOM_AWARDS = [
  ['u_seed_m1', 'b_seed_10', 'u_officer', 20],
  ['u_seed_m1', 'b_seed_12', 'u_admin', 60],
  ['u_seed_m2', 'b_seed_11', 'u_officer', 150],
  ['u_member', 'b_seed_11', 'u_officer', 150],
  ['u_officer', 'b_seed_12', 'u_admin', 60],
  ['u_admin', 'b_seed_12', 'u_admin', 60],
] as const

/** Officer bonuses and last year's points (so all time differs from this semester). */
const MANUAL = [
  // id, userId, delta, note, daysAgo, by
  [
    'pe_seed_m1',
    'u_seed_m2',
    300,
    'Spring 2026 hackathon: built the judging board',
    190,
    'u_admin',
  ],
  [
    'pe_seed_m2',
    'u_seed_m4',
    250,
    'Spring 2026: ran the Scratch club at RAP',
    170,
    'u_admin',
  ],
  [
    'pe_seed_m3',
    'u_seed_m1',
    120,
    'Spring 2026: weekly challenge streak',
    160,
    'u_admin',
  ],
  ['pe_seed_m4', 'u_seed_m1', 40, 'Ran the lunch session on recursion', 9, 'u_officer'],
  ['pe_seed_m5', 'u_seed_m3', 30, 'Helped set up laptops at RAP', 12, 'u_officer'],
  ['pe_seed_m6', 'u_member', -25, 'Duplicate check-in removed', 8, 'u_officer'],
  ['pe_seed_m7', 'u_officer', 60, 'Wrote three weekly challenges', 30, 'u_admin'],
] as const

const PROFILES = [
  [
    'u_admin',
    'Keeps the site running and the H2O hackathon on schedule.',
    2027,
    ['TypeScript', 'Cloudflare', 'Postgres'],
    'ada-admin',
  ],
  [
    'u_officer',
    'Writes the weekly challenges and reviews most of them too.',
    2027,
    ['Python', 'Java', 'Algorithms'],
    'olive-codes',
  ],
  [
    'u_member',
    'Building a water tracker for the school. Learning React one bug at a time.',
    2028,
    ['React', 'TypeScript', 'D1'],
    null,
  ],
  [
    'u_seed_m1',
    'Competitive programmer, RAP mentor on Tuesdays, and the reason the leaderboard is hard.',
    2027,
    ['C++', 'Python', 'Graphs', 'Teaching'],
    'priya-n',
  ],
  [
    'u_seed_m2',
    'Game dev. Made the H2O judging board in a weekend and refuses to stop adding features.',
    2028,
    ['Godot', 'C#', 'SvelteKit'],
    'diego-r',
  ],
  [
    'u_seed_m3',
    'Robotics team crossover. Likes anything with a sensor attached.',
    2029,
    ['Arduino', 'Python', 'Raspberry Pi'],
    'lenak',
  ],
  [
    'u_seed_m4',
    'Teaches Scratch at RAP and is slowly moving everyone to Python.',
    2026,
    ['Scratch', 'Python'],
    null,
  ],
] as const

/** Guests waiting on (or turned away from) membership. No logins. */
const GUESTS = [
  ['u_seed_g1', 'Ava Chen', 'ava@test.local', 3],
  ['u_seed_g2', 'Marco Ruiz', 'marco@test.local', 9],
  ['u_seed_g3', 'Sam Patel', 'sam@test.local', 1],
] as const

const APPLICATIONS = [
  {
    id: 'ma_seed_1',
    userId: 'u_seed_g1',
    grade: '9',
    experience: 'none',
    languages: ['None yet'],
    interests: ['Games', 'Teaching at RAP'],
    goals: 'Make my first game, even a tiny one, and figure out if I like programming.',
    whyJoin:
      'My older brother was in the club and said the RAP afternoons were the best part.',
    availability: 'Lunch meetings, RAP afternoons',
    github: null,
    status: 'pending',
    daysAgo: 2,
  },
  {
    id: 'ma_seed_2',
    userId: 'u_seed_g3',
    grade: '11',
    experience: 'comfortable',
    languages: ['Python', 'JavaScript', 'HTML/CSS'],
    interests: ['Web apps', 'Hackathons', 'AI and machine learning'],
    goals: 'Ship something real at H2O and get better at working on a team repo.',
    whyJoin: 'I have been coding alone for two years and want people to build with.',
    availability: 'Lunch meetings, Weekend hackathons',
    github: 'sampatel-dev',
    status: 'pending',
    daysAgo: 0.5,
  },
  {
    id: 'ma_seed_3',
    userId: 'u_seed_g2',
    grade: '10',
    experience: 'some',
    languages: ['Scratch'],
    interests: ['Robotics'],
    goals: 'idk',
    whyJoin: 'friend',
    availability: 'Online only',
    github: null,
    status: 'rejected',
    note: 'Thanks for applying, Marco. Tell us a bit more about what you want to build, and try to make a lunch meeting so we can meet you.',
    daysAgo: 8,
    reviewedAgo: 6,
  },
  {
    id: 'ma_seed_4',
    userId: 'u_seed_m3',
    grade: '9',
    experience: 'some',
    languages: ['Python'],
    interests: ['Robotics', 'Competitive programming'],
    goals: 'Get good enough at Python to help the robotics team with vision code.',
    whyJoin: 'The club sounds like the robotics team but with less waiting for parts.',
    availability: 'Lunch meetings',
    github: 'lenak',
    status: 'approved',
    daysAgo: 70,
    reviewedAgo: 68,
  },
  {
    id: 'ma_seed_5',
    userId: 'u_seed_m4',
    grade: '12',
    experience: 'advanced',
    languages: ['Scratch', 'Python'],
    interests: ['Teaching at RAP'],
    goals: 'Run the Scratch table at RAP every week.',
    whyJoin: 'I teach my little sister already. Might as well teach twenty kids.',
    availability: 'RAP afternoons',
    github: null,
    status: 'approved',
    daysAgo: 75,
    reviewedAgo: 74,
  },
] as const

export function seedMembers({ now }: SeedContext): string[] {
  const lines: string[] = []
  const ago = (days: number) => Math.round(now - days * DAY)

  // seed.ts already wiped seeded users (cascading their rows), badges, and
  // pe_seed_* ledger rows; these keep the module safe to re-run on its own.
  lines.push(`DELETE FROM user_badge WHERE id LIKE 'ub_seed_%';`)
  lines.push(`DELETE FROM membership_application WHERE id LIKE 'ma_seed_%';`)

  // ---------- profiles ----------
  for (const [id, bio, grad, skills, gh] of PROFILES) {
    lines.push(
      `UPDATE user SET bio = ${q(bio)}, grad_year = ${grad}, skills = ${q(JSON.stringify(skills))}${gh ? `, github_username = coalesce(github_username, ${q(gh)})` : ''} WHERE id = ${q(id)};`,
    )
  }
  for (const [id, name, email, daysAgo] of GUESTS) {
    lines.push(
      `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at, role, bio, grad_year, skills) VALUES (${q(id)}, ${q(name)}, ${q(email)}, 1, NULL, ${ago(daysAgo)}, ${ago(daysAgo)}, 'guest', NULL, NULL, '[]');`,
    )
  }

  // ---------- applications ----------
  for (const a of APPLICATIONS) {
    const reviewed = 'reviewedAgo' in a ? ago(a.reviewedAgo) : null
    lines.push(
      `INSERT INTO membership_application (id, user_id, grade, experience, languages, interests, goals, why_join, availability, github_username, status, review_note, reviewed_by, reviewed_at, created_at, updated_at) VALUES (${q(a.id)}, ${q(a.userId)}, ${q(a.grade)}, ${q(a.experience)}, ${q(JSON.stringify(a.languages))}, ${q(JSON.stringify(a.interests))}, ${q(a.goals)}, ${q(a.whyJoin)}, ${q(a.availability)}, ${q(a.github)}, ${q(a.status)}, ${q('note' in a ? a.note : null)}, ${reviewed === null ? 'NULL' : "'u_officer'"}, ${reviewed ?? 'NULL'}, ${ago(a.daysAgo)}, ${reviewed ?? ago(a.daysAgo)});`,
    )
  }

  // ---------- points ledger ----------
  // Kept by hand: the content module skips u_member's pr_seed_1 grant.
  lines.push(
    `INSERT INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) VALUES ('pe_seed_7', 'u_member', 150, 'project', 'pr_seed_1', NULL, 'u_officer', ${ago(3)});`,
  )
  // One grant per passed submission, worth the challenge's points.
  lines.push(
    `INSERT INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) SELECT 'pe_seed_sub_' || s.id, s.user_id, c.points, 'submission', s.id, NULL, s.reviewed_by, coalesce(s.reviewed_at, s.submitted_at) FROM submission s JOIN challenge c ON c.id = s.challenge_id WHERE s.id LIKE 's_seed_%' AND s.status = 'pass';`,
  )
  // One grant per check-in (sourceId is the event, as events.ts settles it).
  lines.push(
    `INSERT INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) SELECT 'pe_seed_att_' || a.id, a.user_id, ${ATTENDANCE_POINTS}, 'attendance', a.event_id, NULL, a.marked_by, a.marked_at FROM attendance a WHERE a.id LIKE 'a_seed_%';`,
  )
  for (const [id, userId, delta, note, daysAgo, by] of MANUAL) {
    lines.push(
      `INSERT INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) VALUES (${q(id)}, ${q(userId)}, ${delta}, 'manual', NULL, ${q(note)}, ${q(by)}, ${ago(daysAgo)});`,
    )
  }

  // ---------- badges ----------
  for (const [id, name, description, rarity, criteria, threshold, auto, sort] of BADGES) {
    lines.push(
      `INSERT INTO badge (id, name, description, image_key, rarity, criteria_type, threshold, auto_award, sort_order, is_active, created_at, updated_at) VALUES (${q(id)}, ${q(name)}, ${q(description)}, NULL, ${q(rarity)}, ${q(criteria)}, ${q(threshold)}, ${q(auto)}, ${sort}, 1, ${ago(200)}, ${ago(200)});`,
    )
  }

  // Auto-award what each seeded user qualifies for, from the same stats the
  // badge engine reads. Awarded at the time of their latest qualifying row.
  const stat = {
    points: {
      value: `(SELECT coalesce(sum(delta), 0) FROM point_entry WHERE user_id = u.id)`,
      at: `(SELECT max(created_at) FROM point_entry WHERE user_id = u.id)`,
    },
    challenges: {
      value: `(SELECT count(*) FROM submission WHERE user_id = u.id AND status = 'pass')`,
      at: `(SELECT max(coalesce(reviewed_at, submitted_at)) FROM submission WHERE user_id = u.id AND status = 'pass')`,
    },
    events: {
      value: `(SELECT count(*) FROM attendance WHERE user_id = u.id)`,
      at: `(SELECT max(marked_at) FROM attendance WHERE user_id = u.id)`,
    },
    projects: {
      value: `(SELECT count(*) FROM project_member pm JOIN project p ON p.id = pm.project_id WHERE pm.user_id = u.id AND p.status = 'approved')`,
      at: `(SELECT max(coalesce(p.reviewed_at, p.created_at)) FROM project_member pm JOIN project p ON p.id = pm.project_id WHERE pm.user_id = u.id AND p.status = 'approved')`,
    },
  }
  for (const [criteria, s] of Object.entries(stat)) {
    lines.push(
      `INSERT INTO user_badge (id, user_id, badge_id, awarded_by, awarded_at) SELECT 'ub_seed_' || b.id || '_' || u.id, u.id, b.id, NULL, coalesce(${s.at}, ${now}) FROM user u JOIN badge b ON b.id LIKE 'b_seed_%' AND b.auto_award = 1 AND b.criteria_type = ${q(criteria)} WHERE u.email LIKE '%@test.local' AND ${s.value} >= b.threshold;`,
    )
  }
  for (const [userId, badgeId, by, daysAgo] of CUSTOM_AWARDS) {
    lines.push(
      `INSERT INTO user_badge (id, user_id, badge_id, awarded_by, awarded_at) VALUES (${q(`ub_seed_${badgeId}_${userId}`)}, ${q(userId)}, ${q(badgeId)}, ${q(by)}, ${ago(daysAgo)});`,
    )
  }

  return lines
}
