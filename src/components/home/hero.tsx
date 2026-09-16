import { motion } from 'motion/react'
import type { Theme } from '#/server/theme'
import { SplitButton } from '#/components/split-button'
import { Stagger, item } from '#/components/motion'
import { GrainientBackground } from './grainient-bg'

export const HERO_LINE_1 = 'Learn to code.'

/**
 * Full-bleed hero card inset 10px from the viewport on every side with big
 * rounded corners, like the template. The ground-colored navbar sits in the
 * top gap and hangs into the card as a notch. Every line rises, sharpens,
 * and fades in on load, in the template's order: badge, headline, copy, CTA.
 */
export function Hero({ theme }: { theme: Theme }) {
  return (
    <section className="relative mx-2.5 min-h-[calc(100dvh-1.25rem)] overflow-hidden rounded-4xl min-[850px]:mt-2.5">
      <GrainientBackground initialTheme={theme} />
      {/* Light navy scrim: just enough for the headline to sit on the gradient. */}
      <div
        aria-hidden="true"
        className="from-brand-navy/40 via-brand-navy/15 to-brand-navy/30 pointer-events-none absolute inset-0 bg-gradient-to-b"
      />
      {/* Thin guide lines framing the content column, borrowed from the finance template. */}
      <div
        aria-hidden="true"
        className="border-foreground/10 pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-5xl -translate-x-1/2 border-x lg:block"
      />

      <Stagger
        stagger={0.12}
        delay={0.25}
        className="relative flex min-h-[calc(100dvh-1.25rem)] flex-col items-center justify-center px-6 pt-28 pb-24 text-center"
      >
        <motion.p
          {...item}
          className="bg-card/80 text-card-foreground ring-border/60 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium shadow-sm ring-1 backdrop-blur"
        >
          Fall 2026 applications open
          <span className="text-brand-sky" aria-hidden="true">
            ✦
          </span>
        </motion.p>

        <h1 className="font-display mt-7 text-[clamp(2.75rem,7.2vw,6.25rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-white">
          <motion.span {...item} className="block">
            {HERO_LINE_1}
          </motion.span>
          <motion.span {...item} className="block">
            Ship with{' '}
            <em className="font-serif font-normal tracking-normal text-[#0f2f57] [html:not(.dark)_&]:text-[#0f2f57]">
              friends
            </em>
            .
          </motion.span>
        </h1>

        <motion.p
          {...item}
          className="mx-auto mt-6 max-w-2xl text-lg text-balance text-white/85 sm:text-xl"
        >
          Weekly challenges, a points leaderboard, hackathons, and afternoons teaching
          kids to code. Open to every RHS student, no experience needed.
        </motion.p>

        <motion.div {...item} className="mt-9">
          <SplitButton to="/signup" size="lg">
            Join the club
          </SplitButton>
        </motion.div>
      </Stagger>
    </section>
  )
}
