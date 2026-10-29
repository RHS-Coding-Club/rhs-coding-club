import { DAY, q } from './util'
import type { SeedContext } from './util'

/** Projects (with teammates) and blog posts. Owned by the projects + blog domain. */
export function seedContent({ now }: SeedContext): string[] {
  const lines: string[] = []
  lines.push(`DELETE FROM project WHERE id LIKE 'pr_seed_%';`)
  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_1', 'H2O usage tracker', 'A dashboard that shows how much water the school uses per week, built for the H2O hackathon.', '["TypeScript","React","D1"]', 'https://github.com/RHS-Coding-Club', NULL, '[]', 'u_member', 'approved', NULL, 1, 2026, 'u_officer', ${now - 3 * DAY}, ${now - 5 * DAY}, ${now - 3 * DAY});`,
  )
  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_2', 'Lunch line estimator', 'Predicts how long the cafeteria line is from a photo.', '["Python","OpenCV"]', NULL, NULL, '[]', 'u_member', 'pending', NULL, 0, 2026, NULL, NULL, ${now - 1 * DAY}, ${now - 1 * DAY});`,
  )

  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_3', 'Bell schedule widget', 'A tiny PWA that shows the current period and minutes left, with the rally-day schedule built in.', '["JavaScript","PWA"]', 'https://github.com/RHS-Coding-Club', NULL, '[]', 'u_officer', 'approved', NULL, 0, 2026, 'u_admin', ${now - 8 * DAY}, ${now - 12 * DAY}, ${now - 8 * DAY});`,
  )
  lines.push(
    `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES ('pr_seed_4', 'RAP lesson planner', 'Drag-and-drop planner the volunteers use to build 40-minute STEM lessons for Ripon Elementary.', '["TypeScript","React"]', NULL, 'https://example.com', '[]', 'u_member', 'approved', NULL, 0, 2026, 'u_officer', ${now - 20 * DAY}, ${now - 25 * DAY}, ${now - 20 * DAY});`,
  )
  lines.push(`DELETE FROM post WHERE id LIKE 'p_seed_%';`)
  lines.push(
    `INSERT INTO post (id, title, slug, summary, content, tags, author_id, legacy_author_email, published_at, created_at, updated_at) VALUES ('p_seed_1', 'Welcome to the new site', 'welcome-to-the-new-site', 'We rebuilt the club website from scratch. Here is what changed and why.', ${q('# Welcome\n\nThe club site now runs on **TanStack Start** and Cloudflare. Points are a ledger, badges award themselves, and the leaderboard finally has a weekly view.\n\n```ts\nconst hello = "world"\n```')}, '["announcement"]', 'u_officer', NULL, ${now - 2 * DAY}, ${now - 2 * DAY}, ${now - 2 * DAY});`,
  )
  lines.push(
    `INSERT INTO post (id, title, slug, summary, content, tags, author_id, legacy_author_email, published_at, created_at, updated_at) VALUES ('p_seed_2', 'How the STEM teaching program works', 'how-the-stem-teaching-program-works', 'What to expect on your first Tuesday at Ripon Elementary.', ${q('Show up at 2:45, grab a lanyard, and find your group. Lessons are 40 minutes.')}, '["rap","volunteering"]', 'u_officer', NULL, ${now - 9 * DAY}, ${now - 9 * DAY}, ${now - 9 * DAY});`,
  )

  return lines
}
