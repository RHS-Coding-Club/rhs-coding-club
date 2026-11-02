import { useState } from 'react'
import { LEVELS, LEVEL_LABEL, parseTags } from '#/lib/schemas/resources'
import type { Level } from '#/lib/schemas/resources'
import type { FieldErrors } from '#/lib/schemas/community'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'

export interface ResourceFormValues {
  title: string
  url: string
  description: string
  level: Level
  tags: string[]
}

export const EMPTY_RESOURCE: ResourceFormValues = {
  title: '',
  url: '',
  description: '',
  level: 'beginner',
  tags: [],
}

/** Reads the shared resource fields out of a submitted form. */
export function readResourceForm(form: HTMLFormElement): ResourceFormValues {
  const f = new FormData(form)
  return {
    title: String(f.get('title') ?? ''),
    url: String(f.get('url') ?? ''),
    description: String(f.get('description') ?? ''),
    level: String(f.get('level') ?? 'beginner') as Level,
    tags: parseTags(String(f.get('tags') ?? '')),
  }
}

/**
 * The fields of a resource (title, link, level, description, tags), shared by
 * the member "Suggest a resource" dialog and the officer editor. Uncontrolled;
 * read with `readResourceForm`.
 */
export function ResourceFields({
  initial = EMPTY_RESOURCE,
  errors,
  idPrefix = 'resource',
}: {
  initial?: ResourceFormValues
  errors: FieldErrors
  idPrefix?: string
}) {
  const [level, setLevel] = useState<Level>(initial.level)
  const id = (name: string) => `${idPrefix}-${name}`
  const err = (name: string) =>
    errors[name] ? (
      <p id={id(`${name}-error`)} role="alert" className="text-destructive text-sm">
        {errors[name]}
      </p>
    ) : null
  const aria = (name: string) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? id(`${name}-error`) : undefined,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('title')}>Title</Label>
        <Input
          id={id('title')}
          name="title"
          defaultValue={initial.title}
          placeholder="CS50's Introduction to Computer Science"
          required
          maxLength={120}
          {...aria('title')}
        />
        {err('title')}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('url')}>Link</Label>
        <Input
          id={id('url')}
          name="url"
          type="url"
          inputMode="url"
          defaultValue={initial.url}
          placeholder="https://"
          required
          {...aria('url')}
        />
        {err('url')}
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm leading-none font-medium">Level</legend>
        <RadioGroup
          name="level"
          value={level}
          onValueChange={(v) => setLevel(v as Level)}
          className="grid grid-cols-3 gap-2"
        >
          {LEVELS.map((l) => (
            <Label
              key={l}
              htmlFor={id(`level-${l}`)}
              className="border-border has-[[data-state=checked]]:border-brand-sky has-[[data-state=checked]]:bg-brand-sky/10 flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-normal"
            >
              <RadioGroupItem id={id(`level-${l}`)} value={l} />
              {LEVEL_LABEL[l]}
            </Label>
          ))}
        </RadioGroup>
        {err('level')}
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('description')}>What is it, and who is it for?</Label>
        <Textarea
          id={id('description')}
          name="description"
          defaultValue={initial.description}
          rows={3}
          maxLength={500}
          placeholder="Harvard's free intro course. Long, but the problem sets are worth it."
          required
          {...aria('description')}
        />
        {err('description')}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('tags')}>
          Tags{' '}
          <span className="text-muted-foreground font-normal">(comma separated)</span>
        </Label>
        <Input
          id={id('tags')}
          name="tags"
          defaultValue={initial.tags.join(', ')}
          placeholder="python, course"
          {...aria('tags')}
        />
        {err('tags')}
      </div>
    </div>
  )
}
