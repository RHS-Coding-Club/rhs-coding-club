import { defineConfig } from 'drizzle-kit'

// Migrations are generated from the schema with `bun run db:generate` and
// applied with Wrangler (`bun run db:migrate` locally, `db:migrate:prod` remotely),
// so drizzle-kit only needs the schema and output paths here.
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
})
