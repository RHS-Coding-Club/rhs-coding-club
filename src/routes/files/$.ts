import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { isValidKey, makeVariant, parseWidth, variantKey } from '#/services/files'

/**
 * Streams an uploaded file out of R2. Keys are immutable, so cache forever.
 * `?w=<width>` serves a resized WebP copy instead (see `fileUrl`), falling back
 * to the original, briefly cached, when one can't be made.
 */
export const Route = createFileRoute('/files/$')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const key = params._splat ?? ''
        if (!isValidKey(key)) return new Response('Not found', { status: 404 })
        const width = parseWidth(new URL(request.url).searchParams.get('w'))

        let object: R2Object | R2ObjectBody | null = null
        let fallback = false
        if (width) {
          object = await env.FILES.get(variantKey(key, width), {
            onlyIf: request.headers,
          })
          if (!object) {
            const made = await makeVariant(env.FILES, env.IMAGES, key, width)
            if (made) object = await env.FILES.get(variantKey(key, width))
            fallback = !object
          }
        }
        object ??= await env.FILES.get(key, { onlyIf: request.headers })
        if (!object) return new Response('Not found', { status: 404 })

        const headers = new Headers()
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)
        headers.set(
          'cache-control',
          fallback ? 'public, max-age=3600' : 'public, max-age=31536000, immutable',
        )
        headers.set('x-content-type-options', 'nosniff')
        if (!('body' in object)) return new Response(null, { status: 304, headers })
        return new Response(object.body, { headers })
      },
    },
  },
})
