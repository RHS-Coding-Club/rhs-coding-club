import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { HomeData } from '#/services/home'
import { fmtDate, initials } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import CountUp from '#/components/bits/CountUp'
import { Reveal } from './motion'

type SectionLink = '/projects' | '/blog' | '/events' | '/hall-of-fame'

function SectionHeading({
  title,
  to,
  cta,
}: {
  title: string
  to?: SectionLink
  cta?: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <h2 className="font-display max-w-2xl text-4xl leading-[0.98] font-bold tracking-[-0.03em] lg:text-5xl">
        {title}
      </h2>
      {to && cta && (
        <Link
          to={to}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 pb-1 text-sm font-medium transition-colors"
        >
          {cta}
          <ArrowUpRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

/**
 * Placeholder photography until the club uploads its own. Grayscale plus a
 * luminosity blend over navy turns any photo into a brand duotone.
 * TODO: replace with real club photos (classroom, RAP lessons, hackathon).
 */
function Duotone({
  seed,
  alt = '',
  className,
}: {
  seed: string
  alt?: string
  className?: string
}) {
  return (
    <div className={`bg-brand-navy relative overflow-hidden ${className ?? ''}`}>
      <img
        src={`https://picsum.photos/seed/${seed}/1200/1200?grayscale`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-luminosity"
      />
    </div>
  )
}

/*
  Learn, Teach, Ship: the three things the club does every semester, told as a
  sticky stack. On large screens each panel pins under the header while the
  next one slides over it, so the story reads in order; below lg they simply
  stack. Pure CSS, so it costs nothing and needs no reduced-motion branch.
*/
export function Pillars({
  stats,
  awards,
}: {
  stats: HomeData['stats']
  awards: HomeData['recentAwards']
}) {
  const latest = awards.at(0)
  const panels: Array<{
    word: string
    body: string
    seed: string
    data: ReactNode
  }> = [
    {
      word: 'Learn',
      body: 'A new coding challenge every week. Solve it, earn points, collect badges, and climb the leaderboard.',
      seed: 'rhs-classroom-laptops',
      data: (
        <>
          <Stat n={stats.members} label="members" />
          {latest && (
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarImage src={latest.userImage ?? undefined} alt="" />
                <AvatarFallback className="text-xs">
                  {initials(latest.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm leading-tight">
                <p className="font-medium">
                  {latest.userName} earned {latest.badgeName}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {fmtDate(latest.awardedAt, 'short')}
                </p>
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      word: 'Teach',
      body: 'Members run STEM lessons for kids at the Ripon Afterschool Program at Ripon Elementary. Volunteer hours included.',
      seed: 'rhs-elementary-lesson',
      data: <Stat n={stats.eventsThisSemester} label="events this semester" />,
    },
    {
      word: 'Ship',
      body: 'Build for the H2O hackathon or ship your own project. Members get a GitHub org and a place to show it off.',
      seed: 'rhs-hackathon-table',
      data: <Stat n={stats.projects} label="projects shipped" />,
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-(--gutter) py-20 lg:py-28">
      <Reveal>
        <SectionHeading title="What a semester looks like" />
      </Reveal>
      <div className="mt-10 grid gap-5 lg:mt-14">
        {panels.map((p, i) => (
          <article
            key={p.word}
            style={{ top: `calc(5rem + ${i}rem)` }}
            className="border-border bg-card grid overflow-hidden rounded-2xl border lg:sticky lg:h-[min(34rem,calc(100dvh-6rem))] lg:grid-cols-2"
          >
            <div className="flex flex-col justify-between gap-10 p-7 sm:p-9 lg:p-12">
              <Reveal>
                <p className="font-display text-6xl leading-none font-bold tracking-[-0.04em] lg:text-8xl">
                  {p.word}
                </p>
                <p className="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
                  {p.body}
                </p>
              </Reveal>
              <Reveal delay={0.1} className="flex flex-wrap items-end gap-x-10 gap-y-6">
                {p.data}
              </Reveal>
            </div>
            <Duotone seed={p.seed} className="aspect-[4/3] lg:aspect-auto lg:h-full" />
          </article>
        ))}
      </div>
    </section>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="font-display tabular text-5xl leading-none font-bold tracking-tight">
        <CountUp to={n} duration={1.2} />
      </p>
      <p className="text-muted-foreground mt-2 text-sm">{label}</p>
    </div>
  )
}

/** Approved member projects as a horizontal rail of square tiles, sized so the rail visibly runs past the viewport edge. */
export function Projects({ projects }: { projects: HomeData['featuredProjects'] }) {
  return (
    <section className="border-border border-t py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-(--gutter)">
        <Reveal>
          <SectionHeading title="Built by members" to="/projects" cta="All projects" />
        </Reveal>
      </div>
      {projects.length === 0 ? (
        <div className="mx-auto max-w-7xl px-(--gutter)">
          <Empty>
            No approved projects yet. Members submit theirs from the dashboard.
          </Empty>
        </div>
      ) : (
        <Reveal>
          <ul className="rail-pad no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 lg:mt-14">
            {projects.map((p) => (
              <li
                key={p.id}
                className="w-[78vw] max-w-[30rem] shrink-0 snap-start sm:w-[24rem] lg:w-[30rem]"
              >
                <Link to="/projects" className="group block">
                  <Duotone
                    seed={`rhs-project-${p.id}`}
                    className="aspect-square rounded-2xl transition-transform duration-500 ease-out group-hover:-translate-y-1"
                  />
                  <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
                    {p.description}
                  </p>
                  <p className="text-muted-foreground mt-3 text-sm">
                    <span className="text-foreground font-medium">{p.authorName}</span>
                    {p.tech.length > 0 && (
                      <span> in {p.tech.slice(0, 3).join(', ')}</span>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  )
}

export function Writing({ posts }: { posts: HomeData['latestPosts'] }) {
  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-7xl px-(--gutter) py-20 lg:py-28">
        <Reveal>
          <SectionHeading title="From the blog" to="/blog" cta="All posts" />
        </Reveal>
        {posts.length === 0 ? (
          <Empty>No posts yet.</Empty>
        ) : (
          <ul className="divide-border mt-8 divide-y lg:mt-10">
            {posts.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={i * 0.06}>
                  <Link
                    to="/blog"
                    className="group grid gap-2 py-7 lg:grid-cols-[9rem_minmax(0,1fr)_auto] lg:items-baseline lg:gap-8"
                  >
                    <p className="text-muted-foreground font-mono text-xs">
                      {p.publishedAt ? fmtDate(p.publishedAt) : 'Draft'}
                    </p>
                    <div>
                      <h3 className="font-display text-2xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4 lg:text-3xl">
                        {p.title}
                      </h3>
                      <p className="text-muted-foreground mt-2 max-w-2xl">{p.summary}</p>
                    </div>
                    <ArrowUpRight className="text-muted-foreground group-hover:text-foreground hidden size-5 transition-colors lg:block" />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function JoinBand({ club }: { club: HomeData['club'] }) {
  return (
    <section className="border-border border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-(--gutter) py-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:py-32">
        <Reveal>
          <h2 className="font-display max-w-3xl text-5xl leading-[0.94] font-bold tracking-[-0.04em] lg:text-7xl">
            No experience needed.
          </h2>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
            Every RHS student is welcome. Find us at {club.meetingSchedule.toLowerCase()}{' '}
            in {club.meetingLocation}.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-6 text-base transition-transform active:scale-[0.98]"
          >
            <Link to="/signup">Join the club</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground border-border mt-10 rounded-2xl border border-dashed px-6 py-12 text-center text-sm">
      {children}
    </p>
  )
}
