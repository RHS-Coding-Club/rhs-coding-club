import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BRAND, BRAND_TOKENS, STATIC_GROUND } from '#/lib/static-palette'

const css = readFileSync('src/styles.css', 'utf8')

describe('static palette', () => {
  for (const [key, token] of Object.entries(BRAND_TOKENS)) {
    it(`${key} matches ${token} in styles.css`, () => {
      const match = new RegExp(`${token}:\\s*(#[0-9a-fA-F]+);`).exec(css)
      expect(match?.[1]).toBe(BRAND[key as keyof typeof BRAND])
    })
  }

  it('ground colors match --background in both themes', () => {
    const light = /:root\s*\{[^}]*?--background:\s*(#[0-9a-fA-F]+);/.exec(css)
    const dark = /\.dark\s*\{[^}]*?--background:\s*(#[0-9a-fA-F]+);/.exec(css)
    expect(light?.[1]).toBe(STATIC_GROUND.light)
    expect(dark?.[1]).toBe(STATIC_GROUND.dark)
  })
})
