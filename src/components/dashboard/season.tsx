import { Link } from '@tanstack/react-router'
import { Award } from '#/components/icons/award'
import { CalendarDays } from '#/components/icons/calendar-days'
import { Check } from '#/components/icons/check'
import { CodeXml } from '#/components/icons/code-xml'
import { Flame } from '#/components/icons/flame'
import { FolderGit2 } from '#/components/icons/folder-git-2'
import { Lock } from '#/components/icons/lock'
import Counter from '#/components/bits/Counter'
import { QueueStrip } from '#/components/dashboard/queue-strip'
import {
  Meter,
  UNIT,
  nextBadges,
  plural,
  streakWeeks,
} from '#/components/members/progress'
import { RARITY } from '#/components/members/rarity'
import { formatDelta, ledgerLabel } from '#/components/members/ledger'
import { FadeUp } from '#/components/motion'
import { UserAvatar } from '#/components/user-avatar'
import { CardLink } from '#/components/dashboard/card-link'
import { CLUB_TIMEZONE, fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import type { Dashboard } from '#/services/members'

/**
 * The member dashboard as a season pass: a points meter toward the next rank,
 * this week's quests with their rewards, your neighbors on the board, the
 * badges about to unlock, and the ledger printed as a receipt.
 */

export type MemberDash = Extract<Dashboard, { kind: 'member' }>

const DAY_KEY = new Intl.DateTimeFormat('en-CA', {
  timeZone: CLUB_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
/** "2026-11-23" for a moment, in the club's timezone. */
const dayKey = (d: Date) => DAY_KEY.format(d)

/** The seven day keys, Monday to Sunday, of the club-timezone week holding `now`. */
function weekDays(now: Date) {
  const [y, m, d] = dayKey(now).split('-').map(Number) as [number, number, number]
  const base = new Date(Date.UTC(y, m - 1, d, 12))
  const back = (base.getUTCDay() + 6) % 7
  return Array.from({ length: 7 }, (_, i) =>
    new Date(base.getTime() + (i - back) * 86_400_000).toISOString().slice(0, 10),
  )
}

/** Hero aside: the season total on React Bits Counter, rolling into place. */
export function SeasonScore({ d }: { d: MemberDash }) {
  const streak = streakWeeks(d.points.weeks)
  return (
    <div className="glass-panel w-full rounded-[28px] p-6 sm:w-80 sm:p-7">
      <p className="text-muted-foreground text-sm">Season points</p>
      <div className="mt-2 text-foreground" aria-hidden="true">
        <Counter
          value={d.points.semester}
          fontSize="clamp(3.25rem, 7vw, 4.5rem)"
          fontWeight={600}
          textColor="currentColor"
          gap={0}
          padding={4}
          tabular
          intro
          duration={1.1}
          digitStyle={{ letterSpacing: '-0.04em' }}
        />
      </div>
      <p className="sr-only">{d.points.semester} season points</p>
      <dl className="border-border/70 mt-5 grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <dt className="text-muted-foreground text-xs">Rank</dt>
          <dd className="mt-0.5 font-mono text-xl font-medium tabular-nums">
            {d.points.rank ? `#${d.points.rank}` : 'None'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Streak</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-mono text-xl font-medium tabular-nums">
            {streak} wk
            {streak >= 2 && (
              <Flame className="text-medal-bronze size-4" aria-hidden="true" />
            )}
          </dd>
        </div>
      </dl>
    </div>
  )
}

/** Hero children: how far to the next rank, as one long meter. */
export function SeasonMeter({ d }: { d: MemberDash }) {
  const above = d.board.above
  const mine = d.points.semester
  if (!above) {
    return (
      <p className="inline-flex items-center gap-2 rounded-full bg-ink/8 px-4 py-2 text-sm text-ink ring-1 ring-ink/12">
        {d.points.rank === 1
          ? 'You lead the board this season.'
          : 'Score any points to join the board.'}
      </p>
    )
  }
  const gap = Math.max(0, above.points - mine)
  return (
    <div className="max-w-xl">
      <div className="flex items-baseline justify-between gap-4 text-sm text-ink/75">
        <span>
          <span className="font-medium text-ink">
            {gap === 0 ? 'Tied' : `${gap} pts`}
          </span>{' '}
          {gap === 0 ? 'with' : 'to pass'} {above.name}
        </span>
        <span className="font-mono tabular-nums">Next: #{above.rank}</span>
      </div>
      <Meter
        value={above.points ? mine / above.points : 0}
        color="var(--brand-sky)"
        className="mt-2.5 h-2 bg-ink/10"
        label={`Progress toward passing ${above.name}`}
      />
    </div>
  )
}

type Quest = {
  key: string
  title: string
  detail: string
  reward: number | null
  done: boolean
  state?: string
  to: React.ReactNode
}

function quests(d: MemberDash, now: Date): Quest[] {
  const values = d.values
  const list: Quest[] = []
  const c = d.challenge
  if (c) {
    const s = c.submission?.status
    list.push({
      key: 'challenge',
      title: `Solve week ${c.weekNo}: ${c.title}`,
      detail: `${c.difficulty.charAt(0).toUpperCase()}${c.difficulty.slice(1)} · any language`,
      reward: c.points,
      done: s === 'pass',
      state: s === 'pending' ? 'In review' : s === 'fail' ? 'Try again' : undefined,
      to: (
        <Link
          to="/challenges/$id"
          params={{ id: c.id }}
          className="absolute inset-0 rounded-2xl"
        >
          <span className="sr-only">Open week {c.weekNo}</span>
        </Link>
      ),
    })
  }
  const week = new Set(weekDays(now))
  const event = d.rsvps.find((e) => week.has(dayKey(e.startsAt))) ?? d.rsvps.at(0)
  list.push(
    event
      ? {
          key: 'event',
          title: `Show up: ${event.title}`,
          detail: `${fmtDate(event.startsAt, 'datetime')} · check in with the code`,
          reward: values.attendance,
          done: false,
          state: 'Going',
          to: (
            <Link
              to="/events/$id"
              params={{ id: event.id }}
              className="absolute inset-0 rounded-2xl"
            >
              <span className="sr-only">Open {event.title}</span>
            </Link>
          ),
        }
      : {
          key: 'event',
          title: 'RSVP to a meeting',
          detail: 'Lunch meetings, RAP afternoons, the hackathon',
          reward: values.attendance,
          done: false,
          to: (
            <Link to="/events" className="absolute inset-0 rounded-2xl">
              <span className="sr-only">Find an event</span>
            </Link>
          ),
        },
  )
  const pending = d.projects.find((p) => p.status === 'pending')
  list.push(
    pending
      ? {
          key: 'project',
          title: `Get ${pending.title} approved`,
          detail: 'An officer is reviewing it. Every teammate gets the points.',
          reward: values.project,
          done: false,
          state: 'In review',
          to: (
            <Link
              to="/projects/$id"
              params={{ id: pending.id }}
              className="absolute inset-0 rounded-2xl"
            >
              <span className="sr-only">Open {pending.title}</span>
            </Link>
          ),
        }
      : {
          key: 'project',
          title: 'Ship a project',
          detail: 'Put something you built in the showcase',
          reward: values.project,
          done: false,
          to: (
            <Link to="/projects/new" className="absolute inset-0 rounded-2xl">
              <span className="sr-only">Add a project</span>
            </Link>
          ),
        },
  )
  const streak = streakWeeks(d.points.weeks)
  const thisWeekPts = d.points.weeks.at(-1)?.points ?? 0
  list.push({
    key: 'streak',
    title: streak > 0 ? `Keep your ${streak}-week streak` : 'Start a streak',
    detail: 'Earn any points before Sunday ends',
    reward: null,
    done: thisWeekPts > 0,
    to: null,
  })
  return list
}

function QuestList({ d, now }: { d: MemberDash; now: Date }) {
  const list = quests(d, now)
  const done = list.filter((q) => q.done).length
  return (
    <section
      aria-labelledby="quests-heading"
      className="ring-border/70 flex h-full flex-col rounded-3xl p-6 ring-1 sm:p-7"
      style={{ background: 'var(--bits-surface)' }}
    >
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <h2 id="quests-heading" className="text-xl font-semibold tracking-[-0.02em]">
          This week&apos;s quests
        </h2>
        <span className="text-muted-foreground font-mono text-sm tabular-nums">
          {done}/{list.length} done
        </span>
      </header>
      <ul className="flex flex-col gap-2">
        {list.map((q) => (
          <li
            key={q.key}
            className={cn(
              'relative flex items-center gap-4 rounded-2xl p-3.5 ring-1 transition-colors sm:p-4',
              q.done
                ? 'bg-success/6 ring-success/15'
                : 'bg-foreground/[0.025] ring-border/70',
              q.to && 'hover:bg-foreground/[0.05] focus-within:ring-ring',
            )}
          >
            <span
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-full',
                q.done
                  ? 'bg-success text-background'
                  : 'ring-foreground/25 ring-[1.5px] ring-inset',
              )}
              aria-hidden="true"
            >
              {q.done && <Check className="size-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block truncate text-[15px] font-medium',
                  q.done && 'text-muted-foreground line-through decoration-1',
                )}
              >
                {q.title}
              </span>
              <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                {q.done ? 'Done' : q.detail}
              </span>
            </span>
            {q.state && !q.done && (
              <span className="bg-muted text-muted-foreground hidden shrink-0 rounded-full px-2.5 py-1 text-xs sm:inline">
                {q.state}
              </span>
            )}
            {q.reward !== null && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 font-mono text-xs font-medium tabular-nums',
                  q.done ? 'text-success' : 'bg-brand-sky/12 text-accent-foreground',
                )}
              >
                +{q.reward}
              </span>
            )}
            {q.to}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Neighborhood({ board }: { board: MemberDash['board'] }) {
  const me = board.neighbors.find((n) => n.me)
  return (
    <section
      aria-labelledby="board-heading"
      className="ring-border/70 flex h-full flex-col rounded-3xl p-6 ring-1 sm:p-7"
      style={{ background: 'var(--bits-surface)' }}
    >
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <h2 id="board-heading" className="text-xl font-semibold tracking-[-0.02em]">
          Around you
        </h2>
        <CardLink to="/leaderboard">Full board</CardLink>
      </header>
      {board.neighbors.length === 0 ? (
        <p className="text-muted-foreground my-auto text-sm">
          Nobody has points yet. Be first.
        </p>
      ) : (
        <ol className="flex flex-col">
          {board.neighbors.map((n) => {
            const diff = me ? n.points - me.points : 0
            return (
              <li
                key={n.userId}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5',
                  n.me && 'bg-brand-navy text-brand-frost',
                )}
              >
                <span
                  className={cn(
                    'w-7 font-mono text-sm tabular-nums',
                    n.me ? 'text-brand-frost/70' : 'text-muted-foreground',
                  )}
                >
                  {n.rank}
                </span>
                <UserAvatar user={n} className="size-8" />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                  {n.me ? 'You' : n.name}
                </span>
                {!n.me && me && diff !== 0 && (
                  <span className="text-muted-foreground hidden text-xs sm:inline">
                    {diff > 0 ? `${diff} ahead` : `${-diff} behind`}
                  </span>
                )}
                <span className="w-14 text-right font-mono text-sm tabular-nums">
                  {n.points.toLocaleString('en-US')}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

const RING = 2 * Math.PI * 26

function Unlocks({
  collection,
  userId,
}: {
  collection: MemberDash['collection']
  userId: string
}) {
  const next = nextBadges(collection, 3)
  const held = collection.filter((b) => b.awardedAt)
  return (
    <section aria-labelledby="unlocks-heading">
      <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="unlocks-heading"
          className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
        >
          Almost unlocked
        </h2>
        <CardLink to="/members/$id" params={{ id: userId }}>
          {held.length} of {collection.length} collected
        </CardLink>
      </header>
      <ul className="grid gap-3 sm:grid-cols-3">
        {next.map((b) => {
          const r = RARITY[b.rarity]
          return (
            <li
              key={b.id}
              className="ring-border/70 flex items-center gap-4 rounded-3xl p-5 ring-1"
              style={{
                background: `linear-gradient(160deg, color-mix(in oklab, ${r.color} 9%, var(--card)), var(--card))`,
              }}
            >
              <span className="relative grid size-16 shrink-0 place-items-center">
                <svg
                  viewBox="0 0 60 60"
                  className="absolute inset-0 -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    strokeWidth="4"
                    stroke="color-mix(in oklab, var(--foreground) 9%, transparent)"
                  />
                  <circle
                    className="progress-ring"
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke={r.color}
                    strokeDasharray={RING}
                    strokeDashoffset={RING * (1 - b.ratio)}
                    style={{ '--ring-length': `${RING}` } as React.CSSProperties}
                  />
                </svg>
                <Award className="size-6" style={{ color: r.color }} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold">{b.name}</span>
                </span>
                <span className="text-muted-foreground mt-0.5 block text-sm">
                  {plural(
                    Math.max(0, (b.threshold ?? 0) - (b.current ?? 0)),
                    UNIT[b.criteriaType] ?? ['more', 'more'],
                  )}{' '}
                  to go
                </span>
                <span
                  className="mt-1.5 block font-mono text-[11px] tracking-wide"
                  style={{ color: r.color }}
                >
                  {r.label} · {b.current}/{b.threshold}
                </span>
              </span>
            </li>
          )
        })}
        {next.length === 0 && (
          <li className="text-muted-foreground border-border rounded-3xl border border-dashed p-6 text-sm sm:col-span-3">
            Every badge that unlocks on its own is yours. Officers hand out the rest.
          </li>
        )}
      </ul>
      {held.length > 0 && (
        <ul
          className="mt-4 flex flex-wrap items-center gap-2"
          aria-label="Badges you hold"
        >
          {held.map((b) => {
            const r = RARITY[b.rarity]
            return (
              <li
                key={b.id}
                className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs font-medium ring-1"
                style={{
                  background: `color-mix(in oklab, ${r.color} 8%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${r.color} 22%, transparent)`,
                }}
              >
                <span
                  className="grid size-6 place-items-center rounded-full"
                  style={{
                    color: r.color,
                    background: `color-mix(in oklab, ${r.color} 16%, transparent)`,
                  }}
                >
                  <Award className="size-3.5" aria-hidden="true" />
                </span>
                {b.name}
              </li>
            )
          })}
          {collection
            .filter((b) => !b.awardedAt && b.current === null)
            .slice(0, 3)
            .map((b) => (
              <li
                key={b.id}
                className="text-muted-foreground ring-border/70 flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs ring-1"
              >
                <span className="bg-muted grid size-6 place-items-center rounded-full">
                  <Lock className="size-3" aria-hidden="true" />
                </span>
                {b.name}
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}

/** The ledger printed as a receipt: mono rows, dotted leaders, a total. */
function Receipt({ d, now }: { d: MemberDash; now: Date }) {
  return (
    <section
      aria-labelledby="receipt-heading"
      className="receipt-tear bg-card ring-border/70 flex h-full flex-col p-6 pb-10 ring-1 sm:p-7 sm:pb-12"
      style={{ borderRadius: '24px 24px 0 0' }}
    >
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <h2 id="receipt-heading" className="text-xl font-semibold tracking-[-0.02em]">
          Point receipt
        </h2>
        <span className="text-muted-foreground font-mono text-xs">
          {fmtDate(now, 'date')}
        </span>
      </header>
      {d.ledger.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing printed yet. Your first points land here.
        </p>
      ) : (
        <ol className="flex flex-col gap-2.5 font-mono text-[13px]">
          {d.ledger.slice(0, 7).map((e) => (
            <li key={e.id} className="flex items-end gap-2">
              <span className="text-muted-foreground w-12 shrink-0 tabular-nums">
                {fmtDate(e.createdAt, 'short')}
              </span>
              <span className="min-w-0 text-pretty sm:truncate">{ledgerLabel(e)}</span>
              <span className="receipt-leader h-3 min-w-4 flex-1" aria-hidden="true" />
              <span
                className={cn(
                  'shrink-0 tabular-nums',
                  e.delta > 0 ? 'text-success' : 'text-destructive',
                )}
              >
                {formatDelta(e.delta)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="border-border mt-auto flex items-baseline justify-between border-t border-dashed pt-4 font-mono">
        <span className="text-muted-foreground text-sm">Season total</span>
        <span className="text-lg font-medium tabular-nums">
          {d.points.semester.toLocaleString('en-US')}
        </span>
      </div>
    </section>
  )
}

const PROJECT_STATUS = {
  approved: 'In the showcase',
  pending: 'In review',
  rejected: 'Sent back',
} as const

function Builds({ d }: { d: MemberDash }) {
  return (
    <section
      aria-labelledby="builds-heading"
      className="ring-border/70 flex h-full flex-col rounded-3xl p-6 ring-1 sm:p-7"
      style={{ background: 'var(--bits-surface)' }}
    >
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <h2 id="builds-heading" className="text-xl font-semibold tracking-[-0.02em]">
          Your builds
        </h2>
        <CardLink to="/projects/new">New</CardLink>
      </header>
      {d.projects.length === 0 ? (
        <p className="text-muted-foreground my-auto text-sm">
          Nothing shipped yet. A project is worth points for every teammate.
        </p>
      ) : (
        <ul className="grid gap-2">
          {d.projects.slice(0, 4).map((p) => (
            <li key={p.id}>
              <Link
                to="/projects/$id"
                params={{ id: p.id }}
                className="hover:bg-muted/50 -mx-2 flex items-center gap-3 rounded-2xl p-2 transition-colors"
              >
                <span className="brand-gradient grid size-10 shrink-0 place-items-center rounded-xl text-white/85">
                  <FolderGit2 className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.title}</span>
                  <span className="text-muted-foreground block text-xs">
                    {PROJECT_STATUS[p.status]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="border-border/70 mt-auto flex gap-6 border-t pt-4 text-sm">
        {(
          [
            [d.stats.challenges, ['solve', 'solves']],
            [d.stats.events, ['check-in', 'check-ins']],
            [d.stats.projects, ['shipped', 'shipped']],
          ] as const
        ).map(([n, [one, many]]) => (
          <span key={one}>
            <span className="font-mono font-medium tabular-nums">{n}</span>{' '}
            <span className="text-muted-foreground">{n === 1 ? one : many}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export function SeasonBody({
  d,
  userId,
  now,
}: {
  d: MemberDash
  userId: string
  now: Date
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-(--gutter) py-10 sm:py-14">
      {d.queues && <QueueStrip queues={d.queues} />}
      <FadeUp className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <QuestList d={d} now={now} />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <Neighborhood board={d.board} />
        </div>
      </FadeUp>
      <FadeUp className="py-8 sm:py-12">
        <Unlocks collection={d.collection} userId={userId} />
      </FadeUp>
      <FadeUp className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <Receipt d={d} now={now} />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <Builds d={d} />
        </div>
      </FadeUp>
      <p className="text-muted-foreground flex items-center justify-center gap-2 pt-4 text-sm">
        <CalendarDays className="size-4" aria-hidden="true" />
        <Link
          to="/events"
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Every meeting and event
        </Link>
        <span aria-hidden="true">·</span>
        <CodeXml className="size-4" aria-hidden="true" />
        <Link
          to="/challenges"
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Older challenges
        </Link>
      </p>
    </div>
  )
}
