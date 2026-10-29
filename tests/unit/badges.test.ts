import { describe, expect, it } from 'vitest'
import { qualifyingBadges } from '#/lib/badges'

const base = { autoAward: true, isActive: true }
const badges = [
  { ...base, id: 'pts', criteriaType: 'points' as const, threshold: 100 },
  { ...base, id: 'ch', criteriaType: 'challenges' as const, threshold: 1 },
  { ...base, id: 'off', criteriaType: 'events' as const, threshold: 1, isActive: false },
  {
    ...base,
    id: 'manual',
    criteriaType: 'events' as const,
    threshold: 1,
    autoAward: false,
  },
  { ...base, id: 'custom', criteriaType: 'custom' as const, threshold: 0 },
  { ...base, id: 'nothreshold', criteriaType: 'projects' as const, threshold: null },
]

describe('qualifyingBadges', () => {
  it('awards only active, auto, threshold badges the stats meet', () => {
    const got = qualifyingBadges(badges, {
      points: 100,
      challenges: 0,
      events: 5,
      projects: 3,
    })
    expect(got.map((b) => b.id)).toEqual(['pts'])
  })
  it('awards nothing below every threshold', () => {
    expect(
      qualifyingBadges(badges, { points: 99, challenges: 0, events: 0, projects: 0 }),
    ).toEqual([])
  })
})
