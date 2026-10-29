import { DAY, q } from './util'
import type { SeedContext } from './util'

/** Badges, awards, the points ledger, and applications. Runs last: it references every other domain. */
export function seedMembers({ now }: SeedContext): string[] {
  const lines: string[] = []
  lines.push(
    `INSERT INTO badge (id, name, description, image_key, rarity, criteria_type, threshold, auto_award, sort_order, is_active, created_at, updated_at) VALUES ('b_seed_1', 'First Blood', 'Passed your first challenge.', NULL, 'common', 'challenges', 1, 1, 1, 1, ${now}, ${now});`,
  )
  lines.push(
    `INSERT INTO badge (id, name, description, image_key, rarity, criteria_type, threshold, auto_award, sort_order, is_active, created_at, updated_at) VALUES ('b_seed_2', 'Centurion', 'Earned 100 points.', NULL, 'rare', 'points', 100, 1, 2, 1, ${now}, ${now});`,
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
      `INSERT INTO user_badge (id, user_id, badge_id, awarded_by, awarded_at) VALUES (${q(id)}, ${q(userId)}, ${q(badgeId)}, NULL, ${now - daysAgo * DAY});`,
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
      `INSERT INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) VALUES (${q(id)}, ${q(userId)}, ${delta}, ${q(source)}, ${q(sourceId)}, NULL, 'u_officer', ${now - daysAgo * DAY});`,
    )
  }

  return lines
}
