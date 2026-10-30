import { useState } from 'react'
import { X } from 'lucide-react'
import { SKILLS_MAX, SKILL_MAX_LENGTH, cleanSkills } from '#/lib/schemas/account'
import { Input } from '#/components/ui/input'

/**
 * Skills as removable chips. Type and press Enter or a comma to add;
 * Backspace on an empty field removes the last one. Up to SKILLS_MAX.
 */
export function SkillsInput({
  id,
  value,
  onChange,
  describedBy,
}: {
  id: string
  value: string[]
  onChange: (next: string[]) => void
  describedBy?: string
}) {
  const [draft, setDraft] = useState('')
  const full = value.length >= SKILLS_MAX

  const add = (parts: string[]) => {
    const clipped = parts.map((p) => p.slice(0, SKILL_MAX_LENGTH))
    if (clipped.every((p) => !p.trim())) return
    onChange(cleanSkills([...value, ...clipped]).slice(0, SKILLS_MAX))
  }
  const commit = () => {
    add([draft])
    setDraft('')
  }

  return (
    <div className="border-input focus-within:ring-ring/50 focus-within:border-ring flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border bg-transparent p-1.5 focus-within:ring-3">
      {value.map((s) => (
        <span
          key={s}
          className="bg-muted inline-flex items-center gap-1 rounded-lg py-1 pr-1 pl-2.5 text-sm"
        >
          {s}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== s))}
            className="text-muted-foreground hover:text-foreground hover:bg-background/60 rounded-md p-0.5"
            aria-label={`Remove ${s}`}
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <Input
        id={id}
        value={draft}
        disabled={full}
        aria-describedby={describedBy}
        maxLength={SKILL_MAX_LENGTH * 3}
        placeholder={
          full
            ? `${SKILLS_MAX} skills max`
            : value.length
              ? 'Add another'
              : 'Python, React, Arduino'
        }
        onChange={(e) => {
          const parts = e.target.value.split(',')
          const rest = parts.pop() ?? ''
          if (parts.length > 0) add(parts)
          setDraft(rest)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
        className="h-7 min-w-32 flex-1 border-0 bg-transparent! px-1.5 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
