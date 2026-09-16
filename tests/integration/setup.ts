import { applyD1Migrations, env } from 'cloudflare:test'
import type { D1Migration } from 'cloudflare:test'

// TEST_MIGRATIONS is a test-only binding injected by vitest.workers.config.ts.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cloudflare {
    interface Env {
      TEST_MIGRATIONS: D1Migration[]
    }
  }
}

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
