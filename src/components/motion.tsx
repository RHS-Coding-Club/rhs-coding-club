import type { CSSProperties, ComponentProps } from 'react'
import { cn } from '#/lib/utils'

/** The template's easing everywhere: a soft ease-out quart. */
export const EASE = [0.23, 1, 0.32, 1] as const

/**
 * Style for a `rise-in` element (src/entrance.css): fades and rises into place
 * from the first paint, with no JavaScript, for copy above the fold.
 */
export function riseIn(delay: number, distance = 16, duration = 0.5): CSSProperties {
  return {
    '--rise-delay': `${delay}s`,
    '--rise-distance': `${distance}px`,
    '--rise-duration': `${duration}s`,
  } as CSSProperties
}

/**
 * A block that fades in as it scrolls into view. Pure CSS (the `reveal`
 * class in styles.css, a scroll-driven animation), so the server HTML is never
 * hidden: anything already on screen at first paint, or with JavaScript off,
 * is simply there. Browsers without scroll timelines show it at once.
 */
export function FadeUp({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('reveal', className)} {...rest} />
}
