import { describe, expect, it } from 'vitest'
import {
  classifyInviteResponse,
  githubRequestSchema,
  requestTimeline,
} from '#/lib/schemas/github'
import {
  matchesQuery,
  parseTags,
  resourceDomain,
  suggestResourceSchema,
} from '#/lib/schemas/resources'
import { maskEmail, subscribersToCsv } from '#/lib/schemas/newsletter'
import { badgeSchema, criteriaSummary } from '#/lib/schemas/badges'
import { contactSchema } from '#/lib/schemas/contact'
import { serverErrorMessage } from '#/lib/schemas/community'

describe('github username', () => {
  const parse = (githubUsername: string) =>
    githubRequestSchema.safeParse({ githubUsername })
  it('accepts real usernames and strips @ and profile URLs', () => {
    expect(parse('octocat').success).toBe(true)
    expect(parse('a-b-c1').success).toBe(true)
    expect(parse('@octocat').data?.githubUsername).toBe('octocat')
    expect(parse('https://github.com/Octo-Cat').data?.githubUsername).toBe('Octo-Cat')
  })
  it('rejects what GitHub rejects', () => {
    for (const bad of [
      '',
      '-lead',
      'trail-',
      'dou--ble',
      'has space',
      'a'.repeat(40),
      'dot.ted',
    ])
      expect(parse(bad).success, bad).toBe(false)
  })
})

describe('requestTimeline', () => {
  const at = new Date(0)
  const base = {
    createdAt: at,
    reviewedAt: null,
    inviteSentAt: null,
    joinedAt: null,
    adminNote: null,
  }
  const states = (status: Parameters<typeof requestTimeline>[0]['status']) =>
    requestTimeline({ ...base, status }).map((s) => `${s.key}:${s.state}`)

  it('walks requested, approved, invited, joined', () => {
    expect(states('pending')).toEqual([
      'requested:done',
      'approved:current',
      'invited:upcoming',
      'joined:upcoming',
    ])
    expect(states('approved')).toEqual([
      'requested:done',
      'approved:done',
      'invited:current',
      'joined:upcoming',
    ])
    expect(states('invite-sent')).toEqual([
      'requested:done',
      'approved:done',
      'invited:done',
      'joined:current',
    ])
    expect(states('joined').every((s) => s.endsWith(':done'))).toBe(true)
    expect(states('already-member').every((s) => s.endsWith(':done'))).toBe(true)
  })

  it('ends at a denied step carrying the note', () => {
    const steps = requestTimeline({
      ...base,
      status: 'denied',
      adminNote: 'Use your school account.',
    })
    expect(steps.map((s) => s.key)).toEqual(['requested', 'denied'])
    expect(steps[1]).toMatchObject({
      state: 'denied',
      detail: 'Use your school account.',
    })
  })
})

describe('classifyInviteResponse', () => {
  it('maps GitHub responses onto statuses', () => {
    expect(classifyInviteResponse(201, {})).toEqual({ status: 'invite-sent' })
    expect(
      classifyInviteResponse(422, {
        message: 'Validation Failed',
        errors: [{ message: 'Invitee is already a part of this organization' }],
      }),
    ).toEqual({ status: 'already-member' })
    expect(
      classifyInviteResponse(422, {
        errors: [{ message: 'Invitee already has a pending invitation' }],
      }),
    ).toEqual({ status: 'already-invited' })
    const other = classifyInviteResponse(403, { message: 'Must have admin rights' })
    expect(other).toMatchObject({ status: 'approved' })
    expect(other.status === 'approved' && other.error).toMatch(
      /403: Must have admin rights/,
    )
  })
})

describe('resource helpers', () => {
  it('extracts the domain and normalizes tags', () => {
    expect(resourceDomain('https://www.freecodecamp.org/learn')).toBe('freecodecamp.org')
    expect(parseTags('Python, web,  python ,,')).toEqual(['python', 'web'])
  })
  it('searches title, description, domain, and tags', () => {
    const r = {
      title: 'CS50',
      description: 'Harvard intro',
      url: 'https://cs50.harvard.edu',
      tags: ['c'],
    }
    expect(matchesQuery(r, 'harvard')).toBe(true)
    expect(matchesQuery(r, 'cs50.harv')).toBe(true)
    expect(matchesQuery(r, 'rust')).toBe(false)
    expect(matchesQuery(r, '  ')).toBe(true)
  })
  it('only takes http(s) links', () => {
    const ok = {
      title: 'A link',
      description: 'Ten chars at least',
      level: 'beginner',
      tags: [],
    }
    expect(suggestResourceSchema.safeParse({ ...ok, url: 'https://x.dev' }).success).toBe(
      true,
    )
    expect(
      suggestResourceSchema.safeParse({ ...ok, url: 'javascript:alert(1)' }).success,
    ).toBe(false)
  })
})

describe('newsletter helpers', () => {
  it('masks emails for the unsubscribe screen', () => {
    expect(maskEmail('ada.lovelace@test.local')).toBe('ad•••@test.local')
    expect(maskEmail('a@b.c')).toBe('a•••@b.c')
  })
  it('exports CSV with escaping and status', () => {
    const csv = subscribersToCsv([
      { email: 'a@test.local', subscribedAt: new Date(0), unsubscribedAt: null },
      {
        email: 'we,ird"@test.local',
        subscribedAt: new Date(0),
        unsubscribedAt: new Date(1000),
      },
    ])
    expect(csv.split('\n')).toEqual([
      'email,status,subscribed_at,unsubscribed_at',
      'a@test.local,active,1970-01-01T00:00:00.000Z,',
      '"we,ird""@test.local",unsubscribed,1970-01-01T00:00:00.000Z,1970-01-01T00:00:01.000Z',
      '',
    ])
  })
})

describe('badge schema', () => {
  const base = {
    name: 'First Solve',
    description: 'Pass a challenge.',
    imageKey: null,
    rarity: 'common',
    criteriaType: 'challenges',
    threshold: 1,
    autoAward: true,
    sortOrder: 0,
    isActive: true,
  } as const
  it('needs a threshold for automatic criteria and forbids auto custom badges', () => {
    expect(badgeSchema.safeParse(base).success).toBe(true)
    expect(badgeSchema.safeParse({ ...base, threshold: null }).success).toBe(false)
    expect(badgeSchema.safeParse({ ...base, criteriaType: 'custom' }).success).toBe(false)
    expect(
      badgeSchema.safeParse({
        ...base,
        criteriaType: 'custom',
        autoAward: false,
        threshold: null,
      }).success,
    ).toBe(true)
  })
  it('summarizes the rule', () => {
    expect(criteriaSummary(base)).toBe('Pass 1 challenge')
    expect(criteriaSummary({ ...base, criteriaType: 'points', threshold: 500 })).toBe(
      'Reach 500 points',
    )
    expect(criteriaSummary({ ...base, criteriaType: 'custom', threshold: null })).toBe(
      'Awarded by officers',
    )
  })
})

describe('contact schema', () => {
  it('enforces the message length', () => {
    const ok = {
      name: 'Ada',
      email: ' ada@test.local ',
      subject: 'Hi',
      message: 'Hello there, club.',
    }
    expect(contactSchema.parse(ok).email).toBe('ada@test.local')
    expect(contactSchema.safeParse({ ...ok, message: 'short' }).success).toBe(false)
    expect(contactSchema.safeParse({ ...ok, message: 'x'.repeat(5001) }).success).toBe(
      false,
    )
  })
})

describe('serverErrorMessage', () => {
  it('pulls the first message out of a serialized Zod error', () => {
    const err = new Error(
      JSON.stringify([{ code: 'too_small', message: 'Write at least 10 characters.' }]),
    )
    expect(serverErrorMessage(err)).toBe('Write at least 10 characters.')
    expect(serverErrorMessage(new Error('FORBIDDEN'))).toMatch(/permission/)
    expect(serverErrorMessage(new Error('Plain words.'))).toBe('Plain words.')
    expect(serverErrorMessage(null, 'Fallback')).toBe('Fallback')
  })
})
