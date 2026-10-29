import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { RichTextEditor } from '#/components/rich-text/editor'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { CLUB_TIMEZONE, fmtDate } from '#/lib/format'
import { EMPTY_DOC_JSON } from '#/lib/rich-text'
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_LEVELS,
  challengeFormSchema,
  challengeState,
  fromClubWallTime,
  toClubWallTime,
} from '#/lib/schemas/challenges'
import type { DifficultyLevel, PublishMode } from '#/lib/schemas/challenges'
import { cn } from '#/lib/utils'
import { saveChallenge } from '#/server/challenges'
import { DIFFICULTY_DOT } from './meta'

export interface ChallengeFormValues {
  id?: string
  title: string
  description: string
  prompt: string
  difficulty: DifficultyLevel
  points: number
  weekNo: number
  sampleInput: string | null
  sampleOutput: string | null
  publishedAt: Date | null
}

type Field =
  | 'title'
  | 'description'
  | 'prompt'
  | 'points'
  | 'weekNo'
  | 'sampleInput'
  | 'sampleOutput'
  | 'publishAt'

/**
 * Create or edit a challenge. Picking a difficulty fills in that
 * difficulty's points from settings (still editable). Publishing is a
 * three-way choice: draft, live now, or scheduled for a time in the club's
 * timezone, whatever timezone the officer's laptop is in.
 */
export function ChallengeForm({
  initial,
  pointsByDifficulty,
  solves = 0,
}: {
  initial: ChallengeFormValues
  pointsByDifficulty: Record<DifficultyLevel, number>
  /** Passed submissions so far (edit only), for the points warning. */
  solves?: number
}) {
  const router = useRouter()
  const save = useServerFn(saveChallenge)
  const now = new Date()
  const initialState = challengeState(initial.publishedAt, now)

  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [prompt, setPrompt] = useState(initial.prompt || EMPTY_DOC_JSON)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initial.difficulty)
  const [points, setPoints] = useState(String(initial.points))
  const [weekNo, setWeekNo] = useState(String(initial.weekNo))
  const [sampleInput, setSampleInput] = useState(initial.sampleInput ?? '')
  const [sampleOutput, setSampleOutput] = useState(initial.sampleOutput ?? '')
  const [mode, setMode] = useState<PublishMode>(
    initialState === 'draft' ? 'draft' : initialState === 'live' ? 'now' : 'schedule',
  )
  const [publishAt, setPublishAt] = useState(
    initial.publishedAt && initialState === 'scheduled'
      ? toClubWallTime(initial.publishedAt)
      : toClubWallTime(nextMondayMorning(now)),
  )
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const pointsChanged = initial.id && Number(points) !== initial.points
  const scheduledAt = mode === 'schedule' ? fromClubWallTime(publishAt) : null

  function pickDifficulty(next: string) {
    if (!next) return
    const d = next as DifficultyLevel
    setDifficulty(d)
    setPoints(String(pointsByDifficulty[d]))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = challengeFormSchema.safeParse({
      id: initial.id,
      title,
      description,
      prompt,
      difficulty,
      points: points === '' ? Number.NaN : Number(points),
      weekNo: weekNo === '' ? Number.NaN : Number(weekNo),
      sampleInput,
      sampleOutput,
      publishMode: mode,
      publishAt: mode === 'schedule' ? publishAt : undefined,
    })
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field
        next[key] ??= issue.message
      }
      setErrors(next)
      setFormError('Fix the highlighted fields.')
      return
    }
    if (mode === 'schedule' && scheduledAt && scheduledAt <= new Date()) {
      setErrors({ publishAt: 'That time has passed. Pick a later one, or publish now.' })
      return
    }
    setErrors({})
    setPending(true)
    try {
      const res = await save({ data: parsed.data })
      toast.success(initial.id ? 'Challenge saved' : 'Challenge created', {
        description:
          res.state === 'live'
            ? res.announced
              ? 'It is live, and members were emailed.'
              : 'It is live.'
            : res.state === 'scheduled'
              ? 'Scheduled. Members get an email when it goes live.'
              : 'Saved as a draft.',
      })
      await router.invalidate()
      await router.navigate({ to: '/admin/challenges' })
    } catch (err) {
      setFormError(err instanceof Error && err.message ? err.message : 'Could not save.')
    } finally {
      setPending(false)
    }
  }

  const err = (k: Field) =>
    errors[k] ? (
      <p id={`${k}-error`} role="alert" className="text-destructive text-xs">
        {errors[k]}
      </p>
    ) : null
  const describedBy = (k: Field) => (errors[k] ? `${k}-error` : undefined)

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ch-title">Title</Label>
          <Input
            id="ch-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Two sum, the lunch line edition"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={describedBy('title')}
          />
          {err('title')}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ch-summary">One-line summary</Label>
          <Input
            id="ch-summary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Shown on the challenge list and in the announcement email."
            aria-invalid={Boolean(errors.description)}
            aria-describedby={describedBy('description')}
          />
          <div className="flex justify-between gap-3">
            {err('description') ?? <span />}
            <span className="text-muted-foreground tabular font-mono text-[11px]">
              {description.length}/200
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ch-prompt">Prompt</Label>
          <RichTextEditor
            id="ch-prompt"
            value={prompt}
            onChange={setPrompt}
            imagePurpose="post"
            placeholder="Explain the problem, the rules, and any constraints. Code blocks are welcome."
            aria-invalid={Boolean(errors.prompt)}
          />
          {err('prompt')}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ch-in">
              Sample input <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="ch-in"
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              spellCheck={false}
              className="min-h-28 font-mono text-[13px] md:text-[13px]"
              aria-invalid={Boolean(errors.sampleInput)}
              aria-describedby={describedBy('sampleInput')}
            />
            {err('sampleInput')}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ch-out">
              Expected output <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="ch-out"
              value={sampleOutput}
              onChange={(e) => setSampleOutput(e.target.value)}
              spellCheck={false}
              className="min-h-28 font-mono text-[13px] md:text-[13px]"
              aria-invalid={Boolean(errors.sampleOutput)}
              aria-describedby={describedBy('sampleOutput')}
            />
            {err('sampleOutput')}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <fieldset className="bg-card border-border flex flex-col gap-4 rounded-lg border p-4">
          <legend className="sr-only">Scoring</legend>
          <div className="flex flex-col gap-2">
            <span id="ch-difficulty" className="text-sm font-medium">
              Difficulty
            </span>
            <ToggleGroup
              type="single"
              variant="outline"
              value={difficulty}
              onValueChange={pickDifficulty}
              aria-labelledby="ch-difficulty"
              className="w-full"
            >
              {DIFFICULTY_LEVELS.map((d) => (
                <ToggleGroupItem key={d} value={d} className="flex-1 gap-1.5">
                  <span
                    aria-hidden="true"
                    className={cn('size-1.5 rounded-full', DIFFICULTY_DOT[d])}
                  />
                  {DIFFICULTY_LABEL[d]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ch-points">Points</Label>
              <Input
                id="ch-points"
                type="number"
                inputMode="numeric"
                min={0}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="tabular font-mono"
                aria-invalid={Boolean(errors.points)}
                aria-describedby={describedBy('points')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ch-week">Week</Label>
              <Input
                id="ch-week"
                type="number"
                inputMode="numeric"
                min={1}
                value={weekNo}
                onChange={(e) => setWeekNo(e.target.value)}
                className="tabular font-mono"
                aria-invalid={Boolean(errors.weekNo)}
                aria-describedby={describedBy('weekNo')}
              />
            </div>
          </div>
          {err('points')}
          {err('weekNo')}
          {initial.id && (
            <p
              className={cn(
                'flex gap-2 text-xs leading-relaxed',
                pointsChanged ? 'text-warning' : 'text-muted-foreground',
              )}
            >
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>
                Changing points only affects reviews from now on.
                {solves > 0
                  ? ` The ${solves} ${solves === 1 ? 'member who already passed keeps' : 'members who already passed keep'} what they earned.`
                  : ' Passes already granted are not re-settled.'}
              </span>
            </p>
          )}
        </fieldset>

        <fieldset className="bg-card border-border flex flex-col gap-3 rounded-lg border p-4">
          <legend className="float-left mb-1 text-sm font-medium">Publishing</legend>
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as PublishMode)}
            className="clear-left gap-2.5"
          >
            <PublishOption value="draft" label="Draft" hint="Only officers can see it." />
            <PublishOption
              value="now"
              label={initialState === 'live' ? 'Live' : 'Publish now'}
              hint={
                initialState === 'live' && initial.publishedAt
                  ? `Live since ${fmtDate(initial.publishedAt, 'datetime')}.`
                  : 'Goes live on save and emails members.'
              }
            />
            <PublishOption
              value="schedule"
              label="Schedule"
              hint="Goes live at a set time, then emails members."
            />
          </RadioGroup>
          {mode === 'schedule' && (
            <div className="flex flex-col gap-1.5 pl-6">
              <Label htmlFor="ch-at" className="text-xs">
                Go live at (Pacific time)
              </Label>
              <Input
                id="ch-at"
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="tabular font-mono text-sm"
                aria-invalid={Boolean(errors.publishAt)}
                aria-describedby={describedBy('publishAt') ?? 'ch-at-hint'}
              />
              {err('publishAt') ?? (
                <p id="ch-at-hint" className="text-muted-foreground text-xs">
                  {scheduledAt
                    ? `${fmtDate(scheduledAt, 'datetime')} in ${CLUB_TIMEZONE.replace('_', ' ')}.`
                    : 'Pick a date and time.'}
                </p>
              )}
            </div>
          )}
        </fieldset>

        {formError && (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        )}
        <div className="flex gap-2">
          <RaisedButton
            type="submit"
            className="flex-1"
            loading={pending}
            loadingText="Saving"
          >
            {initial.id ? 'Save changes' : 'Create challenge'}
          </RaisedButton>
          <RaisedButton asChild variant="outline">
            <Link to="/admin/challenges">Cancel</Link>
          </RaisedButton>
        </div>
      </div>
    </form>
  )
}

function PublishOption({
  value,
  label,
  hint,
}: {
  value: PublishMode
  label: string
  hint: string
}) {
  const id = `publish-${value}`
  return (
    <div className="flex items-start gap-2.5">
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <Label htmlFor={id} className="flex flex-col items-start gap-0.5 font-normal">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-xs">{hint}</span>
      </Label>
    </div>
  )
}

/** Default schedule slot: next Monday, 7:00 AM club time. */
function nextMondayMorning(now: Date): Date {
  const wall = toClubWallTime(now)
  const [y, m, d] = wall.slice(0, 10).split('-').map(Number)
  const today = new Date(Date.UTC(y, m - 1, d))
  const add = (8 - today.getUTCDay()) % 7 || 7
  today.setUTCDate(today.getUTCDate() + add)
  const iso = today.toISOString().slice(0, 10)
  return fromClubWallTime(`${iso}T07:00`) ?? now
}
