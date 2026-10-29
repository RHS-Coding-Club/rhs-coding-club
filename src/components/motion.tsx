import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import type { ComponentProps } from 'react'

/** The template's easing everywhere: a soft ease-out quart. */
export const EASE = [0.23, 1, 0.32, 1] as const

/** Hero entrance: rise, sharpen, and fade in. */
export const blurUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

/** Scroll-in for sections and cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

type FadeUpProps = Omit<ComponentProps<typeof motion.div>, 'children'> & {
  children?: React.ReactNode
  delay?: number
  /** How far the element can rise from. Defaults to 24px. */
  distance?: number
  once?: boolean
}

/**
 * Wraps a block that should rise and fade in the first time it scrolls into
 * view. With reduced motion on, the root MotionConfig drops the rise and
 * keeps a plain fade. The markup never branches on the preference, so the
 * server HTML always hydrates (a branch here left sections stuck at opacity 0).
 */
export function FadeUp({
  delay = 0,
  distance = 24,
  once = true,
  children,
  ...rest
}: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-50px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * A parent whose children (using `blurUp` or `fadeUp` variants) animate in
 * sequence on mount. Used by the hero.
 */
export function Stagger({
  stagger = 0.1,
  delay = 0.1,
  children,
  ...rest
}: Omit<ComponentProps<typeof motion.div>, 'children'> & {
  children?: React.ReactNode
  stagger?: number
  delay?: number
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export const item = {
  variants: blurUp,
  transition: { duration: 0.8, ease: EASE },
} as const
