import { useEffect, useId, useState } from 'react'
import { LoaderCircle, Search, X } from 'lucide-react'
import { UserAvatar } from '#/components/user-avatar'
import { cn } from '#/lib/utils'
import { searchTeammates } from '#/server/projects'
import type { TeamMember } from '#/services/projects'

/**
 * Search members by name and add them to the team. A combobox: arrow keys
 * move through results, Enter adds, Escape closes. Guests never appear (the
 * server only returns members). Read-only when `disabled`.
 */
export function TeammatePicker({
  id,
  value,
  onChange,
  max,
  excludeIds,
  disabled,
  describedBy,
}: {
  id: string
  value: TeamMember[]
  onChange: (next: TeamMember[]) => void
  max: number
  /** Always excluded (the submitter). */
  excludeIds: string[]
  disabled?: boolean
  describedBy?: string
}) {
  const listId = useId()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const full = value.length >= max
  const excludeKey = [...excludeIds, ...value.map((m) => m.id)].join(',')

  useEffect(() => {
    const term = q.trim()
    if (!term) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    let cancelled = false
    const t = setTimeout(() => {
      searchTeammates({
        data: { q: term, exclude: excludeKey ? excludeKey.split(',') : [] },
      })
        .then((rows) => {
          if (cancelled) return
          setResults(rows)
          setActive(0)
        })
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false))
    }, 180)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q, excludeKey])

  const add = (m: TeamMember) => {
    if (full || value.some((v) => v.id === m.id)) return
    onChange([...value, m])
    setQ('')
    setResults([])
  }

  const showList = open && q.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Teammates">
          {value.map((m) => (
            <li
              key={m.id}
              className="bg-muted/70 ring-border/70 inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-1 text-sm ring-1"
            >
              <UserAvatar user={m} className="size-6" />
              <span className="font-medium">{m.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v.id !== m.id))}
                  className="hover:bg-foreground/10 focus-visible:ring-ring/60 inline-flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-2"
                  aria-label={`Remove ${m.name} from the team`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id={id}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              showList && results[active] ? `${listId}-${results[active].id}` : undefined
            }
            aria-describedby={describedBy}
            autoComplete="off"
            value={q}
            disabled={full}
            placeholder={
              full ? `Teams are capped at ${max} teammates` : 'Search members by name'
            }
            onChange={(e) => {
              setQ(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                if (results[active]) add(results[active])
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-11 w-full rounded-xl border bg-transparent pr-9 pl-9 text-base shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
          />
          {loading && (
            <LoaderCircle
              className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
              aria-hidden="true"
            />
          )}
          {showList && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Matching members"
              className="bg-popover text-popover-foreground ring-border absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-lg ring-1"
            >
              {results.length === 0 ? (
                <li
                  className="text-muted-foreground px-3 py-2.5 text-sm"
                  role="presentation"
                >
                  {loading
                    ? 'Searching…'
                    : 'No members match. Guests can be added once they join.'}
                </li>
              ) : (
                results.map((m, i) => (
                  <li
                    key={m.id}
                    id={`${listId}-${m.id}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => add(m)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm',
                      i === active && 'bg-muted',
                    )}
                  >
                    <UserAvatar user={m} className="size-7" />
                    {m.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
