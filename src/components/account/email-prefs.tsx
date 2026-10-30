import { useState } from 'react'
import { toast } from 'sonner'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { PREF_TOPICS } from '#/lib/schemas/account'
import type { EmailPrefsInput } from '#/lib/schemas/account'
import { saveEmailPrefs } from '#/server/account'
import { serverMessage } from './form-helpers'

/** One switch per notification. Each flip saves right away. */
export function EmailPrefs({ initial }: { initial: EmailPrefsInput }) {
  const [prefs, setPrefs] = useState(initial)
  const [saving, setSaving] = useState<string | null>(null)

  async function flip(topic: keyof EmailPrefsInput, on: boolean) {
    const before = prefs
    const next = { ...prefs, [topic]: on }
    setPrefs(next)
    setSaving(topic)
    try {
      await saveEmailPrefs({ data: next })
      toast.success(on ? 'Turned on.' : 'Turned off. You won’t get these anymore.')
    } catch (err) {
      setPrefs(before)
      toast.error(serverMessage(err))
    } finally {
      setSaving(null)
    }
  }

  return (
    <ul className="divide-border/70 divide-y">
      {PREF_TOPICS.map((t) => (
        <li
          key={t.topic}
          className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0"
        >
          <div>
            <Label htmlFor={`pref-${t.topic}`} className="text-base font-medium">
              {t.label}
            </Label>
            <p
              id={`pref-${t.topic}-hint`}
              className="text-muted-foreground mt-0.5 text-sm"
            >
              {t.description}
            </p>
          </div>
          <Switch
            id={`pref-${t.topic}`}
            checked={prefs[t.topic]}
            disabled={saving === t.topic}
            onCheckedChange={(on) => void flip(t.topic, on)}
            aria-describedby={`pref-${t.topic}-hint`}
          />
        </li>
      ))}
    </ul>
  )
}
