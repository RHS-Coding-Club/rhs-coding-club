import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '#/db'
import { buildIcs } from '#/lib/events'
import { calendarFeed } from '#/services/events'

/**
 * The club calendar as a subscribable iCalendar feed. Linked as webcal://
 * so phones and desktop calendars subscribe instead of importing once.
 */
export const Route = createFileRoute('/events/calendar.ics')({
  server: {
    handlers: {
      GET: async () => {
        const events = await calendarFeed(getDb())
        return new Response(buildIcs(events, { name: 'RHS Coding Club' }), {
          headers: {
            'content-type': 'text/calendar; charset=utf-8',
            'content-disposition': 'inline; filename="rhs-coding-club.ics"',
            'cache-control': 'public, max-age=900',
          },
        })
      },
    },
  },
})
