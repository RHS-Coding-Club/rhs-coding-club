import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Lock, Plus, X } from 'lucide-react'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { fmtDate } from '#/lib/format'
import { saveSettingSchema } from '#/lib/schemas/settings'
import { serverErrorMessage } from '#/lib/schemas/community'
import type { EditableSettingKey } from '#/lib/schemas/settings'
import { cn } from '#/lib/utils'
import { saveSettings } from '#/server/settings'

type Kind = 'text' | 'textarea' | 'email' | 'url' | 'number' | 'switch'
interface Field {
  path: string
  label: string
  kind: Kind
  hint?: string
  placeholder?: string
  /** Optional suffix for number fields ("pts"). */
  unit?: string
}

/** The fields of each group, in order. Values are validated by the group's Zod schema. */
const FIELDS: Record<EditableSettingKey, Field[]> = {
  'club-info': [
    { path: 'clubName', label: 'Club name', kind: 'text' },
    {
      path: 'tagline',
      label: 'Tagline',
      kind: 'text',
      hint: 'The big line on the about page.',
    },
    { path: 'description', label: 'Description', kind: 'textarea' },
    { path: 'missionStatement', label: 'Mission statement', kind: 'textarea' },
    {
      path: 'meetingSchedule',
      label: 'Meeting schedule',
      kind: 'text',
      placeholder: 'Lunch, every week',
    },
    {
      path: 'meetingLocation',
      label: 'Meeting location',
      kind: 'text',
      placeholder: "Mr. Derrick's classroom",
    },
    {
      path: 'contactEmail',
      label: 'Contact email',
      kind: 'email',
      hint: 'Gets a copy of every contact form message. Leave empty to only use the inbox.',
      placeholder: 'officers@example.org',
    },
  ],
  social: [
    {
      path: 'instagram',
      label: 'Instagram',
      kind: 'url',
      placeholder: 'https://www.instagram.com/…',
    },
    { path: 'github', label: 'GitHub', kind: 'url', placeholder: 'https://github.com/…' },
    {
      path: 'discord',
      label: 'Discord invite',
      kind: 'url',
      placeholder: 'https://discord.gg/…',
    },
    {
      path: 'youtube',
      label: 'YouTube',
      kind: 'url',
      placeholder: 'https://www.youtube.com/@…',
    },
  ],
  points: [
    { path: 'easy', label: 'Easy challenge', kind: 'number', unit: 'pts' },
    { path: 'medium', label: 'Medium challenge', kind: 'number', unit: 'pts' },
    { path: 'hard', label: 'Hard challenge', kind: 'number', unit: 'pts' },
    { path: 'project', label: 'Approved project', kind: 'number', unit: 'pts' },
    { path: 'attendance', label: 'Event attendance', kind: 'number', unit: 'pts' },
    {
      path: 'showTop',
      label: 'Leaderboard size',
      kind: 'number',
      unit: 'rows',
      hint: 'How many members the public leaderboard lists.',
    },
  ],
  'github-org': [
    {
      path: 'welcomeMessage',
      label: 'Welcome message',
      kind: 'textarea',
      hint: 'Shown on /github once a member’s invite goes out.',
    },
    {
      path: 'inviteExpiryDays',
      label: 'Invite expiry',
      kind: 'number',
      unit: 'days',
      hint: 'GitHub invites expire after 7 days; this only changes the date members see.',
    },
  ],
  email: [
    {
      path: 'senderName',
      label: 'Sender name',
      kind: 'text',
      placeholder: 'RHS Coding Club',
    },
    {
      path: 'replyTo',
      label: 'Reply-to address',
      kind: 'email',
      hint: 'Where replies to club emails go. Empty means the sending address.',
    },
    {
      path: 'notifications.newChallenge',
      label: 'New challenge announcements',
      kind: 'switch',
    },
    {
      path: 'notifications.eventReminder',
      label: 'Event reminders (24 hours before)',
      kind: 'switch',
    },
    {
      path: 'notifications.weeklyDigest',
      label: 'Weekly digest (Mondays)',
      kind: 'switch',
    },
    {
      path: 'notifications.projectDecision',
      label: 'Project approved / rejected',
      kind: 'switch',
    },
    {
      path: 'notifications.applicationDecision',
      label: 'Application decisions',
      kind: 'switch',
    },
  ],
}

type Obj = Record<string, unknown>
function getAt(obj: Obj, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Obj | undefined)?.[k], obj)
}
function setAt(obj: Obj, path: string, value: unknown): Obj {
  const [head, ...rest] = path.split('.')
  return {
    ...obj,
    [head]: rest.length
      ? setAt((obj[head] as Obj | undefined) ?? {}, rest.join('.'), value)
      : value,
  }
}

/**
 * One settings group as a form. Officers see it read-only (disabled inputs
 * and a note); admins can save. Validation runs against the same Zod schema
 * the server uses, and errors land under their field.
 */
export function SettingsForm({
  group,
  value,
  canEdit,
  meta,
}: {
  group: EditableSettingKey
  value: Obj
  canEdit: boolean
  meta?: { updatedAt: Date; updatedByName: string | null }
}) {
  const router = useRouter()
  const save = useServerFn(saveSettings)
  const [draft, setDraft] = useState<Obj>(value)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(value)
  const update = (path: string, v: unknown) => setDraft((d) => setAt(d, path, v))

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = saveSettingSchema.safeParse({ key: group, value: draft })
    if (!parsed.success) {
      const out: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const p = issue.path.slice(1).join('.')
        out[p] ??= issue.message
      }
      setErrors(out)
      return
    }
    setErrors({})
    setPending(true)
    try {
      await save({ data: parsed.data })
      toast.success('Settings saved.')
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const fields = FIELDS[group]
  const switches = fields.filter((f) => f.kind === 'switch')
  const inputs = fields.filter((f) => f.kind !== 'switch')

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {!canEdit && (
        <p className="bg-muted text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <Lock className="size-4 shrink-0" aria-hidden="true" />
          You can view settings. Only admins can change them.
        </p>
      )}

      <fieldset disabled={!canEdit} className="flex flex-col gap-5 disabled:opacity-90">
        <div className={cn('grid gap-5', group === 'points' && 'sm:grid-cols-2')}>
          {inputs.map((f) => (
            <FieldInput
              key={f.path}
              field={f}
              value={getAt(draft, f.path)}
              error={errors[f.path]}
              onChange={(v) => update(f.path, v)}
            />
          ))}
        </div>

        {group === 'social' && (
          <CustomLinks
            links={
              (draft.customLinks as { label: string; url: string }[] | undefined) ?? []
            }
            errors={errors}
            onChange={(links) => update('customLinks', links)}
            disabled={!canEdit}
          />
        )}

        {switches.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Notifications the club sends</p>
            <div className="border-border divide-border divide-y rounded-xl border">
              {switches.map((f) => (
                <div
                  key={f.path}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <Label htmlFor={`set-${f.path}`} className="font-normal">
                    {f.label}
                  </Label>
                  <Switch
                    id={`set-${f.path}`}
                    checked={Boolean(getAt(draft, f.path))}
                    onCheckedChange={(v) => update(f.path, v)}
                  />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Off stops the email for everyone. Members can also opt out themselves in
              Account settings.
            </p>
          </div>
        )}
      </fieldset>

      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <p className="text-muted-foreground text-xs">
          {meta
            ? `Last saved ${fmtDate(meta.updatedAt, 'datetime')}${meta.updatedByName ? ` by ${meta.updatedByName}` : ''}.`
            : 'Using the defaults. Never saved.'}
        </p>
        {canEdit && (
          <div className="flex gap-2">
            {dirty && (
              <RaisedButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setDraft(value)
                  setErrors({})
                }}
              >
                Discard
              </RaisedButton>
            )}
            <RaisedButton
              type="submit"
              loading={pending}
              loadingText="Saving…"
              disabled={!dirty}
            >
              Save changes
            </RaisedButton>
          </div>
        )}
      </div>
    </form>
  )
}

function FieldInput({
  field: f,
  value,
  error,
  onChange,
}: {
  field: Field
  value: unknown
  error?: string
  onChange: (v: unknown) => void
}) {
  const id = `set-${f.path}`
  const describedBy = [f.hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ')
  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{f.label}</Label>
      {f.kind === 'textarea' ? (
        <Textarea
          {...common}
          rows={3}
          value={String(value ?? '')}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : f.kind === 'number' ? (
        <div className="relative">
          <Input
            {...common}
            type="number"
            inputMode="numeric"
            min={0}
            value={typeof value === 'number' && Number.isFinite(value) ? value : ''}
            onChange={(e) =>
              onChange(
                e.target.value === '' ? Number.NaN : Math.trunc(Number(e.target.value)),
              )
            }
            className="tabular pr-14 font-mono"
          />
          {f.unit && (
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
              {f.unit}
            </span>
          )}
        </div>
      ) : (
        <Input
          {...common}
          type={f.kind === 'email' ? 'email' : f.kind === 'url' ? 'url' : 'text'}
          value={String(value ?? '')}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {f.hint && (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {f.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

function CustomLinks({
  links,
  errors,
  onChange,
  disabled,
}: {
  links: { label: string; url: string }[]
  errors: Record<string, string>
  onChange: (links: { label: string; url: string }[]) => void
  disabled: boolean
}) {
  return (
    <div>
      <p className="text-sm font-medium">Other links</p>
      <p className="text-muted-foreground mb-3 text-xs">
        Up to six, shown on the contact page.
      </p>
      <ul className="flex flex-col gap-2">
        {links.map((l, i) => (
          <li key={i} className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Input
                aria-label={`Link ${i + 1} label`}
                value={l.label}
                placeholder="Label"
                className="w-40 shrink-0"
                onChange={(e) =>
                  onChange(
                    links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
              />
              <Input
                aria-label={`Link ${i + 1} URL`}
                type="url"
                value={l.url}
                placeholder="https://"
                onChange={(e) =>
                  onChange(
                    links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
                  )
                }
              />
              <RaisedButton
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove link ${i + 1}`}
                onClick={() => onChange(links.filter((_, j) => j !== i))}
              >
                <X />
              </RaisedButton>
            </div>
            {(errors[`customLinks.${i}.label`] || errors[`customLinks.${i}.url`]) && (
              <p role="alert" className="text-destructive text-sm">
                {errors[`customLinks.${i}.label`] ?? errors[`customLinks.${i}.url`]}
              </p>
            )}
          </li>
        ))}
      </ul>
      {!disabled && links.length < 6 && (
        <RaisedButton
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => onChange([...links, { label: '', url: '' }])}
        >
          <Plus aria-hidden="true" />
          Add link
        </RaisedButton>
      )}
    </div>
  )
}
