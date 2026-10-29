import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { ImageUpload } from '#/components/image-upload'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import {
  CRITERIA,
  CRITERIA_LABEL,
  RARITIES,
  RARITY_COLOR,
  RARITY_LABEL,
  badgeSchema,
} from '#/lib/schemas/badges'
import type { BadgeInput, Criteria, Rarity } from '#/lib/schemas/badges'
import { fieldErrors, serverErrorMessage } from '#/lib/schemas/community'
import type { FieldErrors } from '#/lib/schemas/community'
import { saveBadge } from '#/server/badges'
import { BadgePreview } from './badge-preview'

export const NEW_BADGE: BadgeInput = {
  name: '',
  description: '',
  imageKey: null,
  rarity: 'common',
  criteriaType: 'points',
  threshold: 100,
  autoAward: true,
  sortOrder: 0,
  isActive: true,
}

/**
 * Create or edit a badge, with a live preview. Saving an automatic badge
 * re-runs the badge engine, and the toast says how many members got it.
 */
export function BadgeForm({
  initial,
  onSaved,
}: {
  initial: BadgeInput
  onSaved: (id: string) => void
}) {
  const router = useRouter()
  const save = useServerFn(saveBadge)
  const [b, setB] = useState<BadgeInput>(initial)
  const [thresholdText, setThresholdText] = useState(
    initial.threshold === null ? '' : String(initial.threshold),
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const set = <TKey extends keyof BadgeInput>(k: TKey, v: BadgeInput[TKey]) =>
    setB((prev) => ({ ...prev, [k]: v }))
  const custom = b.criteriaType === 'custom'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const threshold = custom || thresholdText.trim() === '' ? null : Number(thresholdText)
    const parsed = badgeSchema.safeParse({ ...b, threshold })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setPending(true)
    try {
      const r = await save({ data: parsed.data })
      toast.success(
        r.awarded > 0
          ? `Saved. Awarded to ${r.awarded} member${r.awarded === 1 ? '' : 's'} who already qualify.`
          : 'Badge saved.',
      )
      await router.invalidate()
      onSaved(r.id)
    } catch (err) {
      setErrors({ _: serverErrorMessage(err) })
    } finally {
      setPending(false)
    }
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`badge-${k}-error`} role="alert" className="text-destructive text-sm">
        {errors[k]}
      </p>
    ) : null

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <BadgePreview
        {...b}
        threshold={custom || thresholdText === '' ? null : Number(thresholdText)}
      />

      <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-4">
        <div>
          <Label className="mb-1.5 block">Image</Label>
          <ImageUpload
            value={b.imageKey}
            onChange={(k) => set('imageKey', k)}
            purpose="badge"
            aspect="aspect-square"
            label="Upload badge art"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="badge-name">Name</Label>
            <Input
              id="badge-name"
              value={b.name}
              onChange={(e) => set('name', e.target.value)}
              maxLength={60}
              placeholder="First Solve"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'badge-name-error' : undefined}
            />
            {err('name')}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="badge-rarity">Rarity</Label>
            <Select value={b.rarity} onValueChange={(v) => set('rarity', v as Rarity)}>
              <SelectTrigger id="badge-rarity" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RARITIES.map((r) => (
                  <SelectItem key={r} value={r}>
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full"
                      style={{ background: RARITY_COLOR[r] }}
                    />
                    {RARITY_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="badge-description">Description</Label>
        <Textarea
          id="badge-description"
          value={b.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          maxLength={240}
          placeholder="Pass your first weekly challenge."
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? 'badge-description-error' : undefined}
        />
        {err('description')}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="badge-criteria">Earned by</Label>
          <Select
            value={b.criteriaType}
            onValueChange={(v) => {
              const next = v as Criteria
              setB((prev) => ({
                ...prev,
                criteriaType: next,
                autoAward: next === 'custom' ? false : prev.autoAward,
              }))
            }}
          >
            <SelectTrigger id="badge-criteria" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRITERIA.map((c) => (
                <SelectItem key={c} value={c}>
                  {CRITERIA_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="badge-threshold">Threshold</Label>
          <Input
            id="badge-threshold"
            type="number"
            inputMode="numeric"
            min={1}
            value={custom ? '' : thresholdText}
            onChange={(e) => setThresholdText(e.target.value)}
            disabled={custom}
            placeholder={custom ? 'Not used' : '100'}
            aria-invalid={errors.threshold ? true : undefined}
            aria-describedby={errors.threshold ? 'badge-threshold-error' : undefined}
          />
          {err('threshold')}
        </div>
      </div>

      <div className="border-border divide-border divide-y rounded-xl border">
        <ToggleRow
          id="badge-auto"
          label="Award automatically"
          hint={
            custom
              ? 'Custom badges are handed out by officers.'
              : 'The badge engine gives it to anyone who reaches the threshold.'
          }
          checked={b.autoAward}
          disabled={custom}
          onChange={(v) => set('autoAward', v)}
        />
        <ToggleRow
          id="badge-active"
          label="Active"
          hint="Inactive badges are hidden from profiles and never awarded."
          checked={b.isActive}
          onChange={(v) => set('isActive', v)}
        />
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <Label htmlFor="badge-order">Sort order</Label>
            <p className="text-muted-foreground text-xs">Lower numbers show first.</p>
          </div>
          <Input
            id="badge-order"
            type="number"
            min={0}
            max={9999}
            value={b.sortOrder}
            onChange={(e) =>
              set('sortOrder', Math.max(0, Math.trunc(Number(e.target.value) || 0)))
            }
            className="w-24"
          />
        </div>
      </div>
      {err('autoAward')}
      {errors._ && (
        <p role="alert" className="text-destructive text-sm">
          {errors._}
        </p>
      )}
      <div className="flex justify-end">
        <RaisedButton type="submit" size="lg" loading={pending} loadingText="Saving…">
          {initial.id ? 'Save changes' : 'Create badge'}
        </RaisedButton>
      </div>
    </form>
  )
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string
  label: string
  hint: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  )
}
