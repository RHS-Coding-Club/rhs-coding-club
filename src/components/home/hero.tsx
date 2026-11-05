import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import RotatingText from '#/components/bits/RotatingText'
import ShinyText from '#/components/bits/ShinyText'
import Magnet from '#/components/bits/Magnet'
import { SplitButton } from '#/components/split-button'
import { EASE } from '#/components/motion'
import { AsciiBackground } from './ascii-bg'
import { useCssColors } from '#/hooks/use-css-colors'

const ROTATING = ['friends', 'classmates', 'mentors', 'the club']

/** Spring "Ship with" uses to make room as the highlight pill resizes (from the React Bits demo). */
const PILL_SPRING = { type: 'spring', damping: 30, stiffness: 400 } as const

/** Ease-in for every line that does not rotate: fade and rise into place, one after another. */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay },
})

/**
 * Full-bleed hero card over React Bits Gradient ASCII. The last word of the
 * headline cycles through who you build with inside a sky pill (Rotating
 * Text, the demo's Slide settings); everything else eases in. The join button
 * leans toward the cursor (Magnet).
 */
export function Hero() {
  const [ink, inkSoft] = useCssColors('--ink', '--ink-soft')
  return (
    <section className="relative mx-2.5 mt-2.5 min-h-[calc(100dvh-1.25rem)] overflow-hidden rounded-4xl">
      <AsciiBackground />
      {/* Soft scrim in the ground color behind the headline so the glyph field never fights the copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_48%,color-mix(in_srgb,var(--stage)_75%,transparent)_0%,transparent_100%)] dark:bg-[radial-gradient(60%_50%_at_50%_48%,color-mix(in_srgb,var(--stage)_55%,transparent)_0%,transparent_100%)]"
      />

      <div className="pointer-events-none relative flex min-h-[calc(100dvh-1.25rem)] flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <h1 className="font-display text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-ink">
          <motion.span {...rise(0.3)} className="block">
            Learn to code.
          </motion.span>
          <motion.span
            {...rise(0.45)}
            layout
            className="flex flex-wrap items-center justify-center gap-x-[0.24em]"
          >
            <motion.span layout transition={PILL_SPRING}>
              Ship with
            </motion.span>
            <RotatingText
              texts={ROTATING}
              effect="slide"
              direction="up"
              rotationInterval={2000}
              staggerDuration={0.025}
              staggerFrom="last"
              splitBy="characters"
              blur={0}
              highlight
              highlightColor="var(--brand-sky)"
              style={{ color: 'var(--on-sky)' }}
              auto
              loop
              pauseOnHover={false}
              animatePresenceInitial
              splitLevelClassName="overflow-hidden pb-[0.06em]"
            />
          </motion.span>
        </h1>

        <motion.p
          {...rise(0.75)}
          className="mx-auto mt-6 max-w-2xl text-lg text-balance text-ink/80 sm:text-xl"
        >
          Weekly challenges, a points leaderboard, hackathons, and afternoons teaching
          kids to code. Open to every RHS student, no experience needed.
        </motion.p>

        <motion.div
          {...rise(0.9)}
          className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4"
        >
          <Magnet padding={60} magnetStrength={3} maxOffset={14}>
            <SplitButton to="/signup" size="lg">
              Join the club
            </SplitButton>
          </Magnet>
          {/* React Bits Shiny Text: a slow sheen across the secondary link. */}
          <Link
            to="/challenges"
            className="group inline-flex items-center gap-1.5 text-base font-medium"
          >
            <ShinyText
              text="This week's challenge"
              color={inkSoft}
              shineColor={ink}
              speed={3}
              delay={1.2}
            />
            <ArrowRight
              className="size-4 text-ink/80 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
