import type { CSSProperties } from 'react'

/**
 * React Bits components ship the purple-gray palette of their demos. These map
 * it onto the tokens in src/styles.css, so they match both themes and follow
 * the theme class without a re-render. Pass as `style`; the accent still comes
 * from each component's own prop. Every surface React Bits component needs one
 * of these: its `theme` prop alone leaves it in the demo colors.
 */
const WELL = 'color-mix(in oklab, var(--foreground) 6%, transparent)'
const FAINT = 'color-mix(in oklab, var(--foreground) 22%, transparent)'

export const STEPPER_VARS = {
  '--stepper-frame': 'var(--bits-glass)',
  '--stepper-frame-edge': 'var(--bits-edge)',
  '--stepper-frame-highlight': 'var(--bits-highlight)',
  '--stepper-frame-shadow': 'var(--bits-shadow)',
  '--stepper-tile': 'var(--bits-tile)',
  '--stepper-tile-edge': 'var(--bits-edge)',
  '--stepper-tile-highlight': 'var(--bits-highlight)',
  '--stepper-tile-shadow': 'var(--bits-tile-shadow)',
  '--stepper-well': WELL,
  '--stepper-track': 'var(--border)',
  '--stepper-ink': 'var(--foreground)',
  '--stepper-muted': 'var(--muted-foreground)',
  '--stepper-faint': FAINT,
  '--stepper-ring': 'var(--ring)',
  '--stepper-hover-fill': 'color-mix(in oklab, var(--foreground) 4%, transparent)',
} as CSSProperties

export const CAROUSEL_VARS = {
  '--carousel-frame': 'var(--bits-glass)',
  '--carousel-frame-edge': 'var(--bits-edge)',
  '--carousel-frame-highlight': 'var(--bits-highlight)',
  '--carousel-frame-shadow': 'var(--bits-shadow)',
  '--carousel-tile': 'var(--bits-tile)',
  '--carousel-tile-edge': 'var(--bits-edge)',
  '--carousel-tile-highlight': 'var(--bits-highlight)',
  '--carousel-tile-shadow': 'var(--bits-tile-shadow)',
  '--carousel-ink': 'var(--foreground)',
  '--carousel-muted': 'var(--muted-foreground)',
  '--carousel-faint': FAINT,
  '--carousel-soft': 'color-mix(in oklab, var(--foreground) 42%, transparent)',
  '--carousel-badge': WELL,
} as CSSProperties

export const PROFILE_CARD_VARS = {
  '--pc-frame': 'var(--bits-glass)',
  '--pc-frame-edge': 'var(--bits-edge)',
  '--pc-frame-highlight': 'var(--bits-highlight)',
  '--pc-frame-shadow': 'var(--bits-shadow)',
  '--pc-tile': 'var(--bits-tile)',
  '--pc-tile-edge': 'var(--bits-edge)',
  '--pc-tile-highlight': 'var(--bits-highlight)',
  '--pc-tile-shadow': 'var(--bits-tile-shadow)',
  '--pc-ink': 'var(--foreground)',
  '--pc-muted': 'var(--muted-foreground)',
} as CSSProperties

export const CARD_SWAP_VARS = {
  '--swap-tile': 'var(--bits-tile)',
  '--swap-tile-edge': 'var(--bits-edge)',
  '--swap-tile-highlight': 'var(--bits-highlight)',
  '--swap-shadow': 'var(--bits-shadow)',
  '--swap-media-edge': 'var(--bits-edge)',
  '--swap-ink': 'var(--foreground)',
  '--swap-badge': WELL,
  '--swap-shade': 'var(--background)',
} as CSSProperties

export const ANIMATED_LIST_VARS = {
  '--al-frame': 'var(--bits-glass)',
  '--al-frame-edge': 'var(--bits-edge)',
  '--al-frame-highlight': 'var(--bits-highlight)',
  '--al-frame-shadow': 'var(--bits-shadow)',
  '--al-tile': 'var(--bits-tile)',
  '--al-tile-edge': 'var(--bits-edge)',
  '--al-tile-highlight': 'var(--bits-highlight)',
  '--al-tile-shadow': 'var(--bits-tile-shadow)',
  '--al-well': WELL,
  '--al-ink': 'var(--foreground)',
  '--al-muted': 'var(--muted-foreground)',
  '--al-thumb': FAINT,
} as CSSProperties

export const MAGIC_BENTO_VARS = {
  '--mb-surface': 'var(--bits-surface)',
  '--mb-edge': 'var(--bits-edge)',
  '--mb-highlight': 'var(--bits-highlight)',
  '--mb-shadow': 'var(--bits-shadow)',
  '--mb-tile': 'var(--bits-tile)',
  '--mb-tile-edge': 'var(--bits-edge)',
  '--mb-tile-highlight': 'var(--bits-highlight)',
  '--mb-tile-shadow': 'var(--bits-tile-shadow)',
  '--mb-well': 'color-mix(in oklab, var(--foreground) 3%, transparent)',
  '--mb-well-edge': 'var(--bits-edge)',
  '--mb-ink': 'var(--foreground)',
  '--mb-muted': 'var(--muted-foreground)',
  '--mb-faint': 'color-mix(in oklab, var(--foreground) 30%, transparent)',
  '--mb-line': 'color-mix(in oklab, var(--foreground) 10%, transparent)',
  '--mb-secondary': 'var(--muted-foreground)',
  '--mb-secondary-ink': 'var(--background)',
  '--mb-cursor-stroke': 'var(--background)',
  '--mb-ring': 'var(--background)',
  '--mb-focus': 'var(--ring)',
} as CSSProperties

export const DOCK_VARS = {
  '--dock-panel': 'var(--bits-glass)',
  '--dock-panel-edge': 'var(--bits-edge)',
  '--dock-panel-highlight': 'var(--bits-highlight)',
  '--dock-panel-shadow': 'var(--bits-shadow)',
  '--dock-tile': 'var(--bits-tile)',
  '--dock-tile-edge': 'var(--bits-edge)',
  '--dock-tile-highlight': 'var(--bits-highlight)',
  '--dock-tile-shadow': 'var(--bits-tile-shadow)',
  '--dock-ink': 'var(--foreground)',
  '--dock-label': 'var(--popover)',
  '--dock-label-ink': 'var(--popover-foreground)',
  '--dock-dot': 'var(--brand-sky)',
  '--dock-separator': 'var(--border)',
  '--dock-menu': 'var(--bits-glass)',
  '--dock-menu-edge': 'var(--bits-edge)',
  '--dock-menu-ink': 'var(--popover-foreground)',
  '--dock-menu-muted': 'var(--muted-foreground)',
  '--dock-menu-separator': 'var(--border)',
  '--dock-menu-shadow': 'var(--bits-shadow)',
} as CSSProperties

export const SPOTLIGHT_VARS = {
  '--spotlight-card-surface': 'var(--bits-surface)',
  '--spotlight-card-border': 'var(--bits-edge)',
} as CSSProperties
