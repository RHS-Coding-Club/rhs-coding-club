import { defineConfig } from 'vitest/config'

// Unit tests: pure functions only (points engine, badge engine, schemas, helpers).
// They run in Node and never import anything that touches Cloudflare bindings.
// Integration tests against D1 live in vitest.workers.config.ts.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    name: 'unit',
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
