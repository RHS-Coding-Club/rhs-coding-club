import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import AnimatedList from '#/components/bits/AnimatedList'
import type { AnimatedListEntry } from '#/components/bits/AnimatedList'
import { EmptyState } from '#/components/empty-state'
import { FadeUp } from '#/components/motion'
import { useIsDark } from '#/hooks/use-is-dark'
import { memberProgress } from '#/lib/schemas/challenges'
import type { DifficultyLevel, SubmissionStatusValue } from '#/lib/schemas/challenges'
import { DifficultyPill, ProgressMark } from './meta'
import { FilterPills } from './filter-pills'

export interface ArchiveChallenge {
  id: string
  title: string
  description: string
  difficulty: DifficultyLevel
  points: number
  weekNo: number
  solves: number
}

/** Animated List's surfaces mapped onto the site's blue-biased tokens. */
const LIST_VARS = {
  '--al-frame': 'var(--bits-glass)',
  '--al-frame-edge': 'var(--bits-edge)',
  '--al-frame-highlight': 'var(--bits-highlight)',
  '--al-tile': 'var(--bits-tile)',
  '--al-tile-edge': 'var(--bits-edge)',
  '--al-tile-highlight': 'var(--bits-highlight)',
} as CSSProperties

type DifficultyFilter = 'all' | DifficultyLevel
type SolvedFilter = 'all' | 'solved' | 'unsolved'

/**
 * Every live challenge in React Bits Animated List: rows pop in as they
 * scroll into the frame, and the list is one keyboard stop (arrow keys move,
 * Enter opens). Each row's title is also a real link, so middle-click and
 * cmd-click work and crawlers see every challenge.
 */
export function ChallengeArchive({
  challenges,
  mine,
  showSolvedFilter,
  initialDark,
}: {
  challenges: ArchiveChallenge[]
  mine: Record<string, SubmissionStatusValue>
  /** Members get a solved / unsolved filter. */
  showSolvedFilter: boolean
  initialDark: boolean
}) {
  const router = useRouter()
  const dark = useIsDark(initialDark)
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [solved, setSolved] = useState<SolvedFilter>('all')

  const counts = useMemo(() => {
    const by = { all: challenges.length, easy: 0, medium: 0, hard: 0 }
    for (const ch of challenges) by[ch.difficulty]++
    return by
  }, [challenges])

  const visible = useMemo(
    () =>
      challenges.filter((ch) => {
        if (difficulty !== 'all' && ch.difficulty !== difficulty) return false
        if (solved === 'all') return true
        const passed = mine[ch.id] === 'pass'
        return solved === 'solved' ? passed : !passed
      }),
    [challenges, difficulty, solved, mine],
  )

  const items: (AnimatedListEntry & { challenge: ArchiveChallenge })[] = visible.map(
    (ch) => ({ id: ch.id, title: ch.title, challenge: ch }),
  )

  return (
    <section
      aria-labelledby="archive-heading"
      className="mx-auto max-w-6xl px-(--gutter) pt-8 pb-16 sm:pt-12 sm:pb-24"
    >
      <FadeUp className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2
            id="archive-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            Every challenge so far
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg">
            Old weeks stay open. Pick any of them up and submit whenever you like.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.05} className="mt-8 flex flex-wrap items-center gap-3">
        <FilterPills
          label="Filter by difficulty"
          value={difficulty}
          onChange={setDifficulty}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'easy', label: 'Easy', count: counts.easy },
            { value: 'medium', label: 'Medium', count: counts.medium },
            { value: 'hard', label: 'Hard', count: counts.hard },
          ]}
        />
        {showSolvedFilter && (
          <FilterPills
            label="Filter by your progress"
            value={solved}
            onChange={setSolved}
            options={[
              { value: 'all', label: 'Any' },
              { value: 'unsolved', label: 'Unsolved' },
              { value: 'solved', label: 'Solved' },
            ]}
          />
        )}
      </FadeUp>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState icon={<SearchX />} title="Nothing matches those filters.">
            Try another difficulty, or switch back to all challenges.
          </EmptyState>
        ) : (
          <AnimatedList
            key={`${difficulty}-${solved}`}
            items={items}
            theme={dark ? 'dark' : 'light'}
            accentColor="#5fb2ee"
            width="100%"
            maxHeight={620}
            radius={18}
            gap={8}
            animation="pop"
            animateOnce
            stagger={0.04}
            className="w-full!"
            style={LIST_VARS}
            itemClassName="py-3! pr-4! pl-3! sm:py-3.5! sm:pr-5! sm:pl-4!"
            onItemSelect={(item) => {
              if (typeof item === 'string' || item.id == null) return
              void router.navigate({
                to: '/challenges/$id',
                params: { id: String(item.id) },
              })
            }}
            renderItem={(item) => {
              const ch = (item as (typeof items)[number]).challenge
              const progress = memberProgress(mine[ch.id])
              return (
                <ArchiveRow
                  challenge={ch}
                  progress={showSolvedFilter ? progress : null}
                />
              )
            }}
          />
        )}
      </div>
    </section>
  )
}

function ArchiveRow({
  challenge: ch,
  progress,
}: {
  challenge: ArchiveChallenge
  progress: ReturnType<typeof memberProgress> | null
}) {
  return (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-[color:var(--al-well)] text-center sm:size-14">
        <span className="flex flex-col leading-none">
          <span className="text-[10px] tracking-wide text-[color:var(--al-muted)] uppercase">
            Wk
          </span>
          <span className="tabular mt-1 font-mono text-base font-medium sm:text-lg">
            {ch.weekNo}
          </span>
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          to="/challenges/$id"
          params={{ id: ch.id }}
          tabIndex={-1}
          // The row handles clicks and Enter itself; the link is for
          // middle-click, cmd-click, and crawlers.
          onClick={(e) => e.stopPropagation()}
          className="line-clamp-2 text-[15px] leading-tight font-semibold sm:truncate tracking-[-0.01em] outline-none before:absolute before:inset-0 before:rounded-[inherit] sm:text-base"
        >
          {ch.title}
        </Link>
        <span className="truncate text-[13px] leading-snug text-[color:var(--al-muted)] sm:text-sm">
          {ch.description}
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-4 md:flex">
        <DifficultyPill difficulty={ch.difficulty} />
        <span className="tabular w-20 text-right font-mono text-sm whitespace-nowrap text-[color:var(--al-muted)]">
          {ch.solves} {ch.solves === 1 ? 'solve' : 'solves'}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className="tabular font-mono text-sm font-medium">{ch.points} pts</span>
        <span className="md:hidden">
          <DifficultyPill difficulty={ch.difficulty} className="px-2 text-[11px]" />
        </span>
      </span>
      {progress && (
        <ProgressMark progress={progress} hideLabel className="relative shrink-0" />
      )}
    </>
  )
}
