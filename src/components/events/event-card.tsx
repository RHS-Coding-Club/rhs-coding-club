import { Link } from '@tanstack/react-router'
import { Check, CircleHelp, Clock, MapPin, Radio } from 'lucide-react'
import GlareHover from '#/components/bits/GlareHover'
import type { EventCardData } from '#/services/events'
import { fmtTimeRange } from '#/lib/events'
import { cn } from '#/lib/utils'
import { DateTile, FaceStack, TagList } from './parts'

/**
 * An upcoming event on React Bits Glare Hover: a streak of light crosses the
 * card when the pointer (or keyboard focus) arrives, so the grid feels
 * touchable without moving anything.
 */
export function EventCard({ event, dark }: { event: EventCardData; dark: boolean }) {
  return (
    <GlareHover
      width="100%"
      height="100%"
      background="var(--bits-surface)"
      borderColor="var(--bits-edge)"
      borderRadius="1.5rem"
      glareColor={dark ? '#ffffff' : '#5fb2ee'}
      glareOpacity={dark ? 0.22 : 0.35}
      blendMode={dark ? 'screen' : 'multiply'}
      glareSize={45}
      transitionDuration={800}
      className="group place-items-stretch! shadow-(--bits-shadow)"
    >
      <Link
        to="/events/$id"
        params={{ id: event.id }}
        className="focus-visible:ring-ring/50 grid h-full grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 gap-y-4 rounded-3xl p-5 outline-none focus-visible:ring-3 sm:flex sm:flex-col sm:gap-5 sm:p-6"
      >
        <div className="sm:flex sm:items-start sm:justify-between sm:gap-4">
          <DateTile date={event.startsAt} />
          <Status event={event} className="hidden sm:flex sm:flex-col sm:items-end" />
        </div>
        <div className="min-w-0 sm:flex-1">
          <h3 className="group-hover:decoration-brand-sky text-lg leading-snug font-semibold tracking-[-0.02em] text-balance group-hover:underline group-hover:underline-offset-4 sm:text-xl">
            {event.title}
          </h3>
          <dl className="text-muted-foreground mt-2 flex flex-col gap-1.5 text-sm sm:mt-3">
            <div className="flex items-center gap-2">
              <dt className="sr-only">When</dt>
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              <dd>{fmtTimeRange(event.startsAt, event.endsAt)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Where</dt>
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <dd className="truncate">{event.location}</dd>
            </div>
          </dl>
        </div>
        {(event.checkInLive ||
          event.viewerRsvp === 'yes' ||
          event.viewerRsvp === 'maybe') && (
          <Status
            event={event}
            className="col-span-2 flex flex-wrap items-center sm:hidden"
          />
        )}
        <TagList tags={event.tags} className="col-span-2" />
        <div className="border-border/70 col-span-2 border-t pt-4">
          <FaceStack faces={event.faces} count={event.going} size="sm" />
        </div>
      </Link>
    </GlareHover>
  )
}

function Status({ event, className }: { event: EventCardData; className?: string }) {
  return (
    <div className={cn('gap-2', className)}>
      {event.checkInLive && (
        <span className="text-brand-sky inline-flex items-center gap-1.5 text-xs font-medium">
          <Radio className="size-3.5" aria-hidden="true" />
          Check-in open
        </span>
      )}
      <ViewerBadge status={event.viewerRsvp} />
    </div>
  )
}

export function ViewerBadge({ status }: { status: 'yes' | 'maybe' | 'no' | null }) {
  if (status === 'yes') {
    return (
      <span className="bg-brand-sky inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-[#0b0f15]">
        <Check className="size-3.5" aria-hidden="true" />
        You're going
      </span>
    )
  }
  if (status === 'maybe') {
    return (
      <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <CircleHelp className="size-3.5" aria-hidden="true" />
        Maybe
      </span>
    )
  }
  return null
}
