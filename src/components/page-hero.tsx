import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '#/lib/utils'
import { EASE } from '#/components/motion'

/**
 * The header card every inner page opens with: a rounded, full-bleed panel
 * (same frame as the home hero) over a React Bits background, with the page
 * title, a line of copy, and optional actions or stats.
 *
 * `background` renders client-only behind a scrim (WebGL/canvas backgrounds
 * never run on the server); pass something that reads in BOTH themes.
 * Lazy-load heavy backgrounds with React.lazy; the ground color shows while
 * they load.
 */
export function PageHero({
  background,
  eyebrow,
  title,
  description,
  actions,
  aside,
  children,
  size = 'md',
  className,
}: {
  background?: ReactNode
  eyebrow?: ReactNode
  /** The h1. Wrap it in a React Bits text animation if you like. */
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Right column on wide screens (a stat, a card, a QR code). */
  aside?: ReactNode
  /** Extra content under the copy, full width (tabs, filters). */
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const reduced = useReducedMotion()
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE, delay },
        }

  return (
    <section
      className={cn(
        'relative mx-2.5 overflow-hidden rounded-4xl bg-[#f3f6fb] dark:bg-[#120f17]',
        size === 'sm' && 'min-h-[18rem]',
        size === 'md' && 'min-h-[24rem] sm:min-h-[28rem]',
        size === 'lg' && 'min-h-[30rem] sm:min-h-[36rem]',
        className,
      )}
    >
      {background && (
        <div aria-hidden="true" className="absolute inset-0">
          <ClientOnly>
            <Suspense>{background}</Suspense>
          </ClientOnly>
        </div>
      )}
      {/* Scrim from the left so the copy always reads over the background. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(243,246,251,0.92)_0%,rgba(243,246,251,0.55)_45%,rgba(243,246,251,0)_80%)] dark:bg-[linear-gradient(90deg,rgba(18,15,23,0.85)_0%,rgba(18,15,23,0.45)_45%,rgba(18,15,23,0)_80%)]"
      />
      <div
        className={cn(
          'pointer-events-none relative mx-auto grid h-full max-w-6xl gap-10 px-(--gutter) py-14 sm:py-20',
          aside && 'lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end',
          size === 'sm' && 'min-h-[18rem] content-end',
          size === 'md' && 'min-h-[24rem] content-end sm:min-h-[28rem]',
          size === 'lg' && 'min-h-[30rem] content-end sm:min-h-[36rem]',
        )}
      >
        <div className="max-w-3xl text-[#101826] dark:text-white">
          {eyebrow && (
            <motion.div
              {...rise(0.05)}
              className="mb-4 text-sm font-medium text-[#101826]/60 dark:text-white/60"
            >
              {eyebrow}
            </motion.div>
          )}
          <h1 className="text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[1.02] font-semibold tracking-[-0.045em]">
            {title}
          </h1>
          {description && (
            <motion.div
              {...rise(0.25)}
              className="mt-5 max-w-2xl text-lg text-balance text-[#101826]/70 sm:text-xl dark:text-white/75"
            >
              {description}
            </motion.div>
          )}
          {actions && (
            <motion.div
              {...rise(0.4)}
              className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3"
            >
              {actions}
            </motion.div>
          )}
          {children && (
            <motion.div {...rise(0.5)} className="pointer-events-auto mt-8">
              {children}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div {...rise(0.35)} className="pointer-events-auto">
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  )
}
