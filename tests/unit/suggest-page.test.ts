import { describe, expect, it } from 'vitest'
import { suggestPage } from '#/lib/suggest-page'

describe('suggestPage', () => {
  it('fixes a typo in the first segment', () => {
    expect(suggestPage('/chalenges/week-9')).toEqual({
      to: '/challenges',
      label: 'Challenges',
    })
    expect(suggestPage('/evnts')).toEqual({ to: '/events', label: 'Events' })
    expect(suggestPage('/LEADERBORD')).toEqual({
      to: '/leaderboard',
      label: 'Leaderboard',
    })
  })

  it('points a missing item at its section', () => {
    expect(suggestPage('/blog/an-old-post')).toEqual({ to: '/blog', label: 'Blog' })
  })

  it('gives up when nothing is close', () => {
    expect(suggestPage('/')).toBeNull()
    expect(suggestPage('/wp-admin')).toBeNull()
    expect(suggestPage('/xyz')).toBeNull()
  })
})
