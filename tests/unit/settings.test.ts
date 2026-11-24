import { describe, expect, it } from 'vitest'
import { resolveSetting } from '#/lib/settings'
import { initials, slugify } from '#/lib/format'
import { semesterStart } from '#/lib/dates'

describe('resolveSetting', () => {
  it('returns full defaults for a missing row', () => {
    const v = resolveSetting('points', undefined)
    expect(v).toEqual({
      easy: 50,
      medium: 100,
      hard: 200,
      project: 150,
      attendance: 25,
      showTop: 25,
    })
  })

  it('fills in only the missing fields', () => {
    const v = resolveSetting('club-info', { clubName: 'Test Club' })
    expect(v.clubName).toBe('Test Club')
    expect(v.meetingSchedule).toBe('Lunch, every week')
  })

  it('falls back to defaults when the stored value is malformed', () => {
    const v = resolveSetting('points', { easy: 'lots' })
    expect(v.easy).toBe(50)
  })
})

describe('format helpers', () => {
  it('builds initials from the first and last word', () => {
    expect(initials('Ada Lovelace')).toBe('AL')
    expect(initials('  grace   brewster hopper ')).toBe('GH')
    expect(initials('ada')).toBe('A')
    expect(initials('')).toBe('')
  })

  it('takes whole graphemes and skips emoji words', () => {
    expect(initials('🦊 Fox')).toBe('F')
    expect(initials('👩🏽‍💻 Priya Natarajan')).toBe('PN')
    expect(initials('Đặng Thị Ngọc Hân')).toBe('ĐH')
    expect(initials('王秀英')).toBe('王')
    expect(initials('🦊')).toBe('🦊')
    expect(initials('éclair')).toBe('É')
  })

  it('slugifies titles', () => {
    expect(slugify('Hello, World! 2026')).toBe('hello-world-2026')
    expect(slugify('  Café — Résumé  ')).toBe('cafe-resume')
    expect(slugify('---')).toBe('')
  })
})

describe('semesterStart', () => {
  it('is Aug 1 in the fall and Jan 1 in the spring', () => {
    expect(semesterStart(new Date(2026, 8, 15))).toEqual(new Date(2026, 7, 1))
    expect(semesterStart(new Date(2026, 2, 1))).toEqual(new Date(2026, 0, 1))
    expect(semesterStart(new Date(2026, 7, 1))).toEqual(new Date(2026, 7, 1))
  })
})
