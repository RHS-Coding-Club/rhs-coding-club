import { describe, expect, it } from 'vitest'
import {
  canSubmit,
  challengeFormSchema,
  challengeState,
  fromClubWallTime,
  highlightLanguage,
  isHttpsUrl,
  memberProgress,
  nextWeekNo,
  shouldAnnounce,
  submitSolutionSchema,
  toClubWallTime,
} from '#/lib/schemas/challenges'

const now = new Date('2026-10-29T19:00:00.000Z')
const day = 24 * 60 * 60 * 1000

describe('challengeState', () => {
  it('is draft without a publish time, scheduled in the future, live otherwise', () => {
    expect(challengeState(null, now)).toBe('draft')
    expect(challengeState(undefined, now)).toBe('draft')
    expect(challengeState(new Date(now.getTime() + 1), now)).toBe('scheduled')
    expect(challengeState(now, now)).toBe('live')
    expect(challengeState(now.getTime() - day, now)).toBe('live')
  })
})

describe('shouldAnnounce', () => {
  it('announces live, unannounced challenges from the last week only', () => {
    expect(shouldAnnounce({ publishedAt: now, announcedAt: null }, now)).toBe(true)
    expect(
      shouldAnnounce({ publishedAt: now.getTime() - 6 * day, announcedAt: null }, now),
    ).toBe(true)
    expect(
      shouldAnnounce({ publishedAt: now.getTime() - 8 * day, announcedAt: null }, now),
    ).toBe(false)
    expect(shouldAnnounce({ publishedAt: now, announcedAt: now }, now)).toBe(false)
    expect(
      shouldAnnounce({ publishedAt: now.getTime() + day, announcedAt: null }, now),
    ).toBe(false)
    expect(shouldAnnounce({ publishedAt: null, announcedAt: null }, now)).toBe(false)
  })
})

describe('submission rules', () => {
  it('maps statuses to member progress', () => {
    expect(memberProgress(undefined)).toBe('not-started')
    expect(memberProgress('pending')).toBe('pending')
    expect(memberProgress('pass')).toBe('passed')
    expect(memberProgress('fail')).toBe('failed')
  })

  it('locks only passed submissions', () => {
    expect(canSubmit(null)).toBe(true)
    expect(canSubmit('pending')).toBe(true)
    expect(canSubmit('fail')).toBe(true)
    expect(canSubmit('pass')).toBe(false)
  })

  it('accepts https links only', () => {
    expect(isHttpsUrl('https://github.com/me/repo')).toBe(true)
    expect(isHttpsUrl('http://github.com/me/repo')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('https://localhost')).toBe(false)
    expect(isHttpsUrl('github.com/me')).toBe(false)
  })

  it('validates a submission', () => {
    const ok = submitSolutionSchema.safeParse({
      challengeId: 'c1',
      language: 'Python',
      platform: 'GitHub',
      url: '  https://github.com/me/w1  ',
    })
    expect(ok.success && ok.data.url).toBe('https://github.com/me/w1')
    const bad = submitSolutionSchema.safeParse({
      challengeId: 'c1',
      language: 'Brainfork',
      platform: 'GitHub',
      url: 'http://x.com',
      code: 'x'.repeat(20_001),
    })
    expect(bad.success).toBe(false)
    const fields = bad.error?.issues.map((i) => i.path[0]).sort()
    expect(fields).toEqual(['code', 'language', 'url'])
  })

  it('knows the highlighter for each language', () => {
    expect(highlightLanguage('C++')).toBe('cpp')
    expect(highlightLanguage('Other')).toBe('plaintext')
    expect(highlightLanguage('Fortran')).toBeNull()
  })
})

describe('nextWeekNo', () => {
  it('is one past the highest week', () => {
    expect(nextWeekNo([])).toBe(1)
    expect(nextWeekNo([3, 1, 7])).toBe(8)
  })
})

describe('club wall time', () => {
  it('round-trips in daylight and standard time', () => {
    expect(fromClubWallTime('2026-10-29T12:00')?.toISOString()).toBe(
      '2026-10-29T19:00:00.000Z',
    )
    expect(fromClubWallTime('2026-12-01T07:30')?.toISOString()).toBe(
      '2026-12-01T15:30:00.000Z',
    )
    expect(toClubWallTime(new Date('2026-10-29T19:00:00.000Z'))).toBe('2026-10-29T12:00')
    expect(toClubWallTime(new Date('2026-12-01T15:30:00.000Z'))).toBe('2026-12-01T07:30')
  })

  it('takes the earlier instant in the fall-back hour and skips the spring gap', () => {
    // Nov 1 2026, 1:30 AM happens twice; PDT (UTC-7) comes first.
    expect(fromClubWallTime('2026-11-01T01:30')?.toISOString()).toBe(
      '2026-11-01T08:30:00.000Z',
    )
    // Mar 14 2027, 2:30 AM does not exist; it lands after the jump.
    expect(toClubWallTime(fromClubWallTime('2027-03-14T02:30')!)).toBe('2027-03-14T03:30')
  })

  it('rejects malformed values', () => {
    expect(fromClubWallTime('2026-10-29')).toBeNull()
    expect(fromClubWallTime('nope')).toBeNull()
  })
})

describe('challengeFormSchema', () => {
  const form = {
    title: 'Spiral matrix',
    description: 'Print a grid in spiral order.',
    prompt: JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Go.' }] }],
    }),
    difficulty: 'hard',
    points: 200,
    weekNo: 7,
    sampleInput: '',
    sampleOutput: '',
  }

  it('requires a time when scheduling', () => {
    expect(challengeFormSchema.safeParse({ ...form, publishMode: 'draft' }).success).toBe(
      true,
    )
    const missing = challengeFormSchema.safeParse({ ...form, publishMode: 'schedule' })
    expect(missing.error?.issues[0]?.path).toEqual(['publishAt'])
    expect(
      challengeFormSchema.safeParse({
        ...form,
        publishMode: 'schedule',
        publishAt: '2026-11-02T07:00',
      }).success,
    ).toBe(true)
  })

  it('rejects an empty prompt', () => {
    const empty = challengeFormSchema.safeParse({
      ...form,
      publishMode: 'draft',
      prompt: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
    })
    expect(empty.error?.issues[0]?.path).toEqual(['prompt'])
  })
})
