import { Link, useNavigate } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { Calendar, Code2, Crown, FolderGit2, Sparkles } from 'lucide-react'
import CountUp from '#/components/bits/CountUp'
import TiltedCard from '#/components/bits/TiltedCard'
import { FadeUp, EASE } from '#/components/motion'
import { UserAvatar } from '#/components/user-avatar'
import { cn } from '#/lib/utils'
import type { Leaderboard, LeaderboardWindow } from '#/services/members'
import { BadgePips } from './badge-pips'

type Row = Leaderboard['rows'][number]

/** Segmented control for the two windows. Links, so each tab has its own URL. */
export function WindowTabs({ value }: { value: LeaderboardWindow }) {
  const reduced = useReducedMotion()
  const tabs = [
    { value: 'semester', label: 'This semester' },
    { value: 'all', label: 'All time' },
  ] as const
  return (
    <nav
      aria-label="Leaderboard window"
      className="inline-flex rounded-2xl bg-[#101826]/6 p-1 ring-1 ring-[#101826]/8 backdrop-blur-md dark:bg-white/8 dark:ring-white/10"
    >
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <Link
            key={t.value}
            to="/leaderboard"
            search={t.value === 'semester' ? {} : { window: t.value }}
            replace
            resetScroll={false}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'focus-visible:ring-ring relative rounded-xl px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2',
              active
                ? 'text-[#101826] dark:text-white'
                : 'text-[#101826]/60 hover:text-[#101826] dark:text-white/60 dark:hover:text-white',
            )}
          >
            {active && (
              <motion.span
                layoutId="leaderboard-tab"
                transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE }}
                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-white/14"
              />
            )}
            <span className="relative">{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

const PLACE = {
  1: {
    ring: 'ring-amber-400/70',
    text: 'text-amber-500 dark:text-amber-300',
    label: '1st',
  },
  2: {
    ring: 'ring-slate-300/80',
    text: 'text-slate-500 dark:text-slate-300',
    label: '2nd',
  },
  3: {
    ring: 'ring-orange-400/60',
    text: 'text-orange-600 dark:text-orange-300',
    label: '3rd',
  },
} as const

/**
 * The top three. #1 stands in the middle on React Bits Tilted Card (it leans
 * toward the cursor and catches a glare); #2 and #3 flank it on plain cards.
 * Stacks 1-2-3 on phones.
 */
export function Podium({
  rows,
  dark,
  viewerId,
}: {
  rows: Row[]
  dark: boolean
  viewerId: string | null
}) {
  const first = rows.at(0)
  const second = rows.at(1)
  const third = rows.at(2)
  return (
    <ol className="grid items-end gap-4 md:grid-cols-[1fr_1.15fr_1fr]">
      {second && (
        <li className="order-2 md:order-1">
          <FadeUp delay={0.1}>
            <PodiumCard row={second} place={2} you={second.userId === viewerId} />
          </FadeUp>
        </li>
      )}
      {first && (
        <li className="order-1 md:order-2">
          <FadeUp>
            <ChampionCard row={first} dark={dark} you={first.userId === viewerId} />
          </FadeUp>
        </li>
      )}
      {third && (
        <li className="order-3">
          <FadeUp delay={0.18}>
            <PodiumCard row={third} place={3} you={third.userId === viewerId} />
          </FadeUp>
        </li>
      )}
    </ol>
  )
}

function PodiumCard({ row, place, you }: { row: Row; place: 2 | 3; you: boolean }) {
  return (
    <Link
      to="/members/$id"
      params={{ id: row.userId }}
      className="group bg-card ring-border/70 hover:ring-border focus-visible:ring-ring flex flex-col items-center rounded-3xl px-6 pt-8 pb-7 text-center ring-1 transition-shadow outline-none focus-visible:ring-2"
      style={{ background: 'var(--bits-surface)' }}
    >
      <span className={cn('font-mono text-xs', PLACE[place].text)}>
        {PLACE[place].label}
        {you && ' · You'}
      </span>
      <UserAvatar
        user={row}
        className={cn('mt-4 size-20 text-2xl ring-4', PLACE[place].ring)}
      />
      <p className="mt-4 max-w-full truncate text-lg font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
        {row.name}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums">
        <CountUp to={row.points} separator="," duration={1.4} />
        <span className="text-muted-foreground ml-1.5 text-sm font-normal tracking-normal">
          pts
        </span>
      </p>
      <BadgePips badges={row.badges} className="mt-3 min-h-2.5" />
    </Link>
  )
}

function ChampionCard({ row, dark, you }: { row: Row; dark: boolean; you: boolean }) {
  const navigate = useNavigate()
  return (
    <TiltedCard
      containerHeight="360px"
      containerWidth="100%"
      imageHeight="360px"
      imageWidth="100%"
      rotateAmplitude={9}
      scaleOnHover={1.03}
      radius={28}
      glare={dark ? 0.45 : 0.6}
      shadow={dark ? 0.6 : 0.25}
      flipOnClick={false}
      showTooltip={false}
      captionText={`${row.name}, first place with ${row.points} points`}
      onClick={() => void navigate({ to: '/members/$id', params: { id: row.userId } })}
      style={
        {
          '--tc-shadow-color': dark ? 'rgba(0,0,0,0.6)' : 'rgba(31,79,138,0.35)',
        } as React.CSSProperties
      }
    >
      <div className="brand-gradient absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.35),transparent_70%)]"
      />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-mono text-xs backdrop-blur">
          <Crown className="size-3.5 text-amber-300" aria-hidden="true" />
          1st{you && ' · You'}
        </span>
        <UserAvatar
          user={row}
          className="mt-5 size-28 text-3xl text-[#101826] ring-4 ring-amber-300/90"
        />
        <p className="mt-5 max-w-full truncate text-2xl font-semibold tracking-tight">
          {row.name}
        </p>
        <p className="mt-1 text-5xl font-semibold tracking-[-0.045em] tabular-nums">
          <CountUp to={row.points} separator="," duration={1.8} />
          <span className="ml-2 text-base font-normal tracking-normal text-white/75">
            pts
          </span>
        </p>
        <BadgePips badges={row.badges} className="mt-4 min-h-2.5" />
      </div>
    </TiltedCard>
  )
}

/** Ranked rows below the podium, plus an optional pinned "You" row. */
export function RankList({
  rows,
  viewerId,
  pinned,
}: {
  rows: Row[]
  viewerId: string | null
  pinned: Row | null
}) {
  return (
    <div className="bg-card ring-border/70 overflow-hidden rounded-3xl ring-1">
      <ol className="divide-border/70 divide-y">
        {rows.map((r) => (
          <RankRow key={r.userId} row={r} you={r.userId === viewerId} />
        ))}
      </ol>
      {pinned && (
        <div className="border-border border-t border-dashed">
          <p className="text-muted-foreground px-5 pt-3 text-xs sm:px-6">Your rank</p>
          <ol>
            <RankRow row={pinned} you />
          </ol>
        </div>
      )}
    </div>
  )
}

function RankRow({ row, you }: { row: Row; you: boolean }) {
  return (
    <li>
      <Link
        to="/members/$id"
        params={{ id: row.userId }}
        className={cn(
          'hover:bg-muted/50 focus-visible:bg-muted/60 flex items-center gap-4 px-5 py-3.5 transition-colors outline-none sm:px-6',
          you && 'bg-brand-sky/8 hover:bg-brand-sky/12',
        )}
      >
        <span className="text-muted-foreground w-8 shrink-0 font-mono text-sm tabular-nums">
          {row.rank}
        </span>
        <UserAvatar user={row} className="size-9" />
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="truncate font-medium">{row.name}</span>
          {you && (
            <span className="bg-brand-sky/15 text-brand-navy rounded-full px-2 py-0.5 font-mono text-[11px] dark:text-sky-200">
              You
            </span>
          )}
          <BadgePips badges={row.badges} />
        </span>
        <span className="font-mono text-sm font-medium tabular-nums">
          {row.points.toLocaleString('en-US')}
          <span className="text-muted-foreground ml-1 font-sans text-xs font-normal">
            pts
          </span>
        </span>
      </Link>
    </li>
  )
}

/** The point values from settings, as four plain cards. */
export function HowPoints({ values }: { values: Leaderboard['values'] }) {
  const items = [
    {
      icon: Code2,
      title: 'Weekly challenges',
      body: `Easy ${values.easy}, medium ${values.medium}, hard ${values.hard}. Points land when an officer passes your solution.`,
    },
    {
      icon: Calendar,
      title: 'Showing up',
      body: `${values.attendance} for every meeting, RAP afternoon, or hackathon you check in to.`,
    },
    {
      icon: FolderGit2,
      title: 'Shipping projects',
      body: `${values.project} for each teammate when a project is approved for the showcase.`,
    },
    {
      icon: Sparkles,
      title: 'Officer bonuses',
      body: 'Officers add points for things like running a lunch session or mentoring at RAP.',
    },
  ]
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <li key={item.title}>
          <FadeUp
            delay={i * 0.06}
            className="ring-border/70 h-full rounded-3xl p-6 ring-1"
            style={{ background: 'var(--bits-surface)' }}
          >
            <item.icon className="text-brand-sky size-5" aria-hidden="true" />
            <p className="mt-5 font-semibold tracking-tight">{item.title}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {item.body}
            </p>
          </FadeUp>
        </li>
      ))}
    </ul>
  )
}
