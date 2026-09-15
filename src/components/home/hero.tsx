import { Link } from '@tanstack/react-router'
import type { HomeData } from '#/services/home'
import { Button } from '#/components/ui/button'
import { Poster } from './poster'
import { Enter, RisingWords } from './motion'

/*
  Shape system for the home page: interactive controls are pills, surfaces
  (poster, panels, project art) are rounded-2xl. Nothing else.
*/

export function Hero({
  club,
  nextEvent,
}: {
  club: HomeData['club']
  nextEvent: HomeData['nextEvent']
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-(--gutter) pt-10 pb-14 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 lg:pt-14 lg:pb-14">
      <div className="flex flex-col justify-center">
        <h1 className="font-display text-[clamp(2.75rem,5.9vw,5.25rem)] leading-[0.96] font-bold tracking-[-0.04em]">
          <RisingWords className="block" text="Learn to code." />
          <RisingWords className="block" text="Teach the next kid." startIndex={3} />
        </h1>
        <Enter delay={0.45}>
          <p className="text-muted-foreground mt-7 max-w-lg text-lg leading-relaxed sm:text-xl">
            Weekly coding challenges, a hackathon, and afternoons teaching STEM at Ripon
            Elementary. Open to every RHS student, no experience needed.
          </p>
        </Enter>
        <Enter delay={0.6} className="mt-9 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-6 text-base transition-transform active:scale-[0.98]"
          >
            <Link to="/signup">Join the club</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full px-6 text-base transition-transform active:scale-[0.98]"
          >
            <Link to="/challenges">This week's challenge</Link>
          </Button>
        </Enter>
      </div>

      <Enter delay={0.25} className="lg:min-h-[36rem]">
        <Poster club={club} nextEvent={nextEvent} />
      </Enter>
    </section>
  )
}
