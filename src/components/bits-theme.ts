import type { CSSProperties } from 'react'

/**
 * React Bits Stepper ships a purple-gray palette. These map it onto the
 * site's surface tokens (the same glass and tiles as the header card and the
 * admin dock), so it matches both themes and follows the theme class without
 * a re-render. Pass as `style`; the accent still comes from `accentColor`.
 */
export const STEPPER_VARS = {
  '--stepper-frame': 'var(--bits-glass)',
  '--stepper-frame-edge': 'var(--bits-edge)',
  '--stepper-frame-highlight': 'var(--bits-highlight)',
  '--stepper-frame-shadow': 'var(--bits-shadow)',
  '--stepper-tile': 'var(--bits-tile)',
  '--stepper-tile-edge': 'var(--bits-edge)',
  '--stepper-tile-highlight': 'var(--bits-highlight)',
  '--stepper-well': 'color-mix(in oklab, var(--foreground) 6%, transparent)',
  '--stepper-track': 'var(--border)',
  '--stepper-ink': 'var(--foreground)',
  '--stepper-muted': 'var(--muted-foreground)',
  '--stepper-faint': 'color-mix(in oklab, var(--foreground) 22%, transparent)',
  '--stepper-ring': 'var(--ring)',
  '--stepper-hover-fill': 'color-mix(in oklab, var(--foreground) 4%, transparent)',
} as CSSProperties
