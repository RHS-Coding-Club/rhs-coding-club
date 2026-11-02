import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '#/lib/utils'

/**
 * A tag field: type and press Enter (or a comma) to add a chip, Backspace on
 * an empty field to remove the last one. Used for project tech and post tags.
 */
export function ChipInput({
  id,
  value,
  onChange,
  max,
  maxLength = 24,
  placeholder,
  normalize = (s) => s.trim().replace(/\s+/g, ' '),
  invalid,
  describedBy,
  className,
}: {
  id: string
  value: string[]
  onChange: (next: string[]) => void
  max: number
  maxLength?: number
  placeholder?: string
  normalize?: (raw: string) => string
  invalid?: boolean
  describedBy?: string
  className?: string
}) {
  const [draft, setDraft] = useState('')
  const full = value.length >= max

  const commit = (raw: string) => {
    const tag = normalize(raw).slice(0, maxLength)
    if (!tag || full) return
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  return (
    <div
      className={cn(
        'border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border bg-transparent px-2 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]',
        invalid && 'border-destructive',
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 font-mono text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== tag))}
            className="hover:bg-foreground/10 focus-visible:ring-ring/60 inline-flex size-5 items-center justify-center rounded-full outline-none focus-visible:ring-2"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        disabled={full}
        maxLength={maxLength + 1}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        placeholder={full ? `That's the limit (${max})` : placeholder}
        onChange={(e) => {
          const v = e.target.value
          if (v.endsWith(',')) commit(v.slice(0, -1))
          else setDraft(v)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit(draft)
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => draft && commit(draft)}
        className="placeholder:text-muted-foreground h-7 min-w-32 flex-1 bg-transparent px-1.5 text-base outline-none disabled:cursor-not-allowed md:text-sm"
      />
    </div>
  )
}
