import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { cn } from '#/lib/utils'
import { EASE } from '#/components/motion'

/**
 * The header every inner page opens with: an edge-to-edge band whose ground
 * color runs from the very top of the page, behind the floating site header.
 * The React Bits background and the copy (title, a line of text, optional
 * actions or stats) start below the header. It has to be the first thing on
 * the page.
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
  // Same markup with reduced motion on; the root MotionConfig turns the rise
  // into a plain fade.
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  })

  return (
    <section
      className={cn('relative -mt-(--header-offset) overflow-hidden bg-stage', className)}
    >
      {background && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-(--header-offset) bottom-0"
        >
          <ClientOnly>
            <Suspense>{background}</Suspense>
          </ClientOnly>
        </div>
      )}
      {/* Scrim from the left so the copy always reads over the background. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(243,246,251,0.92)_0%,rgba(243,246,251,0.55)_45%,rgba(243,246,251,0)_80%)] dark:bg-[linear-gradient(90deg,rgba(18,25,36,0.85)_0%,rgba(18,25,36,0.45)_45%,rgba(18,25,36,0)_80%)]"
      />
      <div
        className={cn(
          'pointer-events-none relative mx-auto grid h-full max-w-6xl gap-10 px-(--gutter) pt-[calc(var(--header-offset)+3.5rem)] pb-14 sm:pt-[calc(var(--header-offset)+5rem)] sm:pb-20',
          aside && 'lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end',
          size === 'sm' && 'min-h-[calc(18rem+var(--header-offset))] content-end',
          size === 'md' &&
            'min-h-[calc(24rem+var(--header-offset))] content-end sm:min-h-[calc(28rem+var(--header-offset))]',
          size === 'lg' &&
            'min-h-[calc(30rem+var(--header-offset))] content-end sm:min-h-[calc(36rem+var(--header-offset))]',
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
