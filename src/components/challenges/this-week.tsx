import { Link } from '@tanstack/react-router'
import { ArrowRight, Users } from 'lucide-react'
import ElectricBorder from '#/components/bits/ElectricBorder'
import { RaisedButton } from '#/components/raised-button'
import { useIsDark } from '#/hooks/use-is-dark'
import { fmtDate } from '#/lib/format'
import type { DifficultyLevel, MemberProgress } from '#/lib/schemas/challenges'
import { DifficultyPill, ProgressMark } from './meta'
import { SamplePanel } from './code-view'

export interface FeaturedChallenge {
  id: string
  title: string
  description: string
  difficulty: DifficultyLevel
  points: number
  weekNo: number
  publishedAt: Date | null
  solves: number
  sampleInput?: string | null
  sampleOutput?: string | null
}

/**
 * This week's challenge, framed in React Bits Electric Border: a live sky
 * current runs around the card (and leans toward the cursor), which marks
 * it as the one open right now without another banner.
 */
export function ThisWeekCard({
  challenge,
  progress,
  initialDark,
}: {
  challenge: FeaturedChallenge
  /** Null when signed out (no status to show). */
  progress: MemberProgress | null
  initialDark: boolean
}) {
  const dark = useIsDark(initialDark)
  const hasSamples = Boolean(challenge.sampleInput || challenge.sampleOutput)
  const cta =
    progress === 'passed'
      ? 'Review your solve'
      : progress === 'pending'
        ? 'View your submission'
        : progress === 'failed'
          ? 'Try it again'
          : 'Open the challenge'

  return (
    <ElectricBorder
      color="#5fb2ee"
      theme={dark ? 'dark' : 'light'}
      borderRadius={28}
      speed={0.7}
      chaos={0.35}
      thickness={1.4}
      strands={2}
      glow={dark ? 0.7 : 0.45}
      intensity={dark ? 0.8 : 0.65}
      arcs={0.25}
      cursorRadius={120}
    >
      <article
        aria-labelledby="this-week-title"
        className="bg-card ring-border/70 relative grid gap-8 overflow-hidden rounded-[28px] p-6 ring-1 sm:p-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12"
        style={{ background: 'var(--bits-surface)' }}
      >
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-brand-sky font-mono font-medium">
              Week {challenge.weekNo}
            </span>
            <DifficultyPill difficulty={challenge.difficulty} />
            <span className="text-muted-foreground tabular font-mono">
              {challenge.points} pts
            </span>
            {challenge.publishedAt && (
              <span className="text-muted-foreground hidden sm:inline">
                Posted {fmtDate(challenge.publishedAt, 'short')}
              </span>
            )}
          </div>
          <h3
            id="this-week-title"
            className="mt-5 text-3xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-[2.75rem]"
          >
            {challenge.title}
          </h3>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
            {challenge.description}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
              <Users className="size-4" aria-hidden="true" />
              <span className="text-foreground tabular font-mono font-medium">
                {challenge.solves}
              </span>
              {challenge.solves === 1 ? 'solve' : 'solves'} so far
            </span>
            {progress && <ProgressMark progress={progress} />}
          </div>
          <div className="mt-6">
            <RaisedButton asChild size="lg">
              <Link to="/challenges/$id" params={{ id: challenge.id }}>
                {cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </RaisedButton>
          </div>
        </div>

        {hasSamples ? (
          <div className="flex min-w-0 flex-col gap-3 self-center">
            {challenge.sampleInput && (
              <SamplePanel label="Sample input" value={challenge.sampleInput} />
            )}
            {challenge.sampleOutput && (
              <SamplePanel label="Expected output" value={challenge.sampleOutput} />
            )}
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="hidden self-center font-mono text-sm leading-7 text-[#8b98a8] lg:block"
          >
            <SamplePanel
              label="solution.py"
              value={`def solve(problem):\n    # your idea here\n    return answer`}
            />
          </div>
        )}
      </article>
    </ElectricBorder>
  )
}
