import { useRef } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { ArrowLeft } from '#/components/icons/arrow-left'
import { ArrowRight } from '#/components/icons/arrow-right'
import { CodeXml } from '#/components/icons/code-xml'
import { Presentation } from '#/components/icons/presentation'
import { Rocket } from '#/components/icons/rocket'
import { Trophy } from '#/components/icons/trophy'
import { Users } from '#/components/icons/users'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'

const YEAR: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  when: string
  title: string
  body: string
}[] = [
  {
    icon: Users,
    when: 'Fall',
    title: 'Kickoff',
    body: 'New members sign up, officers run the first lunch meeting, and week 1’s challenge goes up.',
  },
  {
    icon: CodeXml,
    when: 'Every week',
    title: 'The challenge',
    body: 'One problem, easy to hard, any language. An officer reviews every solution and the points go on the board.',
  },
  {
    icon: Presentation,
    when: 'Afternoons',
    title: 'Teaching at RAP',
    body: 'Members lead STEM lessons for kids at the Ripon Afterschool Program. It counts toward volunteer hours.',
  },
  {
    icon: Rocket,
    when: 'Winter',
    title: 'H2O hackathon',
    body: 'Teams form, pitch an idea, and build it in a day. The best builds go to the project showcase.',
  },
  {
    icon: Trophy,
    when: 'End of semester',
    title: 'Showcase',
    body: 'Teams demo what they shipped, badges get handed out, and the leaderboard starts a new season.',
  },
]

/**
 * The club year as a horizontal rail. Native scroll with snap points gives
 * the browser's own momentum on touch, the next card peeks in as the hint
 * that there's more, and Previous/Next are the path for a mouse or keyboard.
 */
export function YearRail() {
  const track = useRef<HTMLOListElement>(null)
  const page = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('li')
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }
  return (
    <section aria-labelledby="year-heading" className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-(--gutter)">
        <FadeUp>
          <h2
            id="year-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            How the year runs
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Drop in at any point. All of it is open to every member.
          </p>
        </FadeUp>
        <div className="flex gap-2">
          <RaisedButton
            variant="outline"
            size="icon-lg"
            aria-label="Previous"
            aria-controls="club-year"
            onClick={() => page(-1)}
          >
            <ArrowLeft aria-hidden="true" />
          </RaisedButton>
          <RaisedButton
            variant="outline"
            size="icon-lg"
            aria-label="Next"
            aria-controls="club-year"
            onClick={() => page(1)}
          >
            <ArrowRight aria-hidden="true" />
          </RaisedButton>
        </div>
      </div>
      <ol
        id="club-year"
        ref={track}
        tabIndex={0}
        aria-label="The club year"
        className="focus-visible:ring-ring/50 mt-10 flex snap-x snap-mandatory scroll-px-(--gutter) gap-4 overflow-x-auto overscroll-x-contain px-(--gutter) pb-4 outline-none [scrollbar-width:none] focus-visible:ring-3 lg:scroll-px-[max(var(--gutter),calc((100vw-72rem)/2+var(--gutter)))] lg:px-[max(var(--gutter),calc((100vw-72rem)/2+var(--gutter)))] [&::-webkit-scrollbar]:hidden"
      >
        {YEAR.map((it, i) => (
          <li
            key={it.title}
            className="bg-card ring-border/70 flex w-[min(20rem,80vw)] shrink-0 snap-start flex-col rounded-3xl p-6 ring-1 sm:w-80"
          >
            <div className="flex items-center justify-between">
              <span className="text-primary inline-flex items-center gap-2 font-mono text-xs">
                <it.icon className="size-4" aria-hidden="true" />
                {it.when}
              </span>
              <span className="text-muted-foreground font-mono text-xs tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="mt-14 text-2xl font-semibold tracking-[-0.025em]">
              {it.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed text-pretty">
              {it.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
