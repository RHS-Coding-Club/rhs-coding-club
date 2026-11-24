import { Link } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import type { MemberProfile } from '#/services/members'

const DIFF = {
  easy: { solved: 'bg-success', label: 'Easy' },
  medium: { solved: 'bg-warning', label: 'Medium' },
  hard: { solved: 'bg-destructive', label: 'Hard' },
} as const

/** One square per live challenge week; solved weeks light up in their difficulty. */
export function WeeksSolved({
  weeks,
  solved,
}: {
  weeks: MemberProfile['weeks']
  solved: MemberProfile['solved']
}) {
  const done = new Set(solved.map((s) => s.id))
  const ordered = [...weeks].sort((a, b) => a.weekNo - b.weekNo)
  return (
    <div>
      <ol className="grid grid-cols-[repeat(auto-fill,minmax(3.75rem,1fr))] gap-2">
        {ordered.map((w) => {
          const ok = done.has(w.id)
          return (
            <li key={w.id}>
              <Link
                to="/challenges/$id"
                params={{ id: w.id }}
                title={`Week ${w.weekNo}: ${w.title} (${DIFF[w.difficulty].label})${ok ? ', solved' : ''}`}
                className={cn(
                  'flex aspect-square flex-col justify-between rounded-2xl p-2.5 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  ok
                    ? cn(DIFF[w.difficulty].solved, 'text-background')
                    : 'bg-foreground/[0.04] ring-border/70 text-muted-foreground ring-1 hover:bg-foreground/[0.07]',
                )}
              >
                <span className="font-mono text-[11px]">Wk</span>
                <span className="font-mono text-2xl leading-none font-medium tabular-nums">
                  {w.weekNo}
                </span>
                <span className="sr-only">
                  {w.title}, {ok ? 'solved' : 'not solved'}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
      <p className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {Object.entries(DIFF).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-[3px]', v.solved)} aria-hidden="true" />
            {v.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="ring-border size-2.5 rounded-[3px] ring-1"
            aria-hidden="true"
          />
          Not solved
        </span>
      </p>
    </div>
  )
}
