import handler from '@tanstack/react-start/server-entry'
import { isAuthWrite, isRateLimited } from '#/lib/rate-limit'
import { withSecurityHeaders } from '#/lib/security-headers'
import { runScheduled } from '#/services/cron'

// Worker entry: TanStack Start serves every request; the cron triggers in
// wrangler.jsonc call `scheduled`, which runs the matching background jobs.
export default {
  async fetch(request, env) {
    // Vite's dev client needs inline eval and a websocket, so dev skips the CSP.
    const secure = (response: Response) =>
      withSecurityHeaders(response, !import.meta.env.DEV)
    const { pathname } = new URL(request.url)
    if (
      isAuthWrite(request.method, pathname) &&
      (await isRateLimited(env.AUTH_LIMIT, request.headers.get('cf-connecting-ip')))
    ) {
      return secure(
        Response.json(
          { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in a minute.' },
          { status: 429, headers: { 'retry-after': '60' } },
        ),
      )
    }
    return secure(await handler.fetch(request))
  },
  scheduled(controller, _env, ctx) {
    ctx.waitUntil(runScheduled(controller.cron, new Date(controller.scheduledTime)))
  },
} satisfies ExportedHandler<Cloudflare.Env>
