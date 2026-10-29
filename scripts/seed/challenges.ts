import { q } from './util'
import type { SeedContext } from './util'

/** Challenges and submissions. Owned by the challenges domain. */
export function seedChallenges({ now }: SeedContext): string[] {
  const lines: string[] = []
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

  return lines
}
