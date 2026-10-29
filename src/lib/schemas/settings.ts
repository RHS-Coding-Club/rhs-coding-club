import { z } from 'zod'
import {
  clubInfoSchema,
  emailSchema,
  githubOrgSchema,
  pointsSchema,
  socialSchema,
} from '#/lib/settings'
import type { SettingKey } from '#/lib/settings'

// The admin settings form posts one group at a time; the value is validated
// by that group's schema from src/lib/settings.ts.

export const saveSettingSchema = z.discriminatedUnion('key', [
  z.object({ key: z.literal('club-info'), value: clubInfoSchema }),
  z.object({ key: z.literal('social'), value: socialSchema }),
  z.object({ key: z.literal('points'), value: pointsSchema }),
  z.object({ key: z.literal('github-org'), value: githubOrgSchema }),
  z.object({ key: z.literal('email'), value: emailSchema }),
])
export type SaveSettingInput = z.infer<typeof saveSettingSchema>

export const SETTING_GROUPS: { key: SettingKey; label: string; description: string }[] = [
  {
    key: 'club-info',
    label: 'Club info',
    description:
      'Name, tagline, and where and when the club meets. Shown on the home, about, and contact pages.',
  },
  {
    key: 'social',
    label: 'Social',
    description: 'Links in the footer, on the about page, and on the contact page.',
  },
  {
    key: 'points',
    label: 'Points',
    description:
      'What each kind of work is worth. Changes apply to new reviews, not past ones.',
  },
  {
    key: 'github-org',
    label: 'GitHub org',
    description:
      'What members see once their invite to the RHS-Coding-Club org goes out.',
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Sender details and which notifications the club sends at all.',
  },
]
