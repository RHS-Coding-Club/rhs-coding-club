import { defineConfig, devices } from '@playwright/test'

// End-to-end smoke tests run against the Vite dev server with the local D1
// seeded by `bun run db:seed`. OAuth is never exercised here; the seed creates
// email/password users for each role. Set E2E_BASE_URL to run against a
// server that's already up (e.g. a second dev server on another port).
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'bun run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
