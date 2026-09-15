# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The RHS Coding Club website, rewritten from scratch (September 2026) on TanStack Start and Cloudflare. The previous Next.js + Firebase app lives only in git history before the `rewrite/tanstack-cloudflare` branch. Do not reintroduce Firebase, Next.js, Brevo, or Vercel.

## Commands

- `bun run dev` — dev server on http://localhost:3000 (Workers runtime via the Cloudflare Vite plugin)
- `bun run type-check`, `bun run lint`, `bun run format` — run all three before committing
- `bun run db:generate` after changing `src/db/schema/**`, then `bun run db:migrate` locally
- `bun run db:seed` — test users (`*@test.local`, password `password123`) and sample content
- `bun run test:unit` / `test:integration` / `test:e2e`
- `bun run cf:types` after editing `wrangler.jsonc` or `.dev.vars.example`

## Architecture rules

1. **The browser never touches the database.** All reads go through route loaders calling server functions; all writes are server functions. Client code imports from `#/lib/auth-client` only, never `#/lib/auth`, `#/db`, or `cloudflare:workers`.
2. **Authorization lives in server-function middleware.** Use `requireUser`, `requireMember`, `requireOfficer`, `requireAdmin` from `src/server/auth.ts`. Route `beforeLoad` redirects are UX, not security.
3. **Validate every input with Zod** in the server function's `.inputValidator()`. Share schemas between forms and server functions via `src/lib/schemas/`.
4. **Bindings come from `import { env } from 'cloudflare:workers'`**, read lazily inside functions, never at module top level in code that could reach the client.
5. **Points are a ledger** (`point_entry`). Never store a mutable total. Leaderboards sum the ledger over a window.
6. **Badges are awarded by the badge engine** in `src/lib/badges.ts` after any points change, attendance mark, or project approval. Do not award badges ad hoc.
7. **Files go to R2** under `FILES`, served through `/files/$key`. Store keys, not URLs.
8. **Settings** are one row per group in `setting`, each validated by a Zod schema in `src/lib/settings.ts`.

## Roles

`guest < member < officer < admin`. Guests are signed-in users awaiting membership approval. Officers manage content, reviews, events, and badges. Only admins change roles, edit officers, or write settings. `BOOTSTRAP_ADMIN_EMAILS` grants admin on first sign-in.

## Conventions

- File-based routes in `src/routes`. `_authed` = any signed-in user, `_admin` = officer or admin. Admin pages live under `_admin/admin/`.
- Server functions grouped by domain in `src/server/*.ts`. One file per domain, exported `createServerFn`s, named as verbs (`listChallenges`, `reviewSubmission`).
- Drizzle tables: camelCase keys, snake_case columns, text UUID ids from `helpers.id()`, `timestamp_ms` integers for dates, JSON text for string arrays.
- Shadcn components in `src/components/ui` are generated; don't hand-edit them beyond styling tokens. Add with `bunx shadcn add <name>`.
- Tailwind only; brand tokens live in `src/styles.css`. Dark is the default theme. Display type is `font-display` (Instrument Serif), body is DM Sans, code and numeric labels are `font-mono`.
- Tests: pure logic in `tests/unit`, anything touching D1 or Better Auth in `tests/integration` (runs inside workerd with a fresh migrated database per file), browser flows in `tests/e2e`.
- Commits follow Conventional Commits.

## Secrets

Local secrets go in `.dev.vars` (gitignored). Production secrets are set with `wrangler secret put`. Public config lives in `wrangler.jsonc` `vars`. Never commit `.dev.vars` or `.env`.
