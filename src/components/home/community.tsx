import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { Award } from 'lucide-react'
import type { HomeData } from '#/services/home'
import { fmtDate, initials } from '#/lib/format'
import { EASE, FadeUp } from '#/components/motion'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

/**
 * "Our community" from the previous site: live counts that count up when
 * they scroll into view, plus the latest badge awards.
 */
export function Community({
  stats,
  awards,
}: {
  stats: HomeData['stats']
  awards: HomeData['recentAwards']
}) {
  return (
    <section
      className="bg-card text-card-foreground mx-2.5 rounded-3xl"
      aria-labelledby="community-heading"
    >
      <div className="mx-auto max-w-6xl px-(--gutter) py-24 sm:py-28">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <h2
            id="community-heading"
            className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
          >
            Our community
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Live numbers from the club database, not a brochure.
          </p>
        </FadeUp>

        <dl className="mt-14 grid gap-4 sm:grid-cols-3">
          <Stat n={stats.members} label="Active members" delay={0} />
          <Stat n={stats.eventsThisSemester} label="Events this semester" delay={0.1} />
          <Stat n={stats.projects} label="Projects shipped" delay={0.2} />
        </dl>

        {awards.length > 0 && (
          <FadeUp delay={0.15} className="mt-14">
            <p className="text-muted-foreground mb-4 text-center font-mono text-[11px] tracking-[0.14em] uppercase">
              Recent badges
            </p>
            <ul className="flex flex-wrap justify-center gap-2.5">
              {awards.map((a) => (
                <li
                  key={a.id}
                  className="bg-background/70 ring-border/60 flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-sm ring-1"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={a.userImage ?? undefined} alt="" />
                    <AvatarFallback className="text-[10px]">
                      {initials(a.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{a.userName}</span>
                  <span className="text-muted-foreground hidden sm:inline">earned</span>
                  <span className="text-brand-sky inline-flex items-center gap-1 font-medium">
                    <Award className="size-3.5" aria-hidden="true" />
                    {a.badgeName}
                  </span>
                  <span className="text-muted-foreground hidden font-mono text-xs md:inline">
                    {fmtDate(a.awardedAt, 'short')}
                  </span>
                </li>
              ))}
            </ul>
          </FadeUp>
        )}
      </div>
    </section>
  )
}

function Stat({ n, label, delay }: { n: number; label: string; delay: number }) {
  return (
    <FadeUp
      delay={delay}
      className="bg-background/70 ring-border/60 rounded-2xl px-6 py-8 text-center ring-1"
    >
      <dd className="font-mono text-5xl font-medium tracking-tight tabular-nums sm:text-6xl">
        <CountUp to={n} />
      </dd>
      <dt className="text-muted-foreground mt-3 text-sm">{label}</dt>
    </FadeUp>
  )
}

/** Renders the final value on the server; counts up from 0 once in view. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()
  const [value, setValue] = useState(to)

  useEffect(() => {
    if (!inView || reduced || to === 0) return
    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduced, to])

  return <span ref={ref}>{value}</span>
}
