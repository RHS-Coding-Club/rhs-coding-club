import { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '#/lib/utils'

/** A multi-select as toggle chips (each a button with aria-pressed). */
export function ChipGroup({
  label,
  options,
  value,
  onChange,
  error,
  errorId,
  className,
}: {
  label: string
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
  error?: string
  errorId?: string
  className?: string
}) {
  const labelId = useId()
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])
  return (
    <div className={className}>
      <p id={labelId} className="mb-3 text-sm font-medium">
        {label}
      </p>
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        className="flex flex-wrap gap-2"
      >
        {options.map((o) => {
          const on = value.includes(o)
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o)}
              className={cn(
                'focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors outline-none focus-visible:ring-2',
                on
                  ? 'bg-brand-sky/15 ring-brand-sky text-foreground'
                  : 'ring-border text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              {on && <Check className="text-brand-sky size-3.5" aria-hidden="true" />}
              {o}
            </button>
          )
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
