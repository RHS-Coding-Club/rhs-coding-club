import { cn } from '#/lib/utils'

const STEPS = [
  { title: 'Make an account', body: 'Google, GitHub, or email. Takes a minute.' },
  {
    title: 'Answer four questions',
    body: 'Your grade, what you know, and what you want to do.',
  },
  {
    title: 'An officer lets you in',
    body: 'Usually within a week. You get an email either way.',
  },
]

/**
 * The three steps of joining as a horizontal track (stacked on phones).
 * `current` is how far the viewer has got: 0 signed out, 1 applying, 2 under
 * review, 3 a member. Steps before it read as done, the current one as active.
 */
export function JoinSteps({
  current,
  className,
}: {
  current: number
  className?: string
}) {
  return (
    <ol className={cn('grid gap-6 sm:grid-cols-3 sm:gap-0', className)}>
      {STEPS.map((s, i) => {
        const done = i < current
        const now = i === current && current > 0
        return (
          <li
            key={s.title}
            className="relative sm:pr-6"
            aria-current={now ? 'step' : undefined}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full font-mono text-xs',
                  done && 'bg-brand-sky text-on-sky',
                  now && 'bg-foreground text-background',
                  !done && !now && 'bg-muted text-foreground',
                )}
              >
                {done ? '✓' : i + 1}
                <span className="sr-only">
                  {done ? ' (done)' : now ? ' (current)' : ''}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'hidden h-px flex-1 sm:block',
                    done ? 'bg-brand-sky' : 'bg-border',
                  )}
                />
              )}
            </div>
            <p className="mt-4 font-medium">{s.title}</p>
            <p className="text-muted-foreground mt-1 max-w-60 text-sm text-pretty">
              {s.body}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
