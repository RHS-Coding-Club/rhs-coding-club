import { useId, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '#/lib/utils'

/**
 * A single-choice row of pills. The highlight slides between options with a
 * shared `layoutId`. Semantics are a radio group: one tab stop, arrow keys
 * move the choice.
 */
export function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: readonly { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  const layoutId = useId()
  const reduced = useReducedMotion()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'bg-muted/70 ring-border/70 inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full p-1 ring-1 [scrollbar-width:none]',
        className,
      )}
    >
      {options.map((o, i) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'focus-visible:ring-ring/60 relative shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="bg-background dark:bg-card absolute inset-0 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: 'spring', bounce: 0.18, duration: 0.45 }
                }
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {o.label}
              {o.count !== undefined && (
                <span className="text-muted-foreground tabular font-mono text-xs">
                  {o.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
