import { Link } from '@tanstack/react-router'
import {
  Award,
  CalendarDays,
  FolderGit2,
  GitBranch,
  Sparkles,
  Trophy,
} from 'lucide-react'
import type { HomeData } from '#/services/home'
import { fmtDate, initials } from '#/lib/format'
import { cn } from '#/lib/utils'

const PANEL = 'bg-background/70 text-foreground ring-border/60 rounded-2xl ring-1'

export function ChallengeVignette({
  challenge,
}: {
  challenge: HomeData['activeChallenge']
}) {
  if (!challenge) {
    return (
      <Empty icon={Sparkles}>
        The next challenge drops soon. Members get an email when it does.
      </Empty>
    )
  }
  return (
    <div className="flex h-full flex-col gap-3">
      <Link
        to="/challenges"
        className={cn(
          PANEL,
          'group block p-5 transition-transform hover:-translate-y-0.5',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">
            Week {challenge.weekNo} · {challenge.difficulty}
          </span>
          <span className="bg-brand-sky/15 text-brand-sky rounded-full px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums">
            +{challenge.points} pts
          </span>
        </div>
        <p className="mt-3 text-lg font-semibold tracking-tight">{challenge.title}</p>
        <p className="text-muted-foreground mt-1.5 line-clamp-3 text-sm leading-relaxed">
          {challenge.description}
        </p>
        <span className="mt-4 inline-block text-sm font-medium underline-offset-4 group-hover:underline">
          Open the challenge
        </span>
      </Link>
      <div
        aria-hidden="true"
        className={cn(PANEL, 'mt-auto flex items-center gap-2 p-2 pl-4')}
      >
        <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">
          github.com/you/week-{challenge.weekNo}-solution
        </span>
        <span className="bg-foreground text-background rounded-full px-3 py-1.5 text-xs font-medium">
          Submit
        </span>
      </div>
    </div>
  )
}

export function LeaderboardVignette({ rows }: { rows: HomeData['leaderboard'] }) {
  if (rows.length === 0) {
    return (
      <Empty icon={Trophy}>
        Nobody is on the board yet this semester. Solve one challenge and you are first.
      </Empty>
    )
  }
  return (
    <ol className={cn(PANEL, 'divide-border/60 divide-y')}>
      {rows.slice(0, 5).map((row, i) => (
        <li key={row.userId} className="flex items-center gap-3 px-4 py-2.5">
          <span className="text-muted-foreground w-4 font-mono text-xs tabular-nums">
            {i + 1}
          </span>
          <span className="bg-secondary text-secondary-foreground flex size-7 items-center justify-center rounded-full text-[11px] font-medium">
            {initials(row.name)}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.name}</span>
          <span className="font-mono text-sm tabular-nums">{row.points}</span>
        </li>
      ))}
    </ol>
  )
}

export function EventVignette({ event }: { event: HomeData['nextEvent'] }) {
  if (!event) {
    return <Line icon={CalendarDays}>No events on the calendar yet.</Line>
  }
  return (
    <Line icon={CalendarDays}>
      <span className="font-medium">{event.title}</span>
      <span className="text-muted-foreground"> · {fmtDate(event.startsAt, 'short')}</span>
      {event.going > 0 && (
        <span className="text-muted-foreground"> · {event.going} going</span>
      )}
    </Line>
  )
}

export function BadgeShelf({
  badges,
  awards,
}: {
  badges: HomeData['badges']
  awards: HomeData['recentAwards']
}) {
  const latest = awards.at(0)
  if (badges.length === 0) {
    return <Line icon={Award}>Badges are being designed.</Line>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.slice(0, 4).map((b) => (
        <span
          key={b.id}
          className="bg-brand-sky/12 text-brand-sky inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
        >
          <Award className="size-3" aria-hidden="true" />
          {b.name}
        </span>
      ))}
      {latest && (
        <span className="text-muted-foreground mt-1 w-full truncate text-xs">
          {latest.userName} earned {latest.badgeName}
        </span>
      )}
    </div>
  )
}

export function ProjectsVignette({ count }: { count: number }) {
  return (
    <Line icon={FolderGit2}>
      {count === 0 ? (
        'Nothing in the showcase yet. Be the first.'
      ) : (
        <>
          <span className="font-medium">{count}</span>
          <span className="text-muted-foreground">
            {' '}
            {count === 1 ? 'project' : 'projects'} shipped so far
          </span>
        </>
      )}
    </Line>
  )
}

export function OrgVignette() {
  return (
    <Line icon={GitBranch}>
      <span className="font-mono text-xs">github.com/RHS-Coding-Club</span>
    </Line>
  )
}

function Line({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles
  children: React.ReactNode
}) {
  return (
    <p className={cn(PANEL, 'flex items-center gap-2.5 px-3.5 py-2.5 text-sm')}>
      <Icon className="text-brand-sky size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{children}</span>
    </p>
  )
}

function Empty({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles
  children: React.ReactNode
}) {
  return (
    <div className="border-foreground/15 text-foreground/70 flex items-center gap-3 rounded-2xl border border-dashed p-4 text-sm">
      <Icon className="text-brand-sky size-5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
