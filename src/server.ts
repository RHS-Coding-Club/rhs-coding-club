import handler from '@tanstack/react-start/server-entry'
import { isAuthWrite, isOAuthRoute, isRateLimited } from '#/lib/rate-limit'
import { withSecurityHeaders } from '#/lib/security-headers'
import { runScheduled } from '#/services/cron'

const isMcpPath = (pathname: string) =>
  pathname === '/mcp' || pathname.startsWith('/.well-known/')

// Worker entry: TanStack Start serves every request; the cron triggers in
// wrangler.jsonc call `scheduled`, which runs the matching background jobs.
export default {
  async fetch(request, env) {
    // Vite's dev client needs inline eval and a websocket, so dev skips the CSP.
    const secure = (response: Response) =>
      withSecurityHeaders(response, !import.meta.env.DEV)
    const { pathname } = new URL(request.url)
    const limiter = isAuthWrite(request.method, pathname)
      ? env.AUTH_LIMIT
      : isOAuthRoute(pathname)
        ? env.OAUTH_LIMIT
        : null
    if (
      limiter &&
      (await isRateLimited(limiter, request.headers.get('cf-connecting-ip')))
    ) {
      return secure(
        Response.json(
          { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in a minute.' },
          { status: 429, headers: { 'retry-after': '60' } },
        ),
      )
    }
    if (isMcpPath(pathname)) {
      const { handleMcpRequest } = await import('#/mcp/http')
      const response = await handleMcpRequest(request)
      if (response) return secure(response)
    }
    return secure(await handler.fetch(request))
  },
  scheduled(controller, _env, ctx) {
    ctx.waitUntil(runScheduled(controller.cron, new Date(controller.scheduledTime)))
  },
} satisfies ExportedHandler<Cloudflare.Env>
