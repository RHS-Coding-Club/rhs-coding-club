import { Link } from '@tanstack/react-router'
import type { HomeData } from '#/services/home'
import { Button } from '#/components/ui/button'
import { AppFrame } from './app-frame'
import { GrainientBackdrop } from './grainient-backdrop'
import { Enter } from './motion'
import { BadgeShelf, ChallengeCard, EventRsvpRow, LeaderboardList } from './vignettes'

/*
  Centered headline over the brand gradient, with the member dashboard
  (real components, loader data) overlapping the gradient's bottom edge.
  Shape system for the page: pills for controls, rounded-2xl for frames and
  cards, rounded-xl for panels inside them.
*/
export function Hero({ data }: { data: HomeData }) {
  return (
    <section>
      <div className="relative isolate overflow-hidden pb-40 text-white lg:pb-52">
        <GrainientBackdrop />
        {/* Scrim keeps the headline on the dark part of the gradient. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-[#0b0f15]/70 via-[#0b0f15]/30 to-transparent"
        />
        <div className="relative mx-auto max-w-4xl px-(--gutter) pt-16 text-center lg:pt-24">
          <Enter>
            <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.04em] text-balance">
              Learn to code. Keep score.
            </h1>
          </Enter>
          <Enter delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
              Weekly challenges, a points ledger, badges, events, and a project showcase
              for RHS students. Free, forever.
            </p>
          </Enter>
          <Enter
            delay={0.2}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white px-6 text-base text-[#0b0f15] transition-transform hover:bg-white/90 active:scale-[0.98] focus-visible:ring-white/60"
            >
              <Link to="/signup">Join the club</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 rounded-full border border-white/25 bg-white/10 px-6 text-base text-white backdrop-blur transition-transform hover:bg-white/15 hover:text-white active:scale-[0.98] focus-visible:ring-white/60"
            >
              <Link to="/challenges">See this week's challenge</Link>
            </Button>
          </Enter>
        </div>
      </div>

      <Enter
        delay={0.3}
        className="relative mx-auto -mt-32 max-w-6xl px-(--gutter) pb-16 lg:-mt-40 lg:pb-24"
      >
        <AppFrame title="Dashboard">
          <div className="bg-muted/40 grid gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="flex flex-col gap-3">
              <ChallengeCard challenge={data.activeChallenge} className="flex-1" />
              <EventRsvpRow event={data.nextEvent} />
            </div>
            <LeaderboardList rows={data.leaderboard} className="hidden sm:block" />
            <BadgeShelf badges={data.badges.slice(0, 4)} className="lg:col-span-2" />
          </div>
        </AppFrame>
      </Enter>
    </section>
  )
}
