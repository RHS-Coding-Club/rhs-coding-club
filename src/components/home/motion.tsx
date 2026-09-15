import { motion, useReducedMotion } from 'motion/react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Scroll-reveal for section content: enters once, when a quarter of it is in
 * view, so sections read in the order they are laid out. Static under
 * prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Headline entrance: words rise in sequence so the eye lands on the first
 * line before the second. Renders plain text under reduced motion.
 */
export function RisingWords({
  text,
  className,
  startIndex = 0,
}: {
  text: string
  className?: string
  startIndex?: number
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  if (reduce) return <span className={className}>{text}</span>
  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && ' '}
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: '0.35em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.05 + (startIndex + i) * 0.06,
              ease: EASE,
            }}
          >
            {word}
          </motion.span>
        </Fragment>
      ))}
    </span>
  )
}

/** Fade-up on mount, for the hero pieces that follow the headline. */
export function Enter({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
