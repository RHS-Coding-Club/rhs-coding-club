import { CheckCircle2, Circle, CircleDashed, RotateCcw } from 'lucide-react'
import { DIFFICULTY_LABEL, PROGRESS_LABEL } from '#/lib/schemas/challenges'
import type { DifficultyLevel, MemberProgress } from '#/lib/schemas/challenges'
import { cn } from '#/lib/utils'

/** Difficulty reads as a color family everywhere: green, amber, rose. */
export const DIFFICULTY_TONE: Record<DifficultyLevel, string> = {
  easy: 'text-emerald-700 bg-emerald-500/12 ring-emerald-600/20 dark:text-emerald-300 dark:bg-emerald-400/10 dark:ring-emerald-300/20',
  medium:
    'text-amber-700 bg-amber-500/14 ring-amber-600/20 dark:text-amber-300 dark:bg-amber-400/10 dark:ring-amber-300/20',
  hard: 'text-rose-700 bg-rose-500/12 ring-rose-600/20 dark:text-rose-300 dark:bg-rose-400/10 dark:ring-rose-300/20',
}

export const DIFFICULTY_DOT: Record<DifficultyLevel, string> = {
  easy: 'bg-emerald-500 dark:bg-emerald-400',
  medium: 'bg-amber-500 dark:bg-amber-400',
  hard: 'bg-rose-500 dark:bg-rose-400',
}

export function DifficultyPill({
  difficulty,
  className,
}: {
  difficulty: DifficultyLevel
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        DIFFICULTY_TONE[difficulty],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', DIFFICULTY_DOT[difficulty])}
      />
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  )
}

const PROGRESS_TONE: Record<MemberProgress, string> = {
  'not-started': 'text-muted-foreground',
  pending: 'text-brand-sky',
  passed: 'text-emerald-600 dark:text-emerald-300',
  failed: 'text-amber-700 dark:text-amber-300',
}

const PROGRESS_ICON = {
  'not-started': Circle,
  pending: CircleDashed,
  passed: CheckCircle2,
  failed: RotateCcw,
} as const

/** The viewer's own state on a challenge: icon plus label (label can be sr-only). */
export function ProgressMark({
  progress,
  hideLabel = false,
  className,
}: {
  progress: MemberProgress
  hideLabel?: boolean
  className?: string
}) {
  const Icon = PROGRESS_ICON[progress]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        PROGRESS_TONE[progress],
        className,
      )}
      title={hideLabel ? PROGRESS_LABEL[progress] : undefined}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className={hideLabel ? 'sr-only' : undefined}>
        {PROGRESS_LABEL[progress]}
      </span>
    </span>
  )
}

/** Review status as officers see it. */
export function ReviewStatusPill({ status }: { status: 'pending' | 'pass' | 'fail' }) {
  const tone = {
    pending: 'text-brand-sky bg-sky-500/10 ring-sky-500/25',
    pass: 'text-emerald-700 bg-emerald-500/12 ring-emerald-600/20 dark:text-emerald-300',
    fail: 'text-amber-700 bg-amber-500/14 ring-amber-600/20 dark:text-amber-300',
  }[status]
  const label = { pending: 'Pending', pass: 'Passed', fail: 'Needs work' }[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        tone,
      )}
    >
      {label}
    </span>
  )
}
