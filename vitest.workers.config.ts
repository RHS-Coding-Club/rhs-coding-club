import path from 'node:path'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

// Integration tests: server functions and data access against a real local D1
// inside workerd. Every test file gets isolated storage, and migrations are
// applied once per file from tests/integration/setup.ts.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    cloudflareTest(async () => {
      const migrations = await readD1Migrations(
        path.join(import.meta.dirname, 'src/db/migrations'),
      )
      return {
        wrangler: { configPath: './wrangler.jsonc' },
        // Tests import server modules directly, so the real Start server entry
        // (a package specifier the pool can't resolve) is swapped for a stub.
        main: './tests/integration/worker.ts',
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret-1234',
            BOOTSTRAP_ADMIN_EMAILS: 'admin@test.local',
          },
        },
      }
    }),
  ],
  test: {
    name: 'integration',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/integration/setup.ts'],
  },
})
