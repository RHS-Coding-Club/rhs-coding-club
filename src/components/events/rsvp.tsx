import { useId, useOptimistic, useRef, useTransition } from 'react'
import type { KeyboardEvent } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Check, CircleHelp, LogIn, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { rsvpToEvent } from '#/server/events'
import type { RsvpChoice } from '#/lib/schemas/events'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import { cn } from '#/lib/utils'
import { RaisedButton } from '#/components/raised-button'
import type { Face } from './parts'

const CHOICES: { value: RsvpChoice; label: string; short: string; icon: typeof Check }[] =
  [
    { value: 'yes', label: 'Going', short: 'Going', icon: Check },
    { value: 'maybe', label: 'Maybe', short: 'Maybe', icon: CircleHelp },
    { value: 'no', label: "Can't make it", short: "Can't", icon: X },
  ]

const CONFIRM: Record<RsvpChoice, string> = {
  yes: "You're going. See you there.",
  maybe: 'Marked as maybe.',
  no: 'Got it. Maybe next time.',
}

export function errorMessage(
  err: unknown,
  fallback = 'Something went wrong. Try again.',
) {
  if (err instanceof Error) {
    if (err.message === 'UNAUTHORIZED') return 'Sign in first.'
    if (err.message === 'FORBIDDEN') return 'Only club members can do that.'
    return err.message || fallback
  }
  return fallback
}

/**
 * Optimistic RSVP: the choice shows instantly, the server write runs in a
 * transition, and the loader refreshes the counts before the transition
 * ends, so the optimistic value hands over to saved data without a flicker. A failed write snaps
 * back to the saved answer and explains why.
 */
export function useRsvp(eventId: string, saved: RsvpChoice | null) {
  const router = useRouter()
  const [status, setOptimistic] = useOptimistic(saved)
  const [pending, startTransition] = useTransition()

  const choose = (next: RsvpChoice) => {
    if (next === status) return
    startTransition(async () => {
      setOptimistic(next)
      try {
        await rsvpToEvent({ data: { eventId, status: next } })
        // Saved: confirm now, not after the refresh below.
        toast.success(CONFIRM[next])
        // `sync` waits for the reloaded data to be on screen. Without it the
        // router keeps the old data while refetching in the background, so
        // the transition ended (and the optimistic choice let go) while the
        // page still showed the previous RSVP: the buttons and the going
        // count snapped back for a moment, then forward again.
        await router.invalidate({ sync: true })
      } catch (err) {
        toast.error(errorMessage(err, 'Could not save your RSVP.'))
      }
    })
  }
  return { status, choose, pending }
}

/** Going count and faces adjusted for the viewer's optimistic choice. */
export function optimisticGoing(
  base: { count: number; faces: Face[] },
  saved: RsvpChoice | null,
  current: RsvpChoice | null,
  me: Face | null,
) {
  if (!me || saved === current) return base
  const wasGoing = saved === 'yes'
  const isGoing = current === 'yes'
  if (wasGoing === isGoing) return base
  return isGoing
    ? { count: base.count + 1, faces: [...base.faces.filter((f) => f.id !== me.id), me] }
    : {
        count: Math.max(0, base.count - 1),
        faces: base.faces.filter((f) => f.id !== me.id),
      }
}

/** The three-way segmented control. Arrow keys move between choices. */
export function RsvpSegments({
  status,
  onChoose,
  size = 'md',
  className,
  label = 'Your RSVP',
}: {
  status: RsvpChoice | null
  onChoose: (s: RsvpChoice) => void
  size?: 'sm' | 'md'
  className?: string
  label?: string
}) {
  const reduced = useReducedMotion()
  const layoutId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const focusIndex = Math.max(
    0,
    CHOICES.findIndex((c) => c.value === status),
  )

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + CHOICES.length) % CHOICES.length
    refs.current[next]?.focus()
    onChoose(CHOICES[next].value)
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'bg-muted/70 ring-border/70 inline-grid grid-cols-3 gap-1 rounded-2xl p-1 ring-1',
        className,
      )}
    >
      {CHOICES.map((c, i) => {
        const active = status === c.value
        const Icon = c.icon
        return (
          <button
            key={c.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            // Picking "Going" bursts the root spark (SparkRoot).
            data-spark={c.value === 'yes' && !active ? '' : undefined}
            tabIndex={i === focusIndex ? 0 : -1}
            onClick={() => onChoose(c.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'focus-visible:ring-ring/50 relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3',
              size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3.5 text-sm',
              active
                ? c.value === 'yes'
                  ? 'text-[#0b0f15]'
                  : 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 rounded-xl shadow-sm',
                  c.value === 'yes' ? 'bg-brand-sky' : 'bg-card ring-border/80 ring-1',
                )}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: 'spring', bounce: 0.15, duration: 0.4 }
                }
              />
            )}
            <Icon className="relative size-4 shrink-0" aria-hidden="true" />
            <span className="relative">
              <span className={cn(size === 'sm' && 'hidden sm:inline')}>{c.label}</span>
              {size === 'sm' && <span className="sm:hidden">{c.short}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Who may RSVP: members see the control; guests get the apply CTA; visitors
 * get a sign-in link that comes back here.
 */
export function RsvpGate({
  role,
  redirectTo,
  ended,
  children,
  compact = false,
}: {
  role: Role | null
  redirectTo: string
  ended: boolean
  children: React.ReactNode
  compact?: boolean
}) {
  if (ended) {
    return (
      <p className="text-muted-foreground text-sm">
        RSVPs are closed. This event has ended.
      </p>
    )
  }
  if (!role) {
    return (
      <div className={cn('flex flex-wrap items-center gap-3', compact && 'gap-2')}>
        <RaisedButton asChild variant="primary" size={compact ? 'md' : 'lg'}>
          <Link to="/login" search={{ redirect: redirectTo }}>
            <LogIn aria-hidden="true" />
            Sign in to RSVP
          </Link>
        </RaisedButton>
        {!compact && (
          <p className="text-muted-foreground text-sm">Members RSVP with one tap.</p>
        )}
      </div>
    )
  }
  if (!hasRole(role, 'member')) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <RaisedButton asChild variant="primary" size={compact ? 'md' : 'lg'}>
          <Link to="/join">Apply to join</Link>
        </RaisedButton>
        <p className="text-muted-foreground text-sm">
          RSVPs open once an officer approves your membership.
        </p>
      </div>
    )
  }
  return <>{children}</>
}
