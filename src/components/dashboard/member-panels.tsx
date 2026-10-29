import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarCheck2,
  CalendarDays,
  CircleCheck,
  CircleDashed,
  CircleX,
  Code2,
  FolderGit2,
  MapPin,
} from 'lucide-react'
import CountUp from '#/components/bits/CountUp'
import { FadeUp, EASE } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { LedgerList } from '#/components/members/ledger-list'
import { RARITY } from '#/components/members/rarity'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import type { Dashboard } from '#/services/members'

type MemberDash = Extract<Dashboard, { kind: 'member' }>

/** A dashboard tile: rounded surface, titled header, optional link. */
function Panel({
  title,
  link,
  className,
  delay,
  children,
}: {
  title: string
  link?: React.ReactNode
  className?: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <FadeUp delay={delay} className={cn('h-full', className)}>
      <section
        className="ring-border/70 flex h-full flex-col rounded-3xl p-6 ring-1 sm:p-7"
        style={{ background: 'var(--bits-surface)' }}
        aria-label={title}
      >
        <header className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
          {link}
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </section>
    </FadeUp>
  )
}

function PanelLink({
  to,
  params,
  children,
}: {
  to: LinkProps['to']
  params?: LinkProps['params']
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      params={params}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  )
}

function Quiet({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground my-auto py-6 text-[15px]">{children}</p>
}

/** "2026-10-26" (a week's Monday) as a date that formats right in the club timezone. */
const weekDate = (week: string) => new Date(`${week}T12:00:00Z`)

/**
 * Semester points, rank, and all-time total, over a bar for each of the last
 * twelve weeks (this week solid). Bars grow in when the tile scrolls
 * into view.
 */
export function PointsPanel({ points }: { points: MemberDash['points'] }) {
  const max = Math.max(1, ...points.weeks.map((w) => w.points))
  const summary = points.weeks
    .map((w) => `${fmtDate(weekDate(w.week), 'short')}: ${w.points}`)
    .join(', ')

  return (
    <Panel
      title="Your points"
      link={<PanelLink to="/leaderboard">Leaderboard</PanelLink>}
    >
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <p className="text-muted-foreground text-sm">This semester</p>
          <p className="mt-1 text-[clamp(3rem,6vw,4.5rem)] leading-none font-semibold tracking-[-0.05em] tabular-nums">
            <CountUp to={points.semester} separator="," duration={1.2} />
          </p>
        </div>
        <dl className="flex gap-8 pb-1.5">
          <div>
            <dt className="text-muted-foreground text-sm">Rank</dt>
            <dd className="mt-1 font-mono text-2xl font-medium tabular-nums">
              {points.rank ? `#${points.rank}` : 'None'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">All time</dt>
            <dd className="mt-1 font-mono text-2xl font-medium tabular-nums">
              {points.allTime.toLocaleString('en-US')}
            </dd>
          </div>
        </dl>
      </div>

      <figure className="mt-auto pt-8">
        <div
          role="img"
          aria-label={`Points per week, last ${points.weeks.length} weeks. ${summary}.`}
          className="flex h-32 items-end gap-1.5 sm:gap-2"
        >
          {points.weeks.map((w, i) => {
            const current = i === points.weeks.length - 1
            return (
              <div
                key={w.week}
                title={`Week of ${fmtDate(weekDate(w.week), 'short')}: ${w.points} pts`}
                className="group relative flex h-full flex-1 items-end"
              >
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.03 }}
                  style={{
                    height: `${Math.max(4, (w.points / max) * 100)}%`,
                    transformOrigin: 'bottom',
                  }}
                  className={cn(
                    'w-full rounded-md transition-colors',
                    current
                      ? 'bg-brand-navy dark:bg-brand-sky'
                      : w.points > 0
                        ? 'bg-brand-navy/25 group-hover:bg-brand-navy/45 dark:bg-brand-sky/30 dark:group-hover:bg-brand-sky/55'
                        : 'bg-foreground/8',
                  )}
                />
              </div>
            )
          })}
        </div>
        <figcaption className="text-muted-foreground mt-3 flex justify-between font-mono text-xs">
          <span>{fmtDate(weekDate(points.weeks[0]?.week ?? ''), 'short')}</span>
          <span>This week</span>
        </figcaption>
      </figure>
    </Panel>
  )
}

/** Lifetime counts: challenges passed, events attended, projects shipped. */
export function StatsPanel({
  stats,
  delay,
}: {
  stats: MemberDash['stats']
  delay?: number
}) {
  const rows = [
    { icon: Code2, n: stats.challenges, label: 'Challenges passed' },
    { icon: CalendarCheck2, n: stats.events, label: 'Events attended' },
    { icon: FolderGit2, n: stats.projects, label: 'Projects shipped' },
  ]
  return (
    <Panel title="All time" delay={delay}>
      <ul className="divide-border/70 -my-2 flex flex-1 flex-col justify-between divide-y">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-4 py-4">
            <span className="bg-brand-sky/12 text-brand-navy grid size-11 shrink-0 place-items-center rounded-2xl dark:text-sky-200">
              <r.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-muted-foreground flex-1 text-[15px]">{r.label}</span>
            <span className="font-mono text-3xl font-medium tracking-tight tabular-nums">
              <CountUp to={r.n} duration={1} />
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

const SUBMISSION_STATE = {
  pending: { icon: CircleDashed, label: 'Submitted, waiting for review' },
  pass: { icon: CircleCheck, label: 'Passed' },
  fail: { icon: CircleX, label: 'Needs another try' },
} as const

/** This week's problem on the navy card the blog uses for its lead post. */
export function ChallengePanel({
  challenge,
  delay,
}: {
  challenge: MemberDash['challenge']
  delay?: number
}) {
  if (!challenge) {
    return (
      <Panel title="This week's challenge" delay={delay}>
        <Quiet>No challenge is live right now. A new one drops Monday.</Quiet>
      </Panel>
    )
  }
  const state = challenge.submission
    ? SUBMISSION_STATE[challenge.submission.status]
    : null
  return (
    <FadeUp delay={delay} className="h-full">
      <Link
        to="/challenges/$id"
        params={{ id: challenge.id }}
        className="group bg-brand-navy focus-visible:ring-brand-sky/60 relative flex h-full flex-col overflow-hidden rounded-3xl p-6 text-[#e6edf5] outline-none focus-visible:ring-4 sm:p-7"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_90%_at_100%_0%,rgba(95,178,238,0.45)_0%,transparent_60%)] transition-opacity duration-700 group-hover:opacity-75"
        />
        <div className="relative flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            This week&apos;s challenge
          </h2>
          <ArrowUpRight
            className="size-5 text-[#e6edf5]/70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </div>
        <p className="relative mt-6 font-mono text-sm text-[#e6edf5]/65">
          Week {challenge.weekNo} ·{' '}
          <span className="capitalize">{challenge.difficulty}</span> · {challenge.points}{' '}
          pts
        </p>
        <p className="relative mt-2 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">
          {challenge.title}
        </p>
        <p className="relative mt-3 line-clamp-2 text-[15px] leading-relaxed text-[#e6edf5]/75">
          {challenge.description}
        </p>
        <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
          {state ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/15">
              <state.icon className="size-4" aria-hidden="true" />
              {state.label}
            </span>
          ) : (
            <span className="text-sm text-[#e6edf5]/70">Not submitted yet</span>
          )}
          <span className="inline-flex items-center gap-1.5 font-medium">
            {challenge.submission ? 'View it' : 'Solve it'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </FadeUp>
  )
}

/** The next event you RSVP'd to, large, then the rest. */
export function NextUpPanel({
  rsvps,
  delay,
}: {
  rsvps: MemberDash['rsvps']
  delay?: number
}) {
  const next = rsvps.at(0)
  const later = rsvps.slice(1)
  return (
    <Panel
      title="You're going"
      delay={delay}
      link={<PanelLink to="/events">All events</PanelLink>}
    >
      {!next ? (
        <div className="my-auto flex flex-col items-start gap-4 py-4">
          <p className="text-muted-foreground text-[15px]">
            No RSVPs coming up. Lunch meetings, RAP afternoons, and the H2O hackathon are
            all on the events page.
          </p>
          <RaisedButton asChild variant="outline" size="sm">
            <Link to="/events">
              <CalendarDays />
              Find an event
            </Link>
          </RaisedButton>
        </div>
      ) : (
        <>
          <Link
            to="/events/$id"
            params={{ id: next.id }}
            className="group bg-brand-sky/10 hover:bg-brand-sky/15 ring-brand-sky/20 flex gap-5 rounded-2xl p-4 ring-1 transition-colors"
          >
            <DateBlock date={next.startsAt} large />
            <span className="min-w-0 self-center">
              <span className="text-muted-foreground block text-xs">
                {fmtDate(next.startsAt, 'weekday')}
                {next.status === 'maybe' && ' · maybe'}
              </span>
              <span className="mt-0.5 block text-lg leading-snug font-semibold tracking-[-0.02em]">
                {next.title}
              </span>
              <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                {fmtDate(next.startsAt, 'time')}
                <MapPin className="ml-1 size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{next.location}</span>
              </span>
            </span>
          </Link>
          {later.length > 0 && (
            <ul className="mt-3 flex flex-col">
              {later.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="hover:bg-muted/50 flex items-center gap-4 rounded-2xl p-2.5 transition-colors"
                  >
                    <DateBlock date={e.startsAt} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium">
                        {e.title}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {fmtDate(e.startsAt, 'time')} · {e.location}
                        {e.status === 'maybe' && ' · maybe'}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  )
}

function DateBlock({ date, large }: { date: Date; large?: boolean }) {
  const [month, day] = fmtDate(date, 'short').split(' ')
  return (
    <span
      className={cn(
        'bg-card ring-border/70 flex shrink-0 flex-col items-center justify-center rounded-xl ring-1',
        large ? 'size-16' : 'size-11',
      )}
    >
      <span className="text-brand-navy font-mono text-[10px] uppercase dark:text-sky-200">
        {month}
      </span>
      <span
        className={cn(
          'leading-none font-semibold tabular-nums',
          large ? 'mt-1 text-2xl' : 'mt-0.5 text-base',
        )}
      >
        {day}
      </span>
    </span>
  )
}

/** Recent badges as medallions in their rarity color. */
export function BadgesPanel({
  badges,
  profileId,
  delay,
}: {
  badges: MemberDash['badges']
  profileId: string
  delay?: number
}) {
  return (
    <Panel
      title="Badges"
      delay={delay}
      link={
        <PanelLink to="/members/$id" params={{ id: profileId }}>
          Profile
        </PanelLink>
      }
    >
      {badges.length === 0 ? (
        <Quiet>Badges unlock on their own. Your first one is a single solve away.</Quiet>
      ) : (
        <ul className="grid grid-cols-3 gap-x-2 gap-y-5">
          {badges.map((b) => {
            const color = RARITY[b.rarity].color
            return (
              <li
                key={b.id}
                title={`${b.name}: ${b.description} (${RARITY[b.rarity].label}, ${fmtDate(b.awardedAt)})`}
                className="flex flex-col items-center text-center"
              >
                <span
                  className="grid size-14 place-items-center rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${color} 40%, transparent), color-mix(in oklab, ${color} 12%, transparent) 70%)`,
                    boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${color} 55%, transparent)`,
                    color,
                  }}
                >
                  <Award className="size-6" aria-hidden="true" />
                </span>
                <span className="mt-2 line-clamp-2 text-xs leading-tight font-medium">
                  {b.name}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export function ActivityPanel({
  ledger,
  delay,
}: {
  ledger: MemberDash['ledger']
  delay?: number
}) {
  return (
    <Panel title="Recent points" delay={delay}>
      {ledger.length === 0 ? (
        <Quiet>No points yet. Pass a challenge or check in at a meeting to start.</Quiet>
      ) : (
        <LedgerList entries={ledger.slice(0, 5)} className="-my-3" />
      )}
    </Panel>
  )
}

const PROJECT_STATUS = {
  approved: { label: 'In the showcase', tone: 'bg-emerald-500' },
  pending: { label: 'In review', tone: 'bg-amber-500' },
  rejected: { label: 'Sent back', tone: 'bg-rose-500' },
} as const

export function ProjectsPanel({
  projects,
  delay,
}: {
  projects: MemberDash['projects']
  delay?: number
}) {
  return (
    <Panel
      title="Your projects"
      delay={delay}
      link={<PanelLink to="/projects/new">New</PanelLink>}
    >
      {projects.length === 0 ? (
        <Quiet>
          Nothing yet. Built something with a friend? Put it in the showcase for points.
        </Quiet>
      ) : (
        <ul className="-my-1 flex flex-col">
          {projects.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Link
                to="/projects/$id"
                params={{ id: p.id }}
                className="hover:bg-muted/50 -mx-2.5 flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors"
              >
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    PROJECT_STATUS[p.status].tone,
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">
                    {p.title}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {PROJECT_STATUS[p.status].label}
                    {p.status === 'rejected' && p.rejectionReason
                      ? ` · ${p.rejectionReason}`
                      : ''}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

const QUEUES = [
  { key: 'pendingApplications', label: 'application', to: '/admin/applications' },
  { key: 'pendingSubmissions', label: 'submission', to: '/admin/submissions' },
  { key: 'pendingProjects', label: 'project', to: '/admin/projects' },
  { key: 'pendingGithubRequests', label: 'GitHub request', to: '/admin/github' },
  { key: 'unreadMessages', label: 'message', to: '/admin/messages' },
] as const

/** Officers: one line saying what's waiting, each queue a chip into admin. */
export function QueueStrip({ queues }: { queues: NonNullable<MemberDash['queues']> }) {
  const waiting = QUEUES.filter((q) => queues[q.key] > 0)
  const total = waiting.reduce((s, q) => s + queues[q.key], 0)
  return (
    <FadeUp>
      <div
        className="ring-border/70 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-3xl px-5 py-4 ring-1 sm:px-6"
        style={{ background: 'var(--bits-surface)' }}
      >
        <p className="font-medium">
          {total === 0
            ? 'Officer queues are all clear.'
            : `${total} waiting for officers`}
        </p>
        <ul className="flex flex-1 flex-wrap gap-2">
          {waiting.map((q) => (
            <li key={q.key}>
              <Link
                to={q.to}
                className="bg-muted/60 hover:bg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors"
              >
                <span className="font-mono font-medium tabular-nums">
                  {queues[q.key]}
                </span>
                {q.label}
              </Link>
            </li>
          ))}
        </ul>
        <PanelLink to="/admin">Open admin</PanelLink>
      </div>
    </FadeUp>
  )
}
