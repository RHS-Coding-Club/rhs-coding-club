import { Link } from '@tanstack/react-router'
import { CalendarDays, FolderGit2, Sparkles, Trophy } from 'lucide-react'
import type { HomeData } from '#/services/home'
import { fmtDate, initials } from '#/lib/format'
import { cn } from '#/lib/utils'

/**
 * Feature bento. Left cell is tall, the right side is a 2x2 of tinted cells.
 * The phone mocks in the template become small vignettes of real club UI,
 * rendered from loader data with designed empty states.
 */
export function FeatureBento({ data }: { data: HomeData }) {
  const { activeChallenge, leaderboard, nextEvent, featuredProjects, stats } = data
  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) pb-24"
      aria-labelledby="features-heading"
    >
      <h2 id="features-heading" className="sr-only">
        What the club offers
      </h2>
      <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
        <Cell tone="strong" className="lg:row-span-2">
          <CellHeader
            title="A challenge every week"
            text="Easy to hard, in any language. Submit a link, an officer reviews it, you earn points."
          />
          <ChallengeVignette challenge={activeChallenge} />
        </Cell>

        <Cell>
          <CellHeader
            title="Points and a leaderboard"
            text="Every solve, project, and meeting adds to the ledger. It resets each semester."
          />
          <LeaderboardVignette rows={leaderboard} />
        </Cell>

        <Cell>
          <CellHeader
            title="Events and RSVP"
            text="Meetings, service afternoons, and the hackathon. One tap to say you are coming."
          />
          <EventVignette event={nextEvent} />
        </Cell>

        <Cell>
          <CellHeader
            title="Projects and the GitHub org"
            text="Ship something, get it reviewed, and land in the showcase and our org."
          />
          <ProjectVignette projects={featuredProjects} />
        </Cell>

        <Cell tone="sky">
          <p className="text-sm font-medium opacity-80">The club right now</p>
          <dl className="mt-5 grid grid-cols-3 gap-4">
            <Stat n={stats.members} label="members" />
            <Stat n={stats.eventsThisSemester} label="events this semester" />
            <Stat n={stats.projects} label="projects shipped" />
          </dl>
          <p className="mt-6 text-sm opacity-80">
            Live counts from the club database.{' '}
            <Link to="/leaderboard" className="font-medium underline underline-offset-4">
              See the leaderboard
            </Link>
          </p>
        </Cell>
      </div>
    </section>
  )
}

function Cell({
  tone = 'tint',
  className,
  children,
}: {
  tone?: 'tint' | 'strong' | 'sky'
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-3xl p-6 sm:p-7',
        tone === 'tint' && 'bg-secondary/60 text-foreground',
        tone === 'strong' && 'bg-accent text-foreground',
        tone === 'sky' && 'bg-brand-sky text-[#0b0f15]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function CellHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="text-foreground/70 mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <dd className="font-mono text-3xl font-medium tracking-tight tabular-nums sm:text-4xl">
        {n}
      </dd>
      <dt className="mt-1 text-xs leading-snug opacity-80">{label}</dt>
    </div>
  )
}

/* ---------- vignettes ---------- */

const PANEL = 'bg-card text-card-foreground ring-border/60 rounded-2xl shadow-sm ring-1'

function ChallengeVignette({ challenge }: { challenge: HomeData['activeChallenge'] }) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      {challenge ? (
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
          <p className="text-muted-foreground mt-1.5 line-clamp-4 text-sm leading-relaxed">
            {challenge.description}
          </p>
          <span className="mt-4 inline-block text-sm font-medium underline-offset-4 group-hover:underline">
            Open the challenge
          </span>
        </Link>
      ) : (
        <Empty icon={Sparkles}>
          The next challenge drops soon. Members get an email when it does.
        </Empty>
      )}
      {/* Decorative submit row: what turning in a solution looks like. */}
      <div
        aria-hidden="true"
        className={cn(PANEL, 'mt-auto flex items-center gap-2 p-2 pl-4')}
      >
        <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">
          github.com/you/week-{challenge?.weekNo ?? 1}-solution
        </span>
        <span className="bg-foreground text-background rounded-full px-3 py-1.5 text-xs font-medium">
          Submit
        </span>
      </div>
    </div>
  )
}

function LeaderboardVignette({ rows }: { rows: HomeData['leaderboard'] }) {
  const top = rows.slice(0, 3)
  if (top.length === 0) {
    return (
      <Empty icon={Trophy}>
        Nobody is on the board yet this semester. Solve one challenge and you are first.
      </Empty>
    )
  }
  return (
    <ol className={cn(PANEL, 'divide-border/60 divide-y')}>
      {top.map((row, i) => (
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

function EventVignette({ event }: { event: HomeData['nextEvent'] }) {
  if (!event) {
    return (
      <Empty icon={CalendarDays}>No events on the calendar yet. Check back soon.</Empty>
    )
  }
  return (
    <Link
      to="/events"
      className={cn(
        PANEL,
        'flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5',
      )}
    >
      <div className="bg-secondary text-secondary-foreground flex size-12 shrink-0 flex-col items-center justify-center rounded-xl font-mono leading-none">
        <span className="text-[10px] tracking-wider uppercase">
          {fmtDate(event.startsAt, 'short').split(' ')[0]}
        </span>
        <span className="mt-0.5 text-lg font-medium tabular-nums">
          {fmtDate(event.startsAt, 'short').split(' ')[1]}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{event.title}</p>
        <p className="text-muted-foreground truncate text-xs">
          {fmtDate(event.startsAt, 'time')} · {event.location}
        </p>
      </div>
      <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">
        {event.going} going
      </span>
    </Link>
  )
}

function ProjectVignette({ projects }: { projects: HomeData['featuredProjects'] }) {
  const rows = projects.slice(0, 2)
  if (rows.length === 0) {
    return (
      <Empty icon={FolderGit2}>Nothing in the showcase yet. Be the first to ship.</Empty>
    )
  }
  return (
    <ul className={cn(PANEL, 'divide-border/60 divide-y')}>
      {rows.map((p) => (
        <li key={p.id} className="flex items-center gap-3 px-4 py-3">
          <FolderGit2 className="text-brand-sky size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.title}</p>
            <p className="text-muted-foreground truncate text-xs">
              {p.authorName}
              {p.tech.length > 0 && ` · ${p.tech.slice(0, 3).join(', ')}`}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Empty({
  icon: Icon,
  className,
  children,
}: {
  icon: typeof Sparkles
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'border-foreground/15 text-foreground/70 flex items-center gap-3 rounded-2xl border border-dashed p-4 text-sm',
        className,
      )}
    >
      <Icon className="text-brand-sky size-5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
