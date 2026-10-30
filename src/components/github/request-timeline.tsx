import { Check, X } from 'lucide-react'
import { fmtDate } from '#/lib/format'
import { requestTimeline } from '#/lib/schemas/github'
import type { RequestStatus, TimelineStep } from '#/lib/schemas/github'
import { cn } from '#/lib/utils'

/**
 * The request's progress as a vertical timeline: requested, approved, invite
 * sent, joined (or denied, with the officer's note). Done steps are filled,
 * the current one pulses (unless reduced motion), upcoming ones are hollow.
 */
export function RequestTimeline({
  request,
  currentHint,
}: {
  request: {
    status: RequestStatus
    createdAt: Date
    reviewedAt: Date | null
    inviteSentAt: Date | null
    joinedAt: Date | null
    adminNote: string | null
  }
  /** Line under the current step, e.g. "An officer reviews requests at lunch." */
  currentHint?: string
}) {
  const steps = requestTimeline(request)
  return (
    <ol className="relative flex flex-col">
      {steps.map((step, i) => (
        <Step
          key={step.key}
          step={step}
          last={i === steps.length - 1}
          hint={step.state === 'current' ? currentHint : undefined}
        />
      ))}
    </ol>
  )
}

function Step({
  step,
  last,
  hint,
}: {
  step: TimelineStep
  last: boolean
  hint?: string
}) {
  const done = step.state === 'done'
  const current = step.state === 'current'
  const denied = step.state === 'denied'
  return (
    <li
      className="relative flex gap-4 pb-8 last:pb-0"
      aria-current={current ? 'step' : undefined}
    >
      {!last && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full',
            done ? 'bg-brand-sky' : 'bg-border',
          )}
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          'relative grid size-8 shrink-0 place-items-center rounded-full',
          done && 'bg-brand-sky text-[#0b0f15]',
          current && 'bg-background ring-brand-sky ring-2',
          step.state === 'upcoming' && 'bg-background ring-border ring-2',
          denied && 'bg-destructive text-white dark:text-[#0b0f15]',
        )}
      >
        {done && <Check className="size-4" strokeWidth={3} />}
        {denied && <X className="size-4" strokeWidth={3} />}
        {current && (
          <>
            <span className="bg-brand-sky/40 absolute inset-0 rounded-full motion-safe:animate-ping" />
            <span className="bg-brand-sky relative size-2.5 rounded-full" />
          </>
        )}
      </span>
      <div className="min-w-0 pt-1">
        <p
          className={cn(
            'font-medium',
            step.state === 'upcoming' && 'text-muted-foreground',
            denied && 'text-destructive',
          )}
        >
          {step.label}
          <span className="sr-only">
            {done ? ' (done)' : current ? ' (in progress)' : denied ? '' : ' (not yet)'}
          </span>
        </p>
        {step.at && (done || denied) && (
          <p className="text-muted-foreground tabular mt-0.5 font-mono text-xs">
            {fmtDate(step.at, 'datetime')}
          </p>
        )}
        {step.detail && (
          <p
            className={cn(
              'mt-2 text-sm',
              denied
                ? 'bg-destructive/10 text-foreground rounded-xl px-3.5 py-2.5'
                : 'text-muted-foreground',
            )}
          >
            {step.detail}
          </p>
        )}
        {hint && <p className="text-muted-foreground mt-1 text-sm">{hint}</p>}
      </div>
    </li>
  )
}
