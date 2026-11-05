/**
 * Colors for output that can't read CSS variables: HTML email and images built
 * as data: URLs. These are the only brand hexes outside src/styles.css, and
 * tests/unit/static-palette.test.ts fails if they drift from it.
 */
export const BRAND = {
  ink: '#101826',
  navy: '#1f4f8a',
  navyDeep: '#174070',
  sky: '#5fb2ee',
  skyPale: '#a9d4f5',
  frost: '#e6edf5',
  onSky: '#0b0f15',
  codeBg: '#0b0f15',
  codeFg: '#e6edf5',
} as const

/** Tokens in src/styles.css each BRAND color has to match. */
export const BRAND_TOKENS: Record<keyof typeof BRAND, string> = {
  ink: '--brand-ink',
  navy: '--brand-navy',
  navyDeep: '--brand-navy-deep',
  sky: '--brand-sky',
  skyPale: '--brand-sky-pale',
  frost: '--brand-frost',
  onSky: '--on-sky',
  codeBg: '--code-bg',
  codeFg: '--code-fg',
}

/** Email's own light neutrals: mail clients always get the light layout. */
export const EMAIL = {
  ground: '#eef2f7',
  card: '#ffffff',
  muted: '#5b6676',
  quote: '#3a4556',
  rule: '#dbe2ea',
} as const
