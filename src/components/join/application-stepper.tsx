import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import Stepper, { Step } from '#/components/bits/Stepper'
import { fieldErrors, serverMessage } from '#/components/account/form-helpers'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Textarea } from '#/components/ui/textarea'
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_LEVELS,
  GRADES,
  GRADE_LABEL,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  applicationSteps,
} from '#/lib/schemas/membership'
import type { ApplicationInput } from '#/lib/schemas/membership'
import { cn } from '#/lib/utils'
import { applyForMembership } from '#/server/membership'
import { ChipGroup } from './chip-group'

const EMPTY: ApplicationInput = {
  grade: '' as ApplicationInput['grade'],
  experience: '' as ApplicationInput['experience'],
  languages: [],
  interests: [],
  goals: '',
  whyJoin: '',
  availability: [],
  githubUsername: '',
}

const TITLES = ['About you', 'What you’re into', 'In your words', 'When you’re free']

/**
 * The membership application as React Bits Stepper: four short steps, each
 * validated with its slice of the server's schema before moving on. The
 * Stepper is controlled; our own buttons drive it so a step can refuse.
 */
export function ApplicationStepper({
  dark,
  defaults,
}: {
  dark: boolean
  defaults?: Partial<ApplicationInput>
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [values, setValues] = useState<ApplicationInput>({ ...EMPTY, ...defaults })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const total = applicationSteps.length

  const set = <TKey extends keyof ApplicationInput>(
    key: TKey,
    v: ApplicationInput[TKey],
  ) => {
    setValues((prev) => ({ ...prev, [key]: v }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  /** Validates steps from the current one up to (not including) `target`. */
  const validUpTo = (target: number) => {
    for (let i = 1; i < target; i++) {
      const r = applicationSteps[i - 1].safeParse(values)
      if (!r.success) {
        setErrors(fieldErrors(r.error))
        setStep(i)
        return false
      }
    }
    setErrors({})
    return true
  }

  const goTo = (target: number) => {
    if (target <= step || validUpTo(target)) setStep(target)
  }

  async function submit() {
    if (!validUpTo(total + 1)) return
    setPending(true)
    setFormError(null)
    try {
      await applyForMembership({ data: values })
      toast.success('Application sent. An officer will review it soon.')
      await router.invalidate()
    } catch (err) {
      setFormError(serverMessage(err))
    } finally {
      setPending(false)
    }
  }

  const err = (key: string) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="text-destructive mt-2 text-sm">
        {errors[key]}
      </p>
    ) : null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (step < total) goTo(step + 1)
        else void submit()
      }}
      noValidate
    >
      <Stepper
        step={step}
        onStepChange={goTo}
        linear
        showFooter={false}
        theme={dark ? 'dark' : 'light'}
        accentColor="#5fb2ee"
        width="100%"
        radius={28}
        className="mx-auto"
        contentClassName="pt-6"
      >
        <Step title={TITLES[0]}>
          <StepHeading n={1} title="About you" hint="Every RHS grade is welcome." />
          <fieldset>
            <legend className="mb-3 text-sm font-medium">Grade</legend>
            <RadioGroup
              value={values.grade}
              onValueChange={(v) => set('grade', v as ApplicationInput['grade'])}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              aria-describedby={errors.grade ? 'grade-error' : undefined}
            >
              {GRADES.map((g) => (
                <OptionCard
                  key={g}
                  id={`grade-${g}`}
                  value={g}
                  checked={values.grade === g}
                >
                  <span className="text-2xl font-semibold tracking-tight">{g}th</span>
                  <span className="text-muted-foreground text-xs">{GRADE_LABEL[g]}</span>
                </OptionCard>
              ))}
            </RadioGroup>
            {err('grade')}
          </fieldset>
          <fieldset className="mt-7">
            <legend className="mb-3 text-sm font-medium">Coding experience</legend>
            <RadioGroup
              value={values.experience}
              onValueChange={(v) =>
                set('experience', v as ApplicationInput['experience'])
              }
              className="grid gap-2 sm:grid-cols-2"
              aria-describedby={errors.experience ? 'experience-error' : undefined}
            >
              {EXPERIENCE_LEVELS.map((x) => (
                <OptionCard
                  key={x.value}
                  id={`exp-${x.value}`}
                  value={x.value}
                  checked={values.experience === x.value}
                >
                  <span className="font-medium">{x.label}</span>
                  <span className="text-muted-foreground text-xs">{x.hint}</span>
                </OptionCard>
              ))}
            </RadioGroup>
            {err('experience')}
          </fieldset>
        </Step>

        <Step title={TITLES[1]}>
          <StepHeading
            n={2}
            title="What you’re into"
            hint="Pick as many as you like. This helps officers pair you up."
          />
          <ChipGroup
            label="Languages you’ve used"
            options={LANGUAGE_OPTIONS}
            value={values.languages}
            onChange={(v) => set('languages', v)}
            error={errors.languages}
            errorId="languages-error"
          />
          <ChipGroup
            className="mt-7"
            label="What you want to do in the club"
            options={INTEREST_OPTIONS}
            value={values.interests}
            onChange={(v) => set('interests', v)}
            error={errors.interests}
            errorId="interests-error"
          />
        </Step>

        <Step title={TITLES[2]}>
          <StepHeading
            n={3}
            title="In your words"
            hint="A few honest sentences beat a polished essay."
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goals">What do you want to build or learn this year?</Label>
            <Textarea
              id="goals"
              rows={3}
              value={values.goals}
              onChange={(e) => set('goals', e.target.value)}
              placeholder="A game for the H2O hackathon, enough Python to pass AP CSP, my first website…"
              aria-invalid={Boolean(errors.goals)}
              aria-describedby={errors.goals ? 'goals-error' : undefined}
            />
            {err('goals')}
          </div>
          <div className="mt-6 flex flex-col gap-1.5">
            <Label htmlFor="whyJoin">Why do you want to join?</Label>
            <Textarea
              id="whyJoin"
              rows={3}
              value={values.whyJoin}
              onChange={(e) => set('whyJoin', e.target.value)}
              placeholder="Friends in the club, teaching kids at RAP, wanting to get better…"
              aria-invalid={Boolean(errors.whyJoin)}
              aria-describedby={errors.whyJoin ? 'whyJoin-error' : undefined}
            />
            {err('whyJoin')}
          </div>
        </Step>

        <Step title={TITLES[3]}>
          <StepHeading
            n={4}
            title="When you’re free"
            hint="We meet at lunch in Mr. Derrick’s classroom. RAP is after school at Ripon Elementary."
          />
          <ChipGroup
            label="When can you usually make it?"
            options={AVAILABILITY_OPTIONS}
            value={values.availability}
            onChange={(v) => set('availability', v)}
            error={errors.availability}
            errorId="availability-error"
          />
          <div className="mt-7 flex flex-col gap-1.5">
            <Label htmlFor="githubUsername">
              GitHub username{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="githubUsername"
              value={values.githubUsername}
              onChange={(e) => set('githubUsername', e.target.value)}
              placeholder="octocat"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="font-mono"
              aria-invalid={Boolean(errors.githubUsername)}
              aria-describedby={
                errors.githubUsername ? 'githubUsername-error' : 'githubUsername-hint'
              }
            />
            <p id="githubUsername-hint" className="text-muted-foreground text-xs">
              No account yet? Skip it; you can add one later for an invite to the club’s
              GitHub org.
            </p>
            {err('githubUsername')}
          </div>
        </Step>
      </Stepper>

      {formError && (
        <p role="alert" className="text-destructive mt-4 text-center text-sm">
          {formError}
        </p>
      )}
      <div className="mt-6 flex items-center justify-between gap-3">
        <RaisedButton
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className={cn(step === 1 && 'invisible')}
        >
          <ArrowLeft />
          Back
        </RaisedButton>
        <span className="text-muted-foreground font-mono text-xs" aria-live="polite">
          Step {step} of {total}
        </span>
        {step < total ? (
          <RaisedButton type="submit">
            Continue
            <ArrowRight />
          </RaisedButton>
        ) : (
          <RaisedButton type="submit" loading={pending} loadingText="Sending…">
            Send application
            <Check />
          </RaisedButton>
        )}
      </div>
    </form>
  )
}

function StepHeading({ n, title, hint }: { n: number; title: string; hint: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-[-0.03em]" id={`step-${n}-title`}>
        {title}
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
    </div>
  )
}

function OptionCard({
  id,
  value,
  checked,
  children,
}: {
  id: string
  value: string
  checked: boolean
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 transition-colors',
        checked ? 'bg-brand-sky/10 ring-brand-sky' : 'ring-border hover:bg-muted/50',
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <span className="flex flex-col gap-0.5">{children}</span>
    </label>
  )
}
