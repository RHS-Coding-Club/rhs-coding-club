import { Suspense, useEffect, useRef, useState } from 'react'
import { ClientOnly, Link, createFileRoute, redirect } from '@tanstack/react-router'
import {
  Award,
  CircleCheck,
  Clock,
  Lock,
  LoaderCircle,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { z } from 'zod'
import Counter from '#/components/bits/Counter'
import { checkInToEvent, getCheckIn } from '#/server/events'
import type { CheckInResult } from '#/services/events'
import { fmtEventWhen } from '#/lib/events'
import { fmtDate } from '#/lib/format'
import { hasRole } from '#/lib/roles'
import { EASE } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { ThreadsBackground } from '#/components/events/threads-bg'
import { CheckInBox, checkInProblem } from '#/components/events/check-in-box'
import { errorMessage } from '#/components/events/rsvp'

const searchSchema = z.object({ code: z.string().max(32).optional() })

export const Route = createFileRoute('/events/$id/check-in')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, location }) => {
    // UX only: the server function itself rejects anonymous callers.
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user: context.user }
  },
  loader: ({ params }) => getCheckIn({ data: { eventId: params.id } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Check in: ${loaderData.event.title} · RHS Coding Club`
          : 'Check in · RHS Coding Club',
      },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: CheckInPage,
})

type View =
  | { kind: 'pending' }
  | { kind: 'form' }
  | { kind: 'guest' }
  | { kind: 'result'; result: CheckInResult }

function CheckInPage() {
  const data = Route.useLoaderData()
  const { code } = Route.useSearch()
  const { user, theme } = Route.useRouteContext()
  const isMember = hasRole(user.role, 'member')
  const { event } = data

  const [view, setView] = useState<View>(() => {
    if (data.attendedAt) {
      return {
        kind: 'result',
        result: { status: 'already', event, markedAt: data.attendedAt },
      }
    }
    if (!isMember) return { kind: 'guest' }
    return code ? { kind: 'pending' } : { kind: 'form' }
  })
  const [error, setError] = useState<string | null>(null)

  // The QR link carries the code: submit it once, as soon as the page mounts.
  const started = useRef(false)
  useEffect(() => {
    if (view.kind !== 'pending' || started.current || !code) return
    started.current = true
    checkInToEvent({ data: { eventId: event.id, code } })
      .then((result) => setView({ kind: 'result', result }))
      .catch((err: unknown) => {
        setError(errorMessage(err, 'Could not check you in. Type the code instead.'))
        setView({ kind: 'form' })
      })
  }, [view.kind, code, event.id])

  return (
    <section className="px-2.5 pb-10">
      <div className="relative grid min-h-[calc(100dvh-var(--header-offset)-2.5rem)] place-items-center overflow-hidden rounded-4xl bg-stage px-4 py-14">
        <div aria-hidden="true" className="absolute inset-0">
          <ClientOnly>
            <Suspense>
              <ThreadsBackground initialDark={theme === 'dark'} seed={11} angle={8} />
            </Suspense>
          </ClientOnly>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_50%,rgba(243,246,251,0.9)_0%,rgba(243,246,251,0.35)_70%,rgba(243,246,251,0)_100%)] dark:bg-[radial-gradient(55%_60%_at_50%_50%,rgba(18,25,36,0.85)_0%,rgba(18,25,36,0.35)_70%,rgba(18,25,36,0)_100%)]"
        />

        <div className="bg-card/90 ring-border/70 relative w-full max-w-md rounded-4xl p-7 text-center shadow-(--bits-shadow) ring-1 backdrop-blur-md sm:p-9">
          <p className="text-muted-foreground text-sm">{event.title}</p>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {fmtEventWhen(event.startsAt, event.endsAt)}
          </p>
          <div className="mt-7">
            {view.kind === 'pending' && <Pending />}
            {view.kind === 'guest' && <Guest />}
            {view.kind === 'form' && (
              <div className="text-left">
                <h1 className="mb-2 text-center text-3xl font-semibold tracking-[-0.035em]">
                  Check in
                </h1>
                <p className="text-muted-foreground mb-6 text-center">
                  Type the code on the projector.
                </p>
                {error && (
                  <p role="alert" className="text-destructive mb-4 text-center text-sm">
                    {error}
                  </p>
                )}
                <CheckInBox
                  eventId={event.id}
                  defaultCode={code ?? ''}
                  autoFocus
                  onResult={(result) => {
                    if (!checkInProblem(result) || result.status === 'guest') {
                      setView({ kind: 'result', result })
                    }
                  }}
                />
              </div>
            )}
            {view.kind === 'result' && (
              <Result
                result={view.result}
                points={data.points}
                onRetry={() => {
                  setError(null)
                  setView({ kind: 'form' })
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Pending() {
  return (
    <div role="status" className="flex flex-col items-center gap-4 py-6">
      <LoaderCircle className="text-brand-sky size-10 animate-spin" aria-hidden="true" />
      <p className="text-lg font-medium">Checking you in</p>
    </div>
  )
}

function Guest() {
  return (
    <Problem
      icon={<Lock />}
      title="Members only"
      body="Check-in earns points for club members. Apply to join, and once an officer approves you, scan the code again."
    >
      <RaisedButton asChild size="lg">
        <Link to="/join">Apply to join</Link>
      </RaisedButton>
    </Problem>
  )
}

function Result({
  result,
  points,
  onRetry,
}: {
  result: CheckInResult
  points: number
  onRetry: () => void
}) {
  if (result.status === 'checked-in') return <Success result={result} />
  if (result.status === 'already') {
    return (
      <Problem
        icon={<CircleCheck />}
        tone="ok"
        title="You're already checked in"
        body={`We marked you present at ${fmtDate(result.markedAt, 'time')}. Your ${points} points are on the board.`}
      >
        <BackToEvent id={result.event.id} />
      </Problem>
    )
  }
  if (result.status === 'guest') return <Guest />
  if (result.status === 'not-found') {
    return (
      <Problem
        icon={<XCircle />}
        title="Event not found"
        body="That event no longer exists."
      >
        <RaisedButton asChild size="lg">
          <Link to="/events">See all events</Link>
        </RaisedButton>
      </Problem>
    )
  }

  const titles = {
    closed: 'Check-in is closed',
    early: 'Too early to check in',
    late: 'Check-in has ended',
    'wrong-code': "That code didn't match",
  } as const
  const icon =
    result.status === 'early' ? (
      <Clock />
    ) : result.status === 'wrong-code' ? (
      <ShieldAlert />
    ) : (
      <Lock />
    )
  return (
    <Problem
      icon={icon}
      title={titles[result.status]}
      body={checkInProblem(result) ?? ''}
    >
      {result.status === 'wrong-code' || result.status === 'closed' ? (
        <RaisedButton size="lg" onClick={onRetry}>
          Type the code
        </RaisedButton>
      ) : null}
      <BackToEvent id={result.event.id} variant="ghost" />
    </Problem>
  )
}

function BackToEvent({
  id,
  variant = 'outline',
}: {
  id: string
  variant?: 'outline' | 'ghost'
}) {
  return (
    <RaisedButton asChild size="lg" variant={variant}>
      <Link to="/events/$id" params={{ id }}>
        Back to the event
      </Link>
    </RaisedButton>
  )
}

function Problem({
  icon,
  title,
  body,
  tone = 'warn',
  children,
}: {
  icon: React.ReactNode
  title: string
  body: string
  tone?: 'warn' | 'ok'
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        aria-hidden="true"
        className={
          tone === 'ok'
            ? 'bg-brand-sky/15 text-brand-sky grid size-16 place-items-center rounded-full [&_svg]:size-8'
            : 'bg-muted text-foreground/70 grid size-16 place-items-center rounded-full [&_svg]:size-8'
        }
      >
        {icon}
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <p
        role={tone === 'warn' ? 'alert' : undefined}
        className="text-muted-foreground mt-3 text-balance"
      >
        {body}
      </p>
      {children && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * The payoff: a check mark that springs in with a ring of sky light, the
 * points rolling up on React Bits Counter, and any badge the check-in unlocked.
 */
function Success({
  result,
}: {
  result: Extract<CheckInResult, { status: 'checked-in' }>
}) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const t = window.setTimeout(() => setShown(result.points), reduced ? 0 : 450)
    return () => window.clearTimeout(t)
  }, [result.points, reduced])

  return (
    <div className="flex flex-col items-center" role="status">
      <div className="relative grid size-24 place-items-center">
        <>
          <motion.span
            aria-hidden="true"
            className="bg-brand-sky/30 absolute inset-0 rounded-full"
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          />
          <motion.span
            aria-hidden="true"
            className="bg-brand-sky/20 absolute inset-0 rounded-full"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
          />
        </>
        <motion.div
          className="bg-brand-sky relative grid size-24 place-items-center rounded-full text-[#0b0f15] shadow-[0_18px_40px_-12px_rgba(95,178,238,0.7)]"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.45, duration: 0.7 }}
        >
          <svg viewBox="0 0 24 24" className="size-12" fill="none" aria-hidden="true">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.25 }}
            />
          </svg>
        </motion.div>
      </div>

      <h1 className="mt-7 text-3xl font-semibold tracking-[-0.035em]">
        You're checked in
      </h1>
      <p className="text-muted-foreground mt-2">
        Thanks for coming. Points are on the board.
      </p>

      <div
        className="mt-6 flex items-baseline justify-center gap-2"
        aria-label={`${result.points} points earned`}
      >
        <span aria-hidden="true" className="text-brand-sky flex items-baseline">
          <span className="text-4xl font-semibold">+</span>
          <Counter
            value={shown}
            fontSize="3.5rem"
            fontWeight={600}
            stagger={0.08}
            duration={0.9}
            motionBlur
            className="tracking-[-0.04em]"
          />
        </span>
        <span aria-hidden="true" className="text-muted-foreground font-mono text-sm">
          points
        </span>
      </div>

      {result.badges.length > 0 && (
        <ul
          className="mt-6 flex flex-wrap justify-center gap-2"
          aria-label="Badges earned"
        >
          {result.badges.map((b) => (
            <li
              key={b.id}
              className="bg-brand-navy inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-[#e6edf5]"
            >
              <Award className="size-4" aria-hidden="true" />
              New badge: {b.name}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <RaisedButton asChild size="lg">
          <Link to="/events/$id" params={{ id: result.event.id }}>
            Back to the event
          </Link>
        </RaisedButton>
        <RaisedButton asChild size="lg" variant="ghost">
          <Link to="/leaderboard">Leaderboard</Link>
        </RaisedButton>
      </div>
    </div>
  )
}
