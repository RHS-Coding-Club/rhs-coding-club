import type { D1Migration } from 'cloudflare:test'

// TEST_MIGRATIONS is a test-only binding injected by vitest.workers.config.ts.
// It lives in a .d.ts because `Env` mixes generated types (whose shape depends
// on .dev.vars) with src/env.d.ts, and TypeScript 7 checks the merged interface
// at its first declaration outside a declaration file.
declare global {
  namespace Cloudflare {
    interface Env {
      TEST_MIGRATIONS: D1Migration[]
    }
  }
}
