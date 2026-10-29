import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { isValidKey } from '#/services/files'

/** Streams an uploaded file out of R2. Keys are immutable, so cache forever. */
export const Route = createFileRoute('/files/$')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const key = params._splat ?? ''
        if (!isValidKey(key)) return new Response('Not found', { status: 404 })
        const object = await env.FILES.get(key, {
          onlyIf: request.headers,
        })
        if (!object) return new Response('Not found', { status: 404 })
        const headers = new Headers()
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)
        headers.set('cache-control', 'public, max-age=31536000, immutable')
        headers.set('x-content-type-options', 'nosniff')
        if (!('body' in object)) return new Response(null, { status: 304, headers })
        return new Response(object.body, { headers })
      },
    },
  },
})
