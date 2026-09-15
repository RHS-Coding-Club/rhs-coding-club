import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { HomeData } from '#/services/home'
import { fmtDate, initials } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import CountUp from '#/components/bits/CountUp'
import AnimatedContent from '#/components/bits/AnimatedContent'
import SpotlightCard from '#/components/bits/SpotlightCard'
import TiltedCard from '#/components/bits/TiltedCard'
import type { Look } from './backgrounds'

const reveal = {
  distance: 32,
  duration: 0.8,
  ease: 'power3.out',
  threshold: 0.15,
} as const

export function StatsBand({ stats }: { stats: HomeData['stats'] }) {
  const items = [
    { n: stats.members, label: 'active members' },
    { n: stats.eventsThisSemester, label: 'events this semester' },
    { n: stats.projects, label: 'projects shipped' },
  ]
  return (
    <section className="border-border border-b">
      <dl className="divide-border mx-auto grid max-w-7xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((it) => (
          <div key={it.label} className="px-5 py-8 sm:px-8 lg:px-10">
            <dd className="font-display tabular text-6xl font-bold tracking-tight lg:text-7xl">
              <CountUp to={it.n} duration={1.4} />
            </dd>
            <dt className="text-muted-foreground mt-1 text-sm">{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Heading({
  title,
  to,
  cta,
}: {
  title: string
  to: '/projects' | '/blog' | '/hall-of-fame' | '/events' | '/challenges'
  cta: string
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">
        {title}
      </h2>
      <Link
        to={to}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        {cta}
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  )
}

/** Placeholder art until members upload real screenshots. Grayscale keeps random photos on-palette. */
function projectImage(id: string, w: number, h: number) {
  return `https://picsum.photos/seed/rhs-${id}/${w}/${h}?grayscale`
}

export function Projects({
  projects,
  look,
}: {
  projects: HomeData['featuredProjects']
  look: Look
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <AnimatedContent {...reveal}>
        <Heading title="Built by members" to="/projects" cta="All projects" />
      </AnimatedContent>
      {projects.length === 0 ? (
        <Empty>No approved projects yet. Members submit theirs from the dashboard.</Empty>
      ) : look === 'water' ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.id}>
              <AnimatedContent {...reveal} delay={i * 0.08}>
                <TiltedCard
                  imageSrc={projectImage(p.id, 900, 620)}
                  altText={p.title}
                  containerHeight="260px"
                  containerWidth="100%"
                  imageHeight="260px"
                  imageWidth="100%"
                  rotateAmplitude={10}
                  scaleOnHover={1.03}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent
                  overlayContent={
                    <div className="m-3 rounded-full bg-[#0b0f15]/70 px-3 py-1 font-mono text-xs text-[#e6edf5] backdrop-blur">
                      {p.tech.slice(0, 2).join(' + ')}
                    </div>
                  }
                />
                <h3 className="font-display mt-4 text-2xl font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {p.description}
                </p>
              </AnimatedContent>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {projects.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''}>
              <AnimatedContent {...reveal} delay={i * 0.08} className="h-full">
                <SpotlightCard
                  className="border-border bg-card relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-2xl border p-6"
                  spotlightColor="rgba(95, 178, 238, 0.22)"
                >
                  {i === 0 && (
                    <>
                      <img
                        src={projectImage(p.id, 1200, 800)}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f15] via-[#0b0f15]/40 to-transparent" />
                    </>
                  )}
                  <div className="relative">
                    <p className="font-mono text-xs text-[#9ccbf2]">
                      {p.tech.slice(0, 3).join(' / ')}
                    </p>
                    <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight lg:text-3xl">
                      {p.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 line-clamp-2 max-w-md text-sm">
                      {p.description}
                    </p>
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function Writing({ posts }: { posts: HomeData['latestPosts'] }) {
  const [first, ...rest] = posts
  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <AnimatedContent {...reveal}>
          <Heading title="From the blog" to="/blog" cta="All posts" />
        </AnimatedContent>
        {posts.length === 0 ? (
          <Empty>No posts yet.</Empty>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
            <AnimatedContent {...reveal}>
              <Link to="/blog" className="group block">
                <p className="text-muted-foreground font-mono text-xs">
                  {first.publishedAt ? fmtDate(first.publishedAt) : 'Draft'}
                </p>
                <h3 className="font-display mt-3 text-3xl font-bold tracking-tight group-hover:underline lg:text-5xl">
                  {first.title}
                </h3>
                <p className="text-muted-foreground mt-4 max-w-xl text-lg">
                  {first.summary}
                </p>
              </Link>
            </AnimatedContent>
            {rest.length > 0 && (
              <ul className="divide-border divide-y self-start">
                {rest.map((p, i) => (
                  <li key={p.id}>
                    <AnimatedContent {...reveal} delay={0.1 + i * 0.06}>
                      <Link to="/blog" className="group block py-4">
                        <p className="text-muted-foreground font-mono text-xs">
                          {p.publishedAt ? fmtDate(p.publishedAt) : 'Draft'}
                        </p>
                        <p className="font-display mt-1 text-xl font-semibold tracking-tight group-hover:underline">
                          {p.title}
                        </p>
                      </Link>
                    </AnimatedContent>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export function Awards({ awards }: { awards: HomeData['recentAwards'] }) {
  if (awards.length === 0) return null
  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <AnimatedContent {...reveal}>
          <Heading title="Recently earned" to="/hall-of-fame" cta="Hall of fame" />
        </AnimatedContent>
        <ul className="flex flex-wrap gap-3">
          {awards.map((a, i) => (
            <li key={a.id}>
              <AnimatedContent {...reveal} delay={i * 0.05} direction="horizontal">
                <Link
                  to="/members/$id"
                  params={{ id: a.userId }}
                  className="border-border hover:border-primary/60 flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5 text-sm transition-colors"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={a.userImage ?? undefined} alt="" />
                    <AvatarFallback className="text-xs">
                      {initials(a.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{a.userName}</span>
                  <span className="text-muted-foreground">{a.badgeName}</span>
                  <span className="text-primary font-mono text-xs">{a.rarity}</span>
                </Link>
              </AnimatedContent>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function JoinBand({ club }: { club: HomeData['club'] }) {
  return (
    <section className="border-border border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-28">
        <AnimatedContent {...reveal}>
          <h2 className="font-display max-w-3xl text-4xl font-bold tracking-tight lg:text-6xl">
            Meets {club.meetingSchedule.toLowerCase()} in {club.meetingLocation}. No
            experience needed.
          </h2>
        </AnimatedContent>
        <AnimatedContent {...reveal} delay={0.1}>
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-6 text-base active:scale-[0.98]"
          >
            <Link to="/join">How to join</Link>
          </Button>
        </AnimatedContent>
      </div>
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground border-border rounded-2xl border border-dashed px-6 py-12 text-center text-sm">
      {children}
    </p>
  )
}
