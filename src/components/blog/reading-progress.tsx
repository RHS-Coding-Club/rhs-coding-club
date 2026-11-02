import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'

/**
 * A thin sky bar across the top of the viewport that fills as you read.
 * With reduced motion it tracks the scroll position directly, no spring.
 */
export function ReadingProgress() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 })
  return (
    <motion.div
      aria-hidden="true"
      className="bg-brand-sky fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  )
}
