import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import type { HomeData } from '#/services/home'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { fmtDate, initials } from '#/lib/format'

export function NextEventBanner({ event }: { event: HomeData['nextEvent'] }) {
  if (!event) return null
  return (
    <Link
      to="/events"
      className="bg-brand-frost/10 border-brand-frost/25 text-brand-frost hover:bg-brand-frost/15 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border px-4 py-3 text-sm backdrop-blur"
    >
      <span className="eyebrow text-brand-frost/80">Next up</span>
      <span className="font-display text-xl">{event.title}</span>
      <span className="flex items-center gap-1.5 font-mono text-xs">
        <CalendarDays className="size-3.5" />
        {fmtDate(event.startsAt, 'datetime')}
      </span>
      <span className="flex items-center gap-1.5 font-mono text-xs">
        <MapPin className="size-3.5" />
        {event.location}
      </span>
      <ArrowRight className="ml-auto size-4" />
    </Link>
  )
}

export function StatsStrip({ stats }: { stats: HomeData['stats'] }) {
  const items = [
    { n: stats.members, label: 'members' },
    { n: stats.eventsThisSemester, label: 'events this semester' },
    { n: stats.projects, label: 'shipped projects' },
  ]
  return (
    <dl className="border-border grid grid-cols-3 divide-x rounded-lg border">
      {items.map((it) => (
        <div key={it.label} className="px-4 py-5 sm:px-6">
          <dd className="font-display tabular text-4xl sm:text-5xl">{it.n}</dd>
          <dt className="eyebrow mt-1">{it.label}</dt>
        </div>
      ))}
    </dl>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  to,
  cta,
}: {
  eyebrow: string
  title: string
  to: '/projects' | '/blog' | '/hall-of-fame' | '/events' | '/challenges'
  cta: string
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-display mt-1 text-4xl">{title}</h2>
      </div>
      <Button asChild variant="ghost" size="sm">
        <Link to={to}>
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  )
}

export function FeaturedProjects({
  projects,
}: {
  projects: HomeData['featuredProjects']
}) {
  if (projects.length === 0) {
    return (
      <EmptyRow>
        No approved projects yet. Members can submit theirs from the dashboard.
      </EmptyRow>
    )
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <li
          key={p.id}
          className="bg-card border-border flex flex-col gap-3 rounded-lg border p-5"
        >
          <div className="brand-gradient aspect-[16/9] rounded-md opacity-80" />
          <h3 className="font-display text-2xl leading-tight">{p.title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">{p.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-1.5">
            {p.tech.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="font-mono text-[11px]">
                {t}
              </Badge>
            ))}
            <span className="text-muted-foreground ml-auto text-xs">{p.authorName}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function LatestPosts({ posts }: { posts: HomeData['latestPosts'] }) {
  if (posts.length === 0) {
    return <EmptyRow>No posts yet.</EmptyRow>
  }
  return (
    <ul className="divide-border border-border divide-y rounded-lg border">
      {posts.map((p) => (
        <li key={p.id}>
          <Link
            to="/blog"
            className="hover:bg-muted/50 flex flex-wrap items-baseline gap-x-6 gap-y-1 px-5 py-4"
          >
            <span className="text-muted-foreground w-24 shrink-0 font-mono text-xs">
              {p.publishedAt ? fmtDate(p.publishedAt) : 'Draft'}
            </span>
            <span className="font-display text-xl">{p.title}</span>
            <span className="text-muted-foreground w-full text-sm sm:ml-30 sm:w-auto sm:flex-1">
              {p.summary}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function RecentAwards({ awards }: { awards: HomeData['recentAwards'] }) {
  if (awards.length === 0) {
    return (
      <EmptyRow>No badges awarded yet. Pass a challenge to earn the first one.</EmptyRow>
    )
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {awards.map((a) => (
        <li
          key={a.id}
          className="border-border flex items-center gap-3 rounded-lg border p-3"
        >
          <Avatar className="size-9">
            <AvatarImage src={a.userImage ?? undefined} alt="" />
            <AvatarFallback className="text-xs">{initials(a.userName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm">
              <span className="font-medium">{a.userName}</span> earned{' '}
              <span className="font-medium">{a.badgeName}</span>
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              <RarityDot rarity={a.rarity} /> {a.rarity} · {fmtDate(a.awardedAt, 'short')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function RarityDot({ rarity }: { rarity: string }) {
  const color =
    rarity === 'legendary'
      ? 'bg-warning'
      : rarity === 'epic'
        ? 'bg-brand-sky'
        : rarity === 'rare'
          ? 'bg-brand-navy'
          : 'bg-muted-foreground'
  return <span className={`inline-block size-2 rounded-full align-middle ${color}`} />
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground border-border rounded-lg border border-dashed px-5 py-8 text-center text-sm">
      {children}
    </p>
  )
}
