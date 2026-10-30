import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
import { saveEvent } from '#/server/events'
import { eventFormSchema } from '#/lib/schemas/events'
import type { EventFormValues } from '#/lib/schemas/events'
import { EVENT_TAGS, tagLabel, toClubLocalInput } from '#/lib/events'
import { cn } from '#/lib/utils'
import { RaisedButton } from '#/components/raised-button'
import { ImageUpload } from '#/components/image-upload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { errorMessage } from './rsvp'

type Errors = Partial<Record<keyof EventFormValues | 'form', string>>

/** A new event defaults to tomorrow's lunch meeting in the usual room. */
export function blankEvent(now = new Date()): EventFormValues {
  const day = toClubLocalInput(new Date(now.getTime() + 24 * 60 * 60 * 1000)).slice(0, 10)
  return {
    title: '',
    description: '',
    startsAt: `${day}T12:30`,
    endsAt: `${day}T13:15`,
    location: "Mr. Derrick's classroom",
    tags: ['meeting'],
    coverKey: null,
  }
}

/** Create or edit an event. Times are entered in the club's timezone (Pacific). */
export function EventFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Null to create. */
  editing: { id: string; values: EventFormValues } | null
  onSaved: (id: string) => void
}) {
  const uid = useId()
  const [values, setValues] = useState<EventFormValues>(editing?.values ?? blankEvent())
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (open) {
      setValues(editing?.values ?? blankEvent())
      setErrors({})
    }
  }, [open, editing])

  const set = <TKey extends keyof EventFormValues>(
    key: TKey,
    value: EventFormValues[TKey],
  ) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const tagOptions = [...new Set([...EVENT_TAGS, ...values.tags])]
  const toggleTag = (t: string) =>
    set(
      'tags',
      values.tags.includes(t) ? values.tags.filter((x) => x !== t) : [...values.tags, t],
    )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = eventFormSchema.safeParse(values)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof EventFormValues
        next[key] ??= issue.message
      }
      setErrors(next)
      return
    }
    setPending(true)
    try {
      const { id } = await saveEvent({ data: { id: editing?.id, values: parsed.data } })
      toast.success(editing ? 'Event updated.' : 'Event created.')
      onOpenChange(false)
      onSaved(id)
    } catch (err) {
      setErrors({ form: errorMessage(err, 'Could not save the event.') })
    } finally {
      setPending(false)
    }
  }

  const field = (key: keyof EventFormValues) => ({
    id: `${uid}-${key}`,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${uid}-${key}-error` : undefined,
  })
  const error = (key: keyof EventFormValues) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} role="alert" className="text-destructive text-sm">
        {errors[key]}
      </p>
    ) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit event' : 'New event'}</DialogTitle>
          <DialogDescription>
            Times are Pacific. Members get a reminder email a day before.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-title`}>Title</Label>
            <Input
              {...field('title')}
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Lunch meeting: intro to recursion"
              required
            />
            {error('title')}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${uid}-startsAt`}>Starts</Label>
              <Input
                {...field('startsAt')}
                type="datetime-local"
                value={values.startsAt}
                onChange={(e) => {
                  const startsAt = e.target.value
                  // Keep the same length when the start moves past the end.
                  if (startsAt && values.endsAt <= startsAt) {
                    const len =
                      Date.parse(`${values.endsAt}Z`) - Date.parse(`${values.startsAt}Z`)
                    const end = new Date(
                      Date.parse(`${startsAt}Z`) + (len > 0 ? len : 45 * 60_000),
                    )
                    set('endsAt', end.toISOString().slice(0, 16))
                  }
                  set('startsAt', startsAt)
                }}
                required
              />
              {error('startsAt')}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${uid}-endsAt`}>Ends</Label>
              <Input
                {...field('endsAt')}
                type="datetime-local"
                value={values.endsAt}
                min={values.startsAt}
                onChange={(e) => set('endsAt', e.target.value)}
                required
              />
              {error('endsAt')}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-location`}>Location</Label>
            <Input
              {...field('location')}
              value={values.location}
              onChange={(e) => set('location', e.target.value)}
              required
            />
            {error('location')}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-description`}>Description</Label>
            <Textarea
              {...field('description')}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              placeholder="What we'll do, what to bring."
            />
            {error('description')}
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Tags</legend>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((t) => {
                const on = values.tags.includes(t)
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTag(t)}
                    className={cn(
                      'focus-visible:ring-ring/50 h-8 cursor-pointer rounded-full px-3 text-sm ring-1 transition-colors outline-none focus-visible:ring-3',
                      on
                        ? 'bg-brand-sky ring-brand-sky font-medium text-[#0b0f15]'
                        : 'text-muted-foreground ring-border hover:text-foreground',
                    )}
                  >
                    {tagLabel(t)}
                  </button>
                )
              })}
            </div>
            {errors.tags && (
              <p role="alert" className="text-destructive text-sm">
                {errors.tags}
              </p>
            )}
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Cover image (optional)</span>
            <ImageUpload
              value={values.coverKey}
              onChange={(key) => set('coverKey', key)}
              purpose="event"
              label="Upload a cover"
              aspect="aspect-[2/1]"
            />
          </div>

          {errors.form && (
            <p role="alert" className="text-destructive text-sm">
              {errors.form}
            </p>
          )}
          <DialogFooter>
            <RaisedButton
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </RaisedButton>
            <RaisedButton type="submit" loading={pending} loadingText="Saving">
              {editing ? 'Save changes' : 'Create event'}
            </RaisedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
