import type { Theme } from '#/server/theme'
import { SplitButton } from '#/components/split-button'
import { GrainientBackground } from './grainient-bg'
import { TechMarquee } from './marquee'

export const HERO_LINE_1 = 'Learn to code.'

/**
 * Full-bleed hero card that floats on the ground (inset 10px, rounded-3xl)
 * with the navbar sitting over its top edge, exactly like the template.
 */
export function Hero({ theme }: { theme: Theme }) {
  return (
    <section className="relative mx-2.5 mt-2.5 min-h-[calc(100dvh-1.25rem)] overflow-hidden rounded-3xl">
      <GrainientBackground initialTheme={theme} />
      {/* Scrim: keeps the headline legible over the busy gradient in both themes. */}
      <div
        aria-hidden="true"
        className="from-background/85 via-background/35 to-background/85 pointer-events-none absolute inset-0 bg-gradient-to-b"
      />
      {/* Thin guide lines framing the content column, borrowed from the finance template. */}
      <div
        aria-hidden="true"
        className="border-foreground/10 pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-5xl -translate-x-1/2 border-x lg:block"
      />

      <div className="relative flex min-h-[calc(100dvh-1.25rem)] flex-col items-center justify-center px-6 pt-32 pb-40 text-center">
        <p className="bg-card/80 text-card-foreground ring-border/60 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium shadow-sm ring-1 backdrop-blur">
          Fall 2026 applications open
          <span className="text-brand-sky" aria-hidden="true">
            ✦
          </span>
        </p>

        <h1 className="font-display mt-7 text-[clamp(2.75rem,7.2vw,6.25rem)] leading-[1.02] font-semibold tracking-[-0.045em]">
          <span className="block">{HERO_LINE_1}</span>
          <span className="block">
            Ship with{' '}
            <em className="text-brand-sky font-serif font-normal tracking-normal">
              friends
            </em>
            .
          </span>
        </h1>

        <p className="text-foreground/75 mx-auto mt-6 max-w-2xl text-lg text-balance sm:text-xl">
          Weekly challenges, a points leaderboard, hackathons, and afternoons teaching
          kids to code. Open to every RHS student, no experience needed.
        </p>

        <div className="mt-9">
          <SplitButton to="/signup" size="lg">
            Join the club
          </SplitButton>
        </div>
      </div>

      <TechMarquee />
    </section>
  )
}
