import { describe, expect, it } from 'vitest'
import { weekKey } from '#/lib/dates'
import { formatDelta, ledgerLabel } from '#/components/members/ledger'
import { semesterName } from '#/components/members/leaderboard-helpers'
import { initialsPortrait } from '#/components/members/portrait'
import {
  cleanSkills,
  expandPrefs,
  normalizeGithubUsername,
  profileSchema,
} from '#/lib/schemas/account'
import { applicationSchema, applicationSteps } from '#/lib/schemas/membership'
import { adjustPointsSchema } from '#/lib/schemas/users'

describe('ledgerLabel', () => {
  const ch = {
    kind: 'challenge',
    id: 'c',
    title: 'Reverse a linked list',
    weekNo: 3,
  } as const
  it('reads like a sentence', () => {
    expect(ledgerLabel({ source: 'submission', delta: 100, note: null, ref: ch })).toBe(
      'Passed Week 3: Reverse a linked list',
    )
    expect(ledgerLabel({ source: 'submission', delta: -100, note: null, ref: ch })).toBe(
      'Solve reversed, Week 3: Reverse a linked list',
    )
    expect(
      ledgerLabel({
        source: 'attendance',
        delta: 25,
        note: null,
        ref: { kind: 'event', id: 'e', title: 'First Meeting' },
      }),
    ).toBe('Attended: First Meeting')
    expect(
      ledgerLabel({
        source: 'project',
        delta: 150,
        note: null,
        ref: { kind: 'project', id: 'p', title: 'H2O tracker' },
      }),
    ).toBe('Project approved: H2O tracker')
  })
  it('falls back when the source row is gone, and uses the note for manual rows', () => {
    expect(ledgerLabel({ source: 'submission', delta: 50, note: null, ref: null })).toBe(
      'Passed a weekly challenge',
    )
    expect(ledgerLabel({ source: 'manual', delta: 40, note: 'Ran RAP', ref: null })).toBe(
      'Ran RAP',
    )
    expect(ledgerLabel({ source: 'manual', delta: -5, note: ' ', ref: null })).toBe(
      'Points correction',
    )
  })
  it('formats deltas with signs', () => {
    expect(formatDelta(1200)).toBe('+1,200')
    expect(formatDelta(-25)).toBe('−25')
    expect(formatDelta(0)).toBe('0')
  })
})

describe('semesterName', () => {
  it('names fall and spring', () => {
    expect(semesterName(new Date(Date.UTC(2026, 7, 1)))).toBe('Fall 2026')
    expect(semesterName(new Date(Date.UTC(2027, 0, 1)))).toBe('Spring 2027')
    expect(semesterName(undefined)).toBe('All time')
  })
})

describe('initialsPortrait', () => {
  it('is an SVG data URL with escaped initials', () => {
    const url = initialsPortrait('Ada <Lovelace>')
    expect(url.startsWith('data:image/svg+xml')).toBe(true)
    expect(decodeURIComponent(url)).toContain('>A&#60;<')
  })
})

describe('account schema', () => {
  it('normalizes GitHub handles', () => {
    expect(normalizeGithubUsername(' @octo-cat ')).toBe('octo-cat')
    expect(normalizeGithubUsername('https://github.com/octocat/')).toBe('octocat')
  })
  it('rejects invalid handles', () => {
    const base = { name: 'A', bio: '', gradYear: null, skills: [], avatarKey: null }
    for (const bad of ['-start', 'end-', 'two--hyphens', 'a'.repeat(40), 'sp ace'])
      expect(profileSchema.safeParse({ ...base, githubUsername: bad }).success).toBe(
        false,
      )
  })
  it('dedupes skills case-insensitively', () => {
    expect(cleanSkills([' React ', 'react', 'Node  JS', ''])).toEqual([
      'React',
      'Node JS',
    ])
  })
  it('limits the bio', () => {
    const base = {
      name: 'A',
      gradYear: null,
      skills: [],
      avatarKey: null,
      githubUsername: '',
    }
    expect(profileSchema.safeParse({ ...base, bio: 'x'.repeat(281) }).success).toBe(false)
    expect(profileSchema.parse({ ...base, bio: '  ' }).bio).toBeNull()
  })
  it('expands opt-outs into switches', () => {
    expect(expandPrefs({ weeklyDigest: false, newsletter: false })).toEqual({
      newChallenge: true,
      eventReminder: true,
      weeklyDigest: false,
      projectDecision: true,
      applicationDecision: true,
    })
  })
})

describe('application steps', () => {
  it('validate one step at a time', () => {
    expect(
      applicationSteps[0].safeParse({ grade: '13', experience: 'some' }).success,
    ).toBe(false)
    expect(
      applicationSteps[0].safeParse({ grade: '9', experience: 'some' }).success,
    ).toBe(true)
    expect(
      applicationSteps[1].safeParse({ languages: [], interests: ['Games'] }).success,
    ).toBe(false)
    expect(
      applicationSteps[2].safeParse({ goals: 'short', whyJoin: 'x'.repeat(20) }).success,
    ).toBe(false)
  })
  it('the full schema is the steps combined', () => {
    const ok = applicationSchema.safeParse({
      grade: '12',
      experience: 'advanced',
      languages: ['Rust'],
      interests: ['Hackathons'],
      goals: 'Win the H2O hackathon.',
      whyJoin: 'To mentor the freshmen.',
      availability: ['Lunch meetings'],
      githubUsername: '',
    })
    expect(ok.success && ok.data.githubUsername).toBeNull()
  })
})

describe('adjustPointsSchema', () => {
  it('needs a non-zero whole number and a note', () => {
    expect(
      adjustPointsSchema.safeParse({ userId: 'u', delta: 0, note: 'abc' }).success,
    ).toBe(false)
    expect(
      adjustPointsSchema.safeParse({ userId: 'u', delta: 1.5, note: 'abc' }).success,
    ).toBe(false)
    expect(
      adjustPointsSchema.safeParse({ userId: 'u', delta: -5, note: '' }).success,
    ).toBe(false)
    expect(
      adjustPointsSchema.safeParse({ userId: 'u', delta: -5, note: 'fix' }).success,
    ).toBe(true)
  })
})

describe('weekKey', () => {
  it('maps every day of a week to its Monday', () => {
    expect(weekKey(new Date('2026-10-26T16:00:00Z'))).toBe('2026-10-26')
    expect(weekKey(new Date('2026-11-01T23:00:00Z'))).toBe('2026-10-26')
    expect(weekKey(new Date('2026-11-02T00:00:00Z'))).toBe('2026-11-02')
  })
})
