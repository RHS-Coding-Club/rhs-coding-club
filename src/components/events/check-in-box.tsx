import { useId, useRef, useState } from 'react'
import { QrCode } from 'lucide-react'
import { checkInToEvent } from '#/server/events'
import type { CheckInResult } from '#/services/events'
import { fmtDate } from '#/lib/format'
import { CODE_LENGTH, normalizeCode } from '#/lib/events'
import { cn } from '#/lib/utils'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useSpark } from '#/components/spark'
import { errorMessage } from './rsvp'

/** Human copy for every way a check-in can be refused. */
export function checkInProblem(result: CheckInResult): string | null {
  switch (result.status) {
    case 'checked-in':
    case 'already':
      return null
    case 'not-found':
      return 'That event no longer exists.'
    case 'guest':
      return 'Check-in is for club members. Apply to join and an officer will approve you.'
    case 'closed':
      return 'Check-in is not open right now. Officers open it at the start of the event.'
    case 'early':
      return `Too early. Check-in opens at ${fmtDate(result.opensAt, 'time')}.`
    case 'late':
      return 'Check-in for this event has closed. If you were there, ask an officer to mark you present.'
    case 'wrong-code':
      return "That code didn't match. Check the projector and try again."
  }
}

/**
 * The code field on the event page (and the fallback on the check-in page).
 * Same server function as the QR link.
 */
export function CheckInBox({
  eventId,
  onResult,
  defaultCode = '',
  className,
  autoFocus,
}: {
  eventId: string
  onResult: (result: CheckInResult) => void
  defaultCode?: string
  className?: string
  autoFocus?: boolean
}) {
  const id = useId()
  const [code, setCode] = useState(defaultCode)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const ready = normalizeCode(code).length === CODE_LENGTH
  const spark = useSpark()
  const button = useRef<HTMLButtonElement>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) {
      setError(`Codes are ${CODE_LENGTH} characters.`)
      return
    }
    setError(null)
    setPending(true)
    try {
      const result = await checkInToEvent({ data: { eventId, code } })
      const problem = checkInProblem(result)
      if (problem) setError(problem)
      else if (result.status === 'checked-in') spark(button.current)
      onResult(result)
    } catch (err) {
      setError(errorMessage(err, 'Could not check you in. Try again.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn('flex flex-col gap-3', className)} noValidate>
      <Label htmlFor={`${id}-code`}>Check-in code</Label>
      <div className="flex gap-2">
        <Input
          id={`${id}-code`}
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={CODE_LENGTH + 2}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
          className="h-12 min-w-0 flex-1 text-center font-mono text-xl tracking-[0.35em] uppercase placeholder:tracking-[0.35em] placeholder:opacity-40"
        />
        <RaisedButton
          ref={button}
          type="submit"
          size="xl"
          loading={pending}
          loadingText="Checking"
        >
          Check in
        </RaisedButton>
      </div>
      <p
        id={`${id}-hint`}
        className="text-muted-foreground flex items-center gap-2 text-sm"
      >
        <QrCode className="size-4 shrink-0" aria-hidden="true" />
        Or scan the QR code on the projector.
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </form>
  )
}
