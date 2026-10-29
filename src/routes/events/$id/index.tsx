import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, CircleCheck, Clock, LogIn, MapPin, Radio, Users } from 'lucide-react'
import { toast } from 'sonner'
import TiltedCard from '#/components/bits/TiltedCard'
import { getEvent } from '#/server/events'
import type { CheckInResult } from '#/services/events'
import { checkInWindow, eventPhase, fmtEventWhen, fmtTimeRange } from '#/lib/events'
import { fmtDate } from '#/lib/format'
import { fileUrl } from '#/lib/files'
import { hasRole } from '#/lib/roles'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { ThreadsBackground } from '#/components/events/threads-bg'
import { AddToCalendar } from '#/components/events/add-to-calendar'
import { CheckInBox } from '#/components/events/check-in-box'
import { DateTile, FaceStack, TagList } from '#/components/events/parts'
import type { Face } from '#/components/events/parts'
import {
  RsvpGate,
  RsvpSegments,
  optimisticGoing,
  useRsvp,
} from '#/components/events/rsvp'
import { useIsDark } from '#/hooks/use-is-dark'

export const Route = createFileRoute('/events/$id/')({
  loader: ({ params }) => getEvent({ data: { eventId: params.id } }),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Event · RHS Coding Club' }] }
    const { event } = loaderData
    const title = `${event.title} · RHS Coding Club`
    const description =
      `${fmtEventWhen(event.startsAt, event.endsAt)} at ${event.location}. ${event.description}`
        .slice(0, 200)
        .trim()
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        ...(event.coverKey
          ? [
              {
                property: 'og:image',
                content: new URL(fileUrl(event.coverKey)!, loaderData.url).toString(),
              },
            ]
          : []),
      ],
    }
  },
  component: EventPage,
})

function EventPage() {
  const data = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const router = useRouter()
  const { event } = data
  const phase = eventPhase(event, data.now)
  const ended = phase === 'past'
  const href = `/events/${event.id}`
  const isMember = !!user && hasRole(user.role, 'member')

  const saved = data.viewer?.rsvp ?? null
  const rsvp = useRsvp(event.id, saved)
  const me: Face | null = user
    ? {
        id: user.id,
        name: user.name,
        image: user.image,
        avatarKey: user.avatarKey ?? null,
      }
    : null
  const going = optimisticGoing(
    { count: data.goingCount, faces: data.going },
    saved,
    rsvp.status,
    me,
  )

  const [fresh, setFresh] = useState<Extract<
    CheckInResult,
    { status: 'checked-in' }
  > | null>(null)
  const attendedAt = data.viewer?.attendedAt ?? null

  const onCheckIn = (result: CheckInResult) => {
    if (result.status === 'checked-in') {
      setFresh(result)
      toast.success(`Checked in. +${result.points} points.`)
      void router.invalidate()
    } else if (result.status === 'already') {
      void router.invalidate()
    }
  }

  return (
    <>
      <PageHero
        background={
          <ThreadsBackground initialDark={theme === 'dark'} seed={7} angle={-12} />
        }
        title={event.title}
        description={
          <span className="flex flex-col gap-2 text-base sm:text-lg">
            <span className="flex items-center gap-2.5">
              <Clock
                className="text-brand-sky size-[1.1em] shrink-0"
                aria-hidden="true"
              />
              {fmtEventWhen(event.startsAt, event.endsAt)}
            </span>
            <span className="flex items-center gap-2.5">
              <MapPin
                className="text-brand-sky size-[1.1em] shrink-0"
                aria-hidden="true"
              />
              {event.location}
            </span>
          </span>
        }
        actions={
          <>
            {!ended && <AddToCalendar event={event} url={data.url} />}
            <RaisedButton asChild variant="ghost" size="lg">
              <Link to="/events">
                <ArrowLeft aria-hidden="true" />
                All events
              </Link>
            </RaisedButton>
          </>
        }
        aside={<Cover event={event} initialDark={theme === 'dark'} />}
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-(--gutter) py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-28 lg:col-start-2 lg:row-start-1">
          {(attendedAt || fresh) && (
            <Panel tone="success">
              <div className="flex items-start gap-3">
                <CircleCheck
                  className="text-brand-sky mt-0.5 size-6 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-lg font-semibold tracking-tight">
                    You're checked in
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {fresh
                      ? `+${fresh.points} points on the leaderboard.`
                      : `Marked present at ${fmtDate(attendedAt!, 'time')}.`}
                  </p>
                  {fresh && fresh.badges.length > 0 && (
                    <p className="mt-2 text-sm">
                      New badge:{' '}
                      <span className="font-medium">
                        {fresh.badges.map((b) => b.name).join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          )}

          {!attendedAt && !fresh && data.checkIn.live && (
            <Panel tone="accent">
              <p className="text-brand-sky mb-1 flex items-center gap-2 text-sm font-medium">
                <Radio className="size-4" aria-hidden="true" />
                Check-in is open
              </p>
              <h2 className="mb-4 text-xl font-semibold tracking-tight">
                Here now? Check in.
              </h2>
              {isMember ? (
                <CheckInBox eventId={event.id} onResult={onCheckIn} />
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <p className="text-muted-foreground text-sm">
                    Check-in earns points for club members. Apply to join and an officer
                    will approve you.
                  </p>
                  <RaisedButton asChild className="self-start">
                    <Link to="/join">Apply to join</Link>
                  </RaisedButton>
                </div>
              ) : (
                <RaisedButton asChild size="lg" className="self-start">
                  <Link to="/login" search={{ redirect: href }}>
                    <LogIn aria-hidden="true" />
                    Sign in to check in
                  </Link>
                </RaisedButton>
              )}
            </Panel>
          )}

          <Panel>
            <h2 className="text-xl font-semibold tracking-tight">
              {ended ? 'This event has ended' : 'Are you coming?'}
            </h2>
            {ended ? (
              <p className="text-muted-foreground mt-2 text-sm">
                <span className="text-foreground font-semibold tabular-nums">
                  {data.attendedCount}
                </span>{' '}
                {data.attendedCount === 1 ? 'member' : 'members'} checked in.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-5">
                <RsvpGate
                  role={user?.role ?? null}
                  redirectTo={href}
                  ended={false}
                  compact
                >
                  <RsvpSegments
                    status={rsvp.status}
                    onChoose={rsvp.choose}
                    size="sm"
                    className="w-full"
                    label={`RSVP for ${event.title}`}
                  />
                </RsvpGate>
                <FaceStack faces={going.faces} count={going.count} />
              </div>
            )}
          </Panel>
        </aside>

        <article className="flex min-w-0 flex-col gap-12 lg:col-start-1 lg:row-start-1">
          {event.coverKey && (
            <img
              src={fileUrl(event.coverKey)}
              alt=""
              className="aspect-video w-full rounded-3xl object-cover lg:hidden"
            />
          )}
          <FadeUp>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              About this event
            </h2>
            {event.description ? (
              <p className="text-foreground/85 mt-5 max-w-2xl text-lg leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            ) : (
              <p className="text-muted-foreground mt-5 text-lg">
                Details are on the way. Bring a laptop if you have one.
              </p>
            )}
            <TagList tags={event.tags} className="mt-6" />
          </FadeUp>

          <FadeUp>
            <dl className="border-border/70 grid gap-px overflow-hidden rounded-3xl border bg-[var(--border)] sm:grid-cols-2">
              <Fact
                term="Date"
                value={fmtDate(event.startsAt, 'date')}
                sub={fmtDate(event.startsAt, 'weekday')}
              />
              <Fact
                term="Time"
                value={fmtTimeRange(event.startsAt, event.endsAt)}
                sub="Pacific time"
              />
              <Fact term="Location" value={event.location} />
              <Fact
                term="Check-in"
                value={`${fmtDate(checkInWindow(event).opensAt, 'time')} to ${fmtDate(checkInWindow(event).closesAt, 'time')}`}
                sub="Code or QR, shown at the event"
              />
            </dl>
          </FadeUp>

          <FadeUp>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {ended ? 'Who RSVPed' : "Who's going"}
              </h2>
              {data.maybeCount > 0 && (
                <p className="text-muted-foreground text-sm">
                  plus{' '}
                  <span className="text-foreground font-medium">{data.maybeCount}</span>{' '}
                  maybe
                </p>
              )}
            </div>
            {going.faces.length === 0 ? (
              <p className="text-muted-foreground border-border flex items-center gap-3 rounded-3xl border border-dashed px-5 py-8 text-sm">
                <Users className="size-5" aria-hidden="true" />
                {ended ? 'Nobody RSVPed for this one.' : 'No RSVPs yet. Be the first.'}
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {going.faces.map((f) => (
                  <li
                    key={f.id}
                    className="bg-card ring-border/70 flex items-center gap-3 rounded-2xl p-3 ring-1"
                  >
                    <UserAvatar user={f} className="size-9" />
                    <span className="truncate text-sm font-medium">
                      {f.name}
                      {user?.id === f.id && (
                        <span className="text-muted-foreground"> (you)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </FadeUp>
        </article>
      </section>
    </>
  )
}

/**
 * The hero's right column: the event cover on React Bits Tilted Card, or a
 * big branded date tile when no cover was uploaded. Desktop only; phones see
 * the cover inline below.
 */
function Cover({
  event,
  initialDark,
}: {
  event: { title: string; startsAt: Date; coverKey: string | null }
  initialDark: boolean
}) {
  const dark = useIsDark(initialDark)
  return (
    <div className="hidden lg:block">
      <TiltedCard
        imageSrc={fileUrl(event.coverKey)}
        altText={event.coverKey ? event.title : ''}
        containerHeight="300px"
        containerWidth="300px"
        imageHeight="300px"
        imageWidth="300px"
        radius={28}
        rotateAmplitude={10}
        scaleOnHover={1.04}
        showTooltip={false}
        gyroscope={false}
        glare={dark ? 0.35 : 0.2}
        shadow={dark ? 0.6 : 0.25}
      >
        {!event.coverKey && (
          <div className="bg-card absolute inset-0 rounded-[inherit]">
            <DateTile date={event.startsAt} size="xl" />
          </div>
        )}
      </TiltedCard>
    </div>
  )
}

function Panel({
  tone = 'plain',
  children,
}: {
  tone?: 'plain' | 'accent' | 'success'
  children: React.ReactNode
}) {
  return (
    <div
      className={
        tone === 'accent'
          ? 'bg-card ring-brand-sky/60 rounded-3xl p-5 shadow-[0_0_0_6px_color-mix(in_oklab,var(--brand-sky)_12%,transparent)] ring-2 sm:p-6'
          : tone === 'success'
            ? 'bg-brand-sky/10 ring-brand-sky/40 rounded-3xl p-5 ring-1 sm:p-6'
            : 'bg-card ring-border/70 rounded-3xl p-5 ring-1 sm:p-6'
      }
    >
      {children}
    </div>
  )
}

function Fact({ term, value, sub }: { term: string; value: string; sub?: string }) {
  return (
    <div className="bg-card px-5 py-4">
      <dt className="text-muted-foreground font-mono text-xs tracking-[0.12em] uppercase">
        {term}
      </dt>
      <dd className="mt-1.5 font-medium">{value}</dd>
      {sub && <dd className="text-muted-foreground text-sm">{sub}</dd>}
    </div>
  )
}
