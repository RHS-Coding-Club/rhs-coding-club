import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CalendarDays, CalendarPlus, Download } from 'lucide-react'
import { z } from 'zod'
import { listEvents } from '#/server/events'
import { EVENT_TAGS, tagLabel, webcalUrl } from '#/lib/events'
import { cn } from '#/lib/utils'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { EmptyState } from '#/components/empty-state'
import { ThreadsBackground } from '#/components/events/threads-bg'
import { NextEventSpotlight } from '#/components/events/spotlight'
import { EventCard } from '#/components/events/event-card'
import { PastEvents } from '#/components/events/past-events'
import { useIsDark } from '#/hooks/use-is-dark'

const searchSchema = z.object({ tag: z.string().max(32).optional() })

const DESCRIPTION =
  "Lunch meetings in Mr. Derrick's classroom, teaching days at the Ripon Afterschool Program, and the H2O hackathon. RSVP so we know to save you a seat."

export const Route = createFileRoute('/events/')({
  validateSearch: searchSchema,
  loader: () => listEvents(),
  head: () => ({
    meta: [
      { title: 'Events · RHS Coding Club' },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: 'Events · RHS Coding Club' },
      { property: 'og:description', content: DESCRIPTION },
    ],
  }),
  component: EventsPage,
})

function EventsPage() {
  const data = Route.useLoaderData()
  const { tag } = Route.useSearch()
  const { user, theme } = Route.useRouteContext()
  const navigate = useNavigate({ from: Route.fullPath })
  const dark = useIsDark(theme === 'dark')

  const order = (t: string) => {
    const i = (EVENT_TAGS as readonly string[]).indexOf(t)
    return i === -1 ? 99 : i
  }
  const tags = [...data.tags].sort((a, b) => order(a) - order(b) || a.localeCompare(b))
  const active = tag && tags.includes(tag) ? tag : undefined
  const matches = <T extends { tags: string[] }>(list: T[]) =>
    active ? list.filter((e) => e.tags.includes(active)) : list

  const upcoming = matches(data.upcoming)
  const past = matches(data.past)
  const next = upcoming.at(0)
  const later = upcoming.slice(1)

  const setTag = (t: string | undefined) =>
    void navigate({ search: { tag: t }, replace: true, resetScroll: false })

  return (
    <>
      <PageHero
        background={<ThreadsBackground initialDark={theme === 'dark'} />}
        title="Events"
        description={DESCRIPTION}
        actions={
          <>
            <RaisedButton asChild size="lg">
              <a href={webcalUrl(data.feedUrl)}>
                <CalendarPlus aria-hidden="true" />
                Add the club calendar
              </a>
            </RaisedButton>
            <RaisedButton asChild variant="ghost" size="lg">
              <a href="/events/calendar.ics" download="rhs-coding-club.ics">
                <Download aria-hidden="true" />
                Download .ics
              </a>
            </RaisedButton>
          </>
        }
      >
        {tags.length > 1 && (
          <div
            role="group"
            aria-label="Filter events by type"
            className="flex flex-wrap gap-2"
          >
            <FilterChip active={!active} onClick={() => setTag(undefined)}>
              All
            </FilterChip>
            {tags.map((t) => (
              <FilterChip key={t} active={active === t} onClick={() => setTag(t)}>
                {tagLabel(t)}
              </FilterChip>
            ))}
          </div>
        )}
      </PageHero>

      {next ? (
        <NextEventSpotlight
          event={next}
          serverNow={data.now}
          user={user}
          url={new URL(`/events/${next.id}`, data.feedUrl).toString()}
        />
      ) : (
        <section className="mx-auto max-w-6xl px-(--gutter) pt-12 sm:pt-16">
          <EmptyState
            icon={<CalendarDays />}
            title={
              active
                ? `No upcoming ${tagLabel(active).toLowerCase()} events`
                : 'Nothing on the calendar yet'
            }
          >
            {active
              ? 'Try another filter, or subscribe to the club calendar so new ones show up on their own.'
              : 'Officers post meetings here as soon as they are scheduled. Subscribe to the club calendar so they show up on your phone.'}
          </EmptyState>
        </section>
      )}

      {later.length > 0 && (
        <section
          className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24"
          aria-labelledby="upcoming-heading"
        >
          <FadeUp className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="upcoming-heading"
                className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
              >
                Coming up
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                {later.length} more on the calendar after that.
              </p>
            </div>
          </FadeUp>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {later.map((e, i) => (
              <li key={e.id} className="h-full">
                <FadeUp delay={(i % 3) * 0.07} className="h-full">
                  <EventCard event={e} dark={dark} />
                </FadeUp>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        className={cn(
          'mx-auto max-w-6xl px-(--gutter) pb-16 sm:pb-24',
          later.length === 0 && 'pt-16 sm:pt-24',
        )}
        aria-labelledby="past-heading"
      >
        <FadeUp className="mb-10">
          <h2
            id="past-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            Past events
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Every meeting, teaching day, and hackathon from the last year.
          </p>
        </FadeUp>
        {past.length > 0 ? (
          <PastEvents events={past} />
        ) : (
          <EmptyState title="No past events yet">
            Once an event wraps up it moves here with its attendance count.
          </EmptyState>
        )}
      </section>
    </>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'focus-visible:ring-ring/50 h-9 cursor-pointer rounded-full px-4 text-sm font-medium ring-1 backdrop-blur-sm transition-colors outline-none focus-visible:ring-3',
        active
          ? 'bg-[#101826] text-white ring-[#101826] dark:bg-white dark:text-[#101826] dark:ring-white'
          : 'bg-white/60 text-[#101826]/80 ring-[#101826]/15 hover:bg-white/90 hover:text-[#101826] dark:bg-white/5 dark:text-white/80 dark:ring-white/15 dark:hover:bg-white/10 dark:hover:text-white',
      )}
    >
      {children}
    </button>
  )
}
