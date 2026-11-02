import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '#/db'
import { buildIcs } from '#/lib/events'
import { slugify } from '#/lib/format'
import { calendarEvent } from '#/services/events'

/** One event as an .ics download (Apple Calendar, Outlook, anything RFC 5545). */
export const Route = createFileRoute('/events/$id/calendar.ics')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const event = await calendarEvent(getDb(), params.id)
        if (!event) return new Response('Not found', { status: 404 })
        const name = slugify(event.title) || 'event'
        return new Response(buildIcs([event], { name: event.title }), {
          headers: {
            'content-type': 'text/calendar; charset=utf-8',
            'content-disposition': `attachment; filename="${name}.ics"`,
            'cache-control': 'public, max-age=300',
          },
        })
      },
    },
  },
})
