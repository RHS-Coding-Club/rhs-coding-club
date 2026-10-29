import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import {
  ArrowRight,
  Award,
  CalendarDays,
  CircleCheck,
  CircleDashed,
  CircleX,
  Code2,
  FolderGit2,
  Inbox,
  MapPin,
} from 'lucide-react'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { LedgerList } from '#/components/members/ledger-list'
import { RARITY } from '#/components/members/rarity'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import type { Dashboard } from '#/services/members'

type MemberDash = Extract<Dashboard, { kind: 'member' }>

/** A dashboard card: rounded surface, a small titled header, optional link. */
export function Card({
  title,
  icon,
  link,
  className,
  delay,
  children,
}: {
  title: string
  icon: React.ReactNode
  link?: React.ReactNode
  className?: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <FadeUp delay={delay} className={cn('h-full', className)}>
      <section
        className="ring-border/70 flex h-full flex-col rounded-3xl p-6 ring-1"
        style={{ background: 'var(--bits-surface)' }}
        aria-label={title}
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-medium [&_svg]:size-4">
            {icon}
            {title}
          </h2>
          {link}
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </section>
    </FadeUp>
  )
}

function CardLink({ to, children }: { to: LinkProps['to']; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
    >
      {children}
      <ArrowRight className="size-3" aria-hidden="true" />
    </Link>
  )
}

function Quiet({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground my-auto py-4 text-sm">{children}</p>
}

const SUBMISSION_STATE = {
  pending: {
    icon: CircleDashed,
    label: 'Submitted, waiting for review',
    tone: 'text-amber-600 dark:text-amber-300',
  },
  pass: {
    icon: CircleCheck,
    label: 'Passed',
    tone: 'text-emerald-600 dark:text-emerald-400',
  },
  fail: {
    icon: CircleX,
    label: 'Needs another try',
    tone: 'text-rose-600 dark:text-rose-400',
  },
} as const

export function ChallengeCard({ challenge }: { challenge: MemberDash['challenge'] }) {
  return (
    <Card
      title="This week’s challenge"
      icon={<Code2 />}
      link={<CardLink to="/challenges">All</CardLink>}
    >
      {!challenge ? (
        <Quiet>No challenge is live right now. Check back Monday.</Quiet>
      ) : (
        <div className="flex flex-1 flex-col">
          <p className="text-muted-foreground font-mono text-xs">
            Week {challenge.weekNo} ·{' '}
            <span className="capitalize">{challenge.difficulty}</span> ·{' '}
            {challenge.points} pts
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            {challenge.title}
          </p>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
            {challenge.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
            <SubmissionState submission={challenge.submission} />
            <RaisedButton
              asChild
              size="sm"
              variant={challenge.submission ? 'outline' : 'primary'}
            >
              <Link to="/challenges/$id" params={{ id: challenge.id }}>
                {challenge.submission ? 'View' : 'Solve it'}
                <ArrowRight />
              </Link>
            </RaisedButton>
          </div>
        </div>
      )}
    </Card>
  )
}

function SubmissionState({
  submission,
}: {
  submission: NonNullable<MemberDash['challenge']>['submission']
}) {
  if (!submission)
    return <span className="text-muted-foreground text-sm">Not submitted yet</span>
  const s = SUBMISSION_STATE[submission.status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', s.tone)}>
      <s.icon className="size-4" aria-hidden="true" />
      {s.label}
    </span>
  )
}

export function EventsCard({
  rsvps,
  delay,
}: {
  rsvps: MemberDash['rsvps']
  delay?: number
}) {
  return (
    <Card
      title="You’re going"
      icon={<CalendarDays />}
      link={<CardLink to="/events">Events</CardLink>}
      delay={delay}
    >
      {rsvps.length === 0 ? (
        <Quiet>No RSVPs coming up. Find a meeting or a RAP afternoon to join.</Quiet>
      ) : (
        <ul className="flex flex-col gap-3">
          {rsvps.map((e) => (
            <li key={e.id}>
              <Link
                to="/events/$id"
                params={{ id: e.id }}
                className="hover:bg-muted/50 -mx-2 flex gap-3 rounded-2xl p-2 transition-colors"
              >
                <span className="bg-brand-sky/12 text-brand-navy flex w-12 shrink-0 flex-col items-center rounded-xl py-1.5 dark:text-sky-200">
                  <span className="font-mono text-[10px] uppercase">
                    {fmtDate(e.startsAt, 'short').split(' ')[0]}
                  </span>
                  <span className="text-lg leading-tight font-semibold">
                    {fmtDate(e.startsAt, 'short').split(' ')[1]}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{e.title}</span>
                  <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                    {fmtDate(e.startsAt, 'time')}
                    <MapPin className="ml-1 size-3" aria-hidden="true" />
                    <span className="truncate">{e.location}</span>
                    {e.status === 'maybe' && <span> · maybe</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

const PROJECT_STATUS = {
  approved: 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-300',
  pending: 'text-amber-700 bg-amber-500/10 dark:text-amber-300',
  rejected: 'text-rose-700 bg-rose-500/10 dark:text-rose-300',
} as const

const PROJECT_STATUS_LABEL = {
  approved: 'In the showcase',
  pending: 'In review',
  rejected: 'Sent back',
} as const

export function ProjectsCard({
  projects,
  delay,
}: {
  projects: MemberDash['projects']
  delay?: number
}) {
  return (
    <Card
      title="Your projects"
      icon={<FolderGit2 />}
      link={<CardLink to="/projects">Showcase</CardLink>}
      delay={delay}
    >
      {projects.length === 0 ? (
        <Quiet>
          Nothing yet. Built something with a friend? Put it in the showcase for points.
        </Quiet>
      ) : (
        <ul className="divide-border/70 divide-y">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{p.title}</span>
                {p.status === 'rejected' && p.rejectionReason && (
                  <span className="text-muted-foreground block truncate text-xs">
                    {p.rejectionReason}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs',
                  PROJECT_STATUS[p.status],
                )}
              >
                {PROJECT_STATUS_LABEL[p.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function BadgesCard({
  badges,
  profileId,
  delay,
}: {
  badges: MemberDash['badges']
  profileId: string
  delay?: number
}) {
  return (
    <Card
      title="Recent badges"
      icon={<Award />}
      delay={delay}
      link={
        <Link
          to="/members/$id"
          params={{ id: profileId }}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
        >
          Your profile
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      }
    >
      {badges.length === 0 ? (
        <Quiet>Badges unlock on their own. Your first one is a single solve away.</Quiet>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {badges.map((b) => (
            <li key={b.id} className="flex items-center gap-3">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl"
                style={{
                  background: `color-mix(in oklab, ${RARITY[b.rarity].color} 16%, transparent)`,
                  color: RARITY[b.rarity].color,
                }}
              >
                <Award className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{b.name}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {b.description}
                </span>
              </span>
              <span className="text-muted-foreground shrink-0 font-mono text-xs">
                {fmtDate(b.awardedAt, 'short')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function LedgerCard({
  ledger,
  delay,
}: {
  ledger: MemberDash['ledger']
  delay?: number
}) {
  return (
    <Card
      title="Recent points"
      icon={<CircleCheck />}
      delay={delay}
      link={<CardLink to="/leaderboard">Leaderboard</CardLink>}
    >
      {ledger.length === 0 ? (
        <Quiet>No points yet. Pass a challenge or check in at a meeting to start.</Quiet>
      ) : (
        <LedgerList entries={ledger} className="-my-3" />
      )}
    </Card>
  )
}

const QUEUES = [
  { key: 'pendingApplications', label: 'Applications', to: '/admin/applications' },
  { key: 'pendingSubmissions', label: 'Submissions', to: '/admin/submissions' },
  { key: 'pendingProjects', label: 'Projects', to: '/admin/projects' },
  { key: 'pendingGithubRequests', label: 'GitHub requests', to: '/admin/github' },
  { key: 'unreadMessages', label: 'Messages', to: '/admin/messages' },
] as const

/** Officers: what's waiting in each review queue, one click from the admin page. */
export function QueuesCard({ queues }: { queues: NonNullable<MemberDash['queues']> }) {
  const total = QUEUES.reduce((s, q) => s + queues[q.key], 0)
  return (
    <Card
      title={
        total === 0 ? 'Officer queues: all caught up' : `Officer queues: ${total} waiting`
      }
      icon={<Inbox />}
      link={<CardLink to="/admin">Admin</CardLink>}
    >
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {QUEUES.map((q) => (
          <li key={q.key}>
            <Link
              to={q.to}
              className="bg-muted/40 hover:bg-muted flex h-full flex-col rounded-2xl px-4 py-3 transition-colors"
            >
              <span
                className={cn(
                  'text-2xl font-semibold tracking-[-0.03em] tabular-nums',
                  queues[q.key] === 0 && 'text-muted-foreground',
                )}
              >
                {queues[q.key]}
              </span>
              <span className="text-muted-foreground mt-0.5 text-xs">{q.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
