import { useCallback, useState } from 'react'
import { CheckCheck } from '#/components/icons/check-check'
import { Link2 } from '#/components/icons/link-2'
import { RotateCcw } from '#/components/icons/rotate-ccw'
import { Trophy } from '#/components/icons/trophy'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { ChallengeWalkthrough } from '#/components/stageshow/demos/challenge-walkthrough'
import { useIsDark } from '#/hooks/use-is-dark'
import { cn } from '#/lib/utils'
import { DIFFICULTY_DOT } from './meta'

const STEPS = [
  {
    icon: Link2,
    title: 'Submit a link',
    body: 'Solve it in any language, push it to GitHub, Replit, or wherever you code, and paste the link.',
  },
  {
    icon: CheckCheck,
    title: 'An officer reviews it',
    body: 'We read your code, run it against the samples, and leave a note. Not there yet? Fix it and resubmit.',
  },
  {
    icon: Trophy,
    title: 'Points hit the board',
    body: 'A pass adds the points to the leaderboard right away, and badges unlock on their own.',
  },
] as const

/**
 * Three steps from solving to scoring, with the current point values. Beside
 * the steps, a Stageshow walkthrough plays one solution's trip through them;
 * the step it's on lights up as it plays. The list is the real content, so it
 * reads the same with the demo off (reduced motion shows the finished board).
 */
export function HowItWorks({
  points,
  initialDark = true,
}: {
  points: { easy: number; medium: number; hard: number }
  initialDark?: boolean
}) {
  const dark = useIsDark(initialDark)
  const [step, setStep] = useState<number | null>(null)
  const [run, setRun] = useState(0)
  const onStep = useCallback((next: number | null) => setStep(next), [])

  return (
    <section
      aria-labelledby="how-heading"
      className="mx-auto max-w-6xl px-(--gutter) pt-16 pb-8 sm:pt-24 sm:pb-12"
    >
      <FadeUp className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2
            id="how-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            How it works
          </h2>
          <p className="mt-3 max-w-xl text-lg text-pretty text-muted-foreground">
            One challenge a week, open all week. Harder problems are worth more.
          </p>
        </div>
        <dl className="flex flex-wrap gap-2" aria-label="Points per difficulty">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <div
              key={d}
              className="flex items-center gap-2.5 rounded-full bg-card py-1.5 pr-4 pl-3 ring-1 ring-border/70"
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${DIFFICULTY_DOT[d]}`}
              />
              <dt className="text-sm text-muted-foreground capitalize">{d}</dt>
              <dd className="tabular font-mono text-sm font-medium">{points[d]} pts</dd>
            </div>
          ))}
        </dl>
      </FadeUp>

      <FadeUp className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <ol className="flex flex-col gap-1">
          {STEPS.map((s, i) => {
            const lit = step === i
            return (
              <li
                key={s.title}
                className={cn(
                  'relative flex gap-4 rounded-2xl p-4 transition-colors duration-200 ease-out sm:p-5',
                  lit && 'bg-card ring-1 ring-border/70',
                )}
              >
                <span
                  className={cn(
                    'grid size-10 flex-none place-items-center rounded-xl bg-brand-sky/12 text-brand-sky transition-opacity duration-200',
                    step !== null && !lit && 'opacity-60',
                  )}
                >
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3
                    className={cn(
                      'text-lg font-semibold tracking-tight transition-colors duration-200',
                      step !== null && !lit && 'text-muted-foreground',
                    )}
                  >
                    <span className="mr-2 font-mono text-sm font-normal text-muted-foreground tabular-nums">
                      0{i + 1}
                    </span>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </li>
            )
          })}
          <li className="mt-2 px-4 sm:px-5">
            <RaisedButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setStep(null)
                setRun((n) => n + 1)
              }}
            >
              <RotateCcw aria-hidden="true" />
              Replay the walkthrough
            </RaisedButton>
          </li>
        </ol>

        <div
          className="relative h-[21rem] overflow-hidden rounded-3xl ring-1 ring-border/70 sm:h-[26rem]"
          style={{ background: 'var(--bits-surface)' }}
        >
          <ChallengeWalkthrough
            key={run}
            theme={dark ? 'dark' : 'light'}
            hard={points.hard}
            onStep={onStep}
          />
        </div>
      </FadeUp>
    </section>
  )
}
