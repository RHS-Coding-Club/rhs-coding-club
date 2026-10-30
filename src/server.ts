import handler from '@tanstack/react-start/server-entry'
import { runScheduled } from '#/services/cron'

// Worker entry: TanStack Start serves every request; the cron triggers in
// wrangler.jsonc call `scheduled`, which runs the matching background jobs.
export default {
  fetch: (request) => handler.fetch(request),
  scheduled(controller, _env, ctx) {
    ctx.waitUntil(runScheduled(controller.cron, new Date(controller.scheduledTime)))
  },
} satisfies ExportedHandler<Cloudflare.Env>
