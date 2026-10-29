import { DAY, q } from './util'
import type { SeedContext } from './util'

/** Events, RSVPs, and attendance. Owned by the events domain. */
export function seedEvents({ now }: SeedContext): string[] {
  const lines: string[] = []
  lines.push(
    `INSERT INTO event (id, title, description, starts_at, ends_at, location, tags, cover_key, created_by, created_at, updated_at) VALUES ('e_seed_1', 'First Meeting', 'Ripon Afterschool Program volunteer dates, H2O hackathon groups, and more.', ${now + 7 * DAY}, ${now + 7 * DAY + 3600_000}, "Mr. Derrick's classroom", '["meeting"]', NULL, 'u_officer', ${now}, ${now});`,
  )
  lines.push(
    `INSERT INTO event (id, title, description, starts_at, ends_at, location, tags, cover_key, created_by, created_at, updated_at) VALUES ('e_seed_2', 'STEM Teaching Program w/ RAP', 'Teach afterschool students STEM and art principles through interactive activities.', ${now - 14 * DAY}, ${now - 14 * DAY + 3600_000}, 'Ripon Elementary', '["volunteering","rap"]', NULL, 'u_officer', ${now}, ${now});`,
  )

  const rsvps = ['u_member', 'u_seed_m1', 'u_seed_m2', 'u_seed_m3', 'u_officer'] as const
  rsvps.forEach((userId, i) => {
    lines.push(
      `INSERT INTO rsvp (id, event_id, user_id, status, created_at, updated_at) VALUES (${q(`r_seed_${i + 1}`)}, 'e_seed_1', ${q(userId)}, 'yes', ${now}, ${now});`,
    )
  })

  return lines
}
