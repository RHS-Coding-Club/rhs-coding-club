import { Suspense, useEffect, useState } from 'react'
import { ClientOnly, Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Expand, Minimize, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import Counter from '#/components/bits/Counter'
import { getPresent, setCheckIn } from '#/server/events'
import type { PresentData } from '#/services/events'
import { fmtTimeRange } from '#/lib/events'
import { EASE } from '#/components/motion'
import { Logo } from '#/components/logo'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { QrCode } from '#/components/events/qr-code'
import { AeroShardsBackground } from '#/components/blog/aero-shards-bg'
import { errorMessage } from '#/components/events/rsvp'

export const Route = createFileRoute('/_admin/admin/events/$id/present')({
  loader: ({ params }) => getPresent({ data: { eventId: params.id } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Check in: ${loaderData.event.title} · RHS Coding Club`
          : 'Check in · RHS Coding Club',
      },
    ],
  }),
  component: PresentPage,
})

const POLL_MS = 5000

/**
 * The classroom projector: a huge QR and code, the event, and a live count
 * of who's checked in (polled every five seconds). Covers the whole window;
 * press F or the button for true fullscreen.
 */
function PresentPage() {
  const initial = Route.useLoaderData()
  const { id } = Route.useParams()
  const { theme } = Route.useRouteContext()
  const { data } = useQuery({
    queryKey: ['events', 'present', id],
    queryFn: () => getPresent({ data: { eventId: id } }),
    initialData: initial,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
    staleTime: 0,
  })
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && !(e.target instanceof HTMLInputElement))
        toggleFullscreen()
    }
    document.addEventListener('fullscreenchange', onChange)
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      document.removeEventListener('fullscreenchange', onChange)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const live = data.event.checkInOpen && !!data.checkInUrl

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#f3f6fb] text-[#101826] dark:bg-[#120f17] dark:text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`Check-in for ${data.event.title}`}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <ClientOnly>
          <Suspense>
            <AeroShardsBackground initialDark={theme === 'dark'} />
          </Suspense>
        </ClientOnly>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(243,246,251,0.95)_0%,rgba(243,246,251,0.7)_55%,rgba(243,246,251,0.4)_100%)] dark:bg-[linear-gradient(90deg,rgba(18,15,23,0.92)_0%,rgba(18,15,23,0.65)_55%,rgba(18,15,23,0.35)_100%)]"
      />

      <header className="relative flex items-center justify-between gap-4 px-6 pt-5 sm:px-10">
        <div className="flex items-center gap-3">
          <Logo className="size-8" />
          <span className="text-sm font-medium opacity-70">RHS Coding Club</span>
        </div>
        <div className="flex gap-2">
          <RaisedButton variant="ghost" size="sm" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize aria-hidden="true" /> : <Expand aria-hidden="true" />}
            {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </RaisedButton>
          <RaisedButton asChild variant="ghost" size="sm">
            <Link to="/admin/events/$id" params={{ id }}>
              <X aria-hidden="true" />
              Close
            </Link>
          </RaisedButton>
        </div>
      </header>

      <main className="relative grid flex-1 items-center gap-10 px-6 py-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:px-16">
        <div className="flex min-w-0 flex-col gap-8 lg:gap-12">
          <div>
            <p className="font-mono text-[clamp(0.9rem,1.4vw,1.25rem)] opacity-60">
              {fmtTimeRange(data.event.startsAt, data.event.endsAt)} ·{' '}
              {data.event.location}
            </p>
            <h1 className="mt-3 text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance">
              {data.event.title}
            </h1>
          </div>

          {live ? (
            <div>
              <p className="text-[clamp(1.1rem,1.8vw,1.6rem)] opacity-75">
                Scan the QR code. No camera? Open this event on{' '}
                <span className="font-mono font-medium opacity-100">{data.shortUrl}</span>{' '}
                and type
              </p>
              <CodeLetters code={data.event.checkInCode!} />
            </div>
          ) : (
            <ClosedNotice data={data} />
          )}

          <LiveCount data={data} />
        </div>

        {live && (
          <div className="justify-self-center rounded-[2rem] bg-white p-4 shadow-[0_40px_80px_-30px_rgba(16,24,38,0.45)] ring-1 ring-black/5 sm:p-5">
            <QrCode
              value={data.checkInUrl!}
              label={`QR code to check in to ${data.event.title}`}
              className="size-[min(62vh,40vw)] min-w-56 rounded-xl max-lg:size-[min(70vw,48vh)]"
            />
          </div>
        )}
      </main>
    </div>
  )
}

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen().catch(() => {})
}

function CodeLetters({ code }: { code: string }) {
  return (
    <p
      className="mt-4 flex gap-[clamp(0.35rem,0.8vw,0.75rem)]"
      aria-label={`Code ${code.split('').join(' ')}`}
    >
      {code.split('').map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="grid h-[clamp(4rem,9vw,8.5rem)] w-[clamp(3rem,6.6vw,6.25rem)] place-items-center rounded-[clamp(0.75rem,1.4vw,1.5rem)] bg-white font-mono text-[clamp(2.5rem,6vw,5.75rem)] font-semibold text-[#101826] shadow-[0_18px_40px_-24px_rgba(16,24,38,0.5)] ring-1 ring-black/5 dark:bg-white/8 dark:text-white dark:ring-white/12"
        >
          {ch}
        </span>
      ))}
    </p>
  )
}

function ClosedNotice({ data }: { data: PresentData }) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const open = async () => {
    setPending(true)
    try {
      await setCheckIn({ data: { eventId: data.event.id, open: true } })
      await queryClient.invalidateQueries({
        queryKey: ['events', 'present', data.event.id],
      })
      toast.success('Check-in is open.')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setPending(false)
    }
  }
  return (
    <div className="max-w-xl rounded-3xl bg-white/70 p-6 ring-1 ring-black/5 backdrop-blur dark:bg-white/5 dark:ring-white/10">
      <p className="text-2xl font-semibold tracking-tight">Check-in is closed</p>
      <p className="mt-2 opacity-70">
        Open it and the QR code and code appear here. Members can check in from an hour
        before the start until three hours after the end.
      </p>
      <RaisedButton
        size="lg"
        className="mt-5"
        onClick={() => void open()}
        loading={pending}
      >
        Open check-in
      </RaisedButton>
    </div>
  )
}

/** The count on React Bits Counter, with the newest arrivals popping in beside it. */
function LiveCount({ data }: { data: PresentData }) {
  const reduced = useReducedMotion()
  const recent = data.recent.slice(0, 8)
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <div className="flex items-baseline gap-3">
        <Counter
          value={data.count}
          fontSize="clamp(3.5rem, 7vw, 6.5rem)"
          fontWeight={600}
          stagger={0.06}
          motionBlur
          className="tracking-[-0.045em]"
        />
        <span className="text-[clamp(1rem,1.6vw,1.4rem)] opacity-70">
          checked in
          {data.going > 0 && <span className="opacity-70"> of {data.going} going</span>}
        </span>
      </div>
      <ul className="flex -space-x-2" aria-label="Latest check-ins">
        <AnimatePresence initial={false}>
          {recent.map((u) => (
            <motion.li
              key={u.id}
              layout={!reduced}
              initial={{ scale: 0.4, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              title={u.name}
            >
              <UserAvatar
                user={u}
                className="size-[clamp(2.5rem,3.6vw,3.5rem)] ring-4 ring-[#f3f6fb] dark:ring-[#120f17]"
              />
              <span className="sr-only">{u.name}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
