import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import type { LedgerEntryLike } from './ledger'
import { SOURCE_LABEL, formatDelta, ledgerLabel } from './ledger'

/** Point-ledger rows, newest first: what earned it, when, and the delta. */
export function LedgerList({
  entries,
  showSource = false,
  className,
}: {
  entries: (LedgerEntryLike & { id: string; createdAt: Date })[]
  showSource?: boolean
  className?: string
}) {
  return (
    <ol className={cn('divide-border/70 divide-y', className)}>
      {entries.map((e) => (
        <li key={e.id} className="flex items-center gap-4 py-3">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{ledgerLabel(e)}</span>
            <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
              {fmtDate(e.createdAt, 'date')}
              {showSource && ` · ${SOURCE_LABEL[e.source]}`}
              {showSource && e.source !== 'manual' && !e.ref && e.note
                ? ` · ${e.note}`
                : ''}
            </span>
          </span>
          <span
            className={cn(
              'font-mono text-sm font-medium tabular-nums',
              e.delta > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400',
            )}
          >
            {formatDelta(e.delta)}
          </span>
        </li>
      ))}
    </ol>
  )
}
