import { Award } from 'lucide-react'
import Counter from '#/components/bits/Counter'
import type { HomeData } from '#/services/home'
import { fmtDate, initials } from '#/lib/format'
import { FadeUp } from '#/components/motion'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

/**
 * Live counts from the club database on React Bits Counter, whose digits
 * roll like an odometer the first time they scroll into view, plus the
 * latest badge awards.
 */
export function Community({
  stats,
  awards,
}: {
  stats: HomeData['stats']
  awards: HomeData['recentAwards']
}) {
  const items = [
    { n: stats.members, label: 'Active members' },
    { n: stats.eventsThisSemester, label: 'Events this semester' },
    { n: stats.projects, label: 'Projects shipped' },
  ]

  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24"
      aria-labelledby="community-heading"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-end">
        <FadeUp>
          <h2
            id="community-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            Our community, by the numbers
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-lg">
            Pulled live from the club database every time this page loads.
          </p>
        </FadeUp>

        <dl className="divide-border grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {items.map((item, i) => (
            <FadeUp
              key={item.label}
              delay={i * 0.08}
              className="flex flex-col gap-2 py-6 sm:px-8 sm:py-2 sm:first:pl-0"
            >
              <dt className="text-muted-foreground order-2 text-sm">{item.label}</dt>
              <dd className="order-1">
                <Counter
                  value={item.n}
                  fontSize="clamp(3.25rem, 6vw, 4.5rem)"
                  fontWeight={600}
                  stagger={0.06}
                  motionBlur
                  className="font-display tracking-[-0.04em]"
                />
              </dd>
            </FadeUp>
          ))}
        </dl>
      </div>

      {awards.length > 0 && (
        <FadeUp delay={0.15} className="border-border mt-16 border-t pt-10">
          <p className="text-muted-foreground mb-5 text-sm">Badges earned recently</p>
          <ul className="flex flex-wrap gap-2.5">
            {awards.map((a) => (
              <li
                key={a.id}
                className="bg-card ring-border/70 flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-sm ring-1"
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
    </section>
  )
}
