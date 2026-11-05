import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BRAND, BRAND_TOKENS } from '#/lib/static-palette'

const css = readFileSync('src/styles.css', 'utf8')

describe('static palette', () => {
  for (const [key, token] of Object.entries(BRAND_TOKENS)) {
    it(`${key} matches ${token} in styles.css`, () => {
      const match = new RegExp(`${token}:\\s*(#[0-9a-fA-F]+);`).exec(css)
      expect(match?.[1]).toBe(BRAND[key as keyof typeof BRAND])
    })
  }
})
