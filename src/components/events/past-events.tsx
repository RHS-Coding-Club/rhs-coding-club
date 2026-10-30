import { Link } from '@tanstack/react-router'
import { CircleCheck, Users } from 'lucide-react'
import type { EventCardData } from '#/services/events'
import { monthLabel, tagLabel } from '#/lib/events'
import { fmtDate } from '#/lib/format'
import { FadeUp } from '#/components/motion'

/** Past events as a compact ledger, grouped by month, newest first. */
export function PastEvents({ events }: { events: EventCardData[] }) {
  const groups: { month: string; items: EventCardData[] }[] = []
  for (const e of events) {
    const month = monthLabel(e.startsAt)
    const last = groups.at(-1)
    if (last?.month === month) last.items.push(e)
    else groups.push({ month, items: [e] })
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((g, gi) => (
        <FadeUp key={g.month} delay={Math.min(gi, 3) * 0.05}>
          <h3 className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
            {g.month}
          </h3>
          <ul className="divide-border/70 border-border/70 divide-y border-y">
            {g.items.map((e) => (
              <li key={e.id}>
                <Link
                  to="/events/$id"
                  params={{ id: e.id }}
                  className="group hover:bg-muted/40 focus-visible:ring-ring/50 -mx-3 grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-4 outline-none focus-visible:ring-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto_auto]"
                >
                  <span className="text-muted-foreground font-mono text-sm tabular-nums">
                    {fmtDate(e.startsAt, 'short')}
                  </span>
                  <span className="min-w-0">
                    <span className="group-hover:decoration-brand-sky line-clamp-2 font-medium underline-offset-4 group-hover:underline sm:line-clamp-1">
                      {e.title}
                    </span>
                    <span className="text-muted-foreground block truncate text-sm">
                      {e.location}
                      {e.tags.length > 0 && (
                        <span className="sm:hidden">
                          {' '}
                          · {e.tags.map(tagLabel).join(', ')}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="text-muted-foreground hidden gap-1.5 sm:flex">
                    {e.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="ring-border rounded-full px-2 py-0.5 text-xs ring-1"
                      >
                        {tagLabel(t)}
                      </span>
                    ))}
                  </span>
                  <span className="flex items-center justify-end gap-3 text-right text-sm">
                    {e.viewerAttended && (
                      <span className="text-brand-sky inline-flex items-center gap-1 font-medium">
                        <CircleCheck className="size-4" aria-hidden="true" />
                        <span className="hidden sm:inline">You were there</span>
                        <span className="sr-only sm:hidden">You were there</span>
                      </span>
                    )}
                    <span className="text-muted-foreground tabular-nums">
                      <span className="text-foreground font-semibold">{e.attended}</span>
                      <span className="sr-only sm:not-sr-only"> attended</span>
                      <Users
                        className="ml-1 inline size-3.5 align-[-2px] sm:hidden"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </FadeUp>
      ))}
    </div>
  )
}
