import { q } from './util'
import type { SeedContext } from './util'

/** Officers, resources, GitHub requests, contact messages, newsletter. Owned by the community domain. */
export function seedCommunity({ now }: SeedContext): string[] {
  const lines: string[] = []
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

  return lines
}
