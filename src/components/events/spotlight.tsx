import { Link, useRouter } from '@tanstack/react-router'
import { ArrowRight, Clock, MapPin, Radio } from 'lucide-react'
import type { EventCardData } from '#/services/events'
import type { SessionUser } from '#/server/auth'
import { eventPhase, fmtTimeRange } from '#/lib/events'
import { fmtDate } from '#/lib/format'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { AddToCalendar } from './add-to-calendar'
import { Countdown } from './countdown'
import { DateTile, FaceStack, TagList } from './parts'
import { RsvpGate, RsvpSegments, optimisticGoing, useRsvp } from './rsvp'

/**
 * The next event, big: what, when, where, who's going, an RSVP control, and
 * a live React Bits Counter countdown on the navy panel. While it runs, the
 * panel says so and points members at check-in.
 */
export function NextEventSpotlight({
  event,
  serverNow,
  user,
  url,
}: {
  event: EventCardData
  serverNow: number
  user: SessionUser | null
  /** Absolute event URL, for the calendar links. */
  url: string
}) {
  const router = useRouter()
  const rsvp = useRsvp(event.id, event.viewerRsvp)
  const me = user
    ? {
        id: user.id,
        name: user.name,
        image: user.image,
        avatarKey: user.avatarKey ?? null,
      }
    : null
  const going = optimisticGoing(
    { count: event.going, faces: event.faces },
    event.viewerRsvp,
    rsvp.status,
    me,
  )
  const live = eventPhase(event, serverNow) === 'live'
  const href = `/events/${event.id}`

  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) pt-12 sm:pt-16"
      aria-labelledby="next-event-heading"
    >
      <FadeUp>
        <article className="bg-card ring-border/70 grid overflow-hidden rounded-4xl ring-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 p-6 sm:p-10">
            <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="bg-brand-sky absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
                <span className="bg-brand-sky relative inline-flex size-2 rounded-full" />
              </span>
              {live ? 'Happening now' : 'Next up'}
            </p>

            <div className="flex items-start gap-5">
              <DateTile date={event.startsAt} size="lg" className="hidden sm:flex" />
              <div className="min-w-0">
                <h2
                  id="next-event-heading"
                  className="text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-4xl"
                >
                  <Link
                    to="/events/$id"
                    params={{ id: event.id }}
                    className="decoration-brand-sky underline-offset-[6px] hover:underline"
                  >
                    {event.title}
                  </Link>
                </h2>
                <dl className="text-muted-foreground mt-4 flex flex-col gap-2 text-base">
                  <div className="flex items-center gap-2.5">
                    <dt className="sr-only">When</dt>
                    <Clock
                      className="text-brand-sky size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <dd>
                      {fmtDate(event.startsAt, 'weekday')},{' '}
                      {fmtDate(event.startsAt, 'short')}{' '}
                      <span className="whitespace-nowrap">
                        · {fmtTimeRange(event.startsAt, event.endsAt)}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Where</dt>
                    <MapPin
                      className="text-brand-sky size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <dd>{event.location}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {event.description && (
              <p className="text-foreground/80 line-clamp-3 max-w-xl text-lg leading-relaxed">
                {event.description}
              </p>
            )}
            <TagList tags={event.tags} />

            <div className="border-border/70 mt-auto flex flex-col gap-5 border-t pt-6">
              <RsvpGate role={user?.role ?? null} redirectTo={href} ended={false}>
                <RsvpSegments
                  status={rsvp.status}
                  onChoose={rsvp.choose}
                  className="w-full sm:w-auto sm:self-start"
                  label={`RSVP for ${event.title}`}
                />
              </RsvpGate>
              <FaceStack faces={going.faces} count={going.count} />
            </div>
          </div>

          <div className="bg-brand-navy relative flex flex-col justify-between gap-10 overflow-hidden p-6 text-[#e6edf5] sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[#5fb2ee]/30 blur-3xl"
            />
            {live ? (
              <div className="relative">
                <p className="text-sm text-[#e6edf5]/70">
                  It started at {fmtDate(event.startsAt, 'time')}
                </p>
                <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
                  Happening now
                </p>
                <p className="mt-4 max-w-sm text-[#e6edf5]/80">
                  {event.checkInLive
                    ? 'Check-in is open. Scan the QR on the projector or type the code on the event page.'
                    : 'Head over. Check-in opens when an officer puts the code on the projector.'}
                </p>
              </div>
            ) : (
              <div className="relative">
                <p className="mb-5 text-sm text-[#e6edf5]/70">Starts in</p>
                <Countdown
                  target={event.startsAt}
                  serverNow={serverNow}
                  onDone={() => void router.invalidate()}
                />
              </div>
            )}
            <div className="relative flex flex-wrap gap-3">
              <RaisedButton asChild variant="primary" size="lg">
                <Link to="/events/$id" params={{ id: event.id }}>
                  {live && event.checkInLive ? (
                    <>
                      <Radio aria-hidden="true" />
                      Check in
                    </>
                  ) : (
                    <>
                      Event details
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </Link>
              </RaisedButton>
              <AddToCalendar event={event} url={url} />
            </div>
          </div>
        </article>
      </FadeUp>
    </section>
  )
}
