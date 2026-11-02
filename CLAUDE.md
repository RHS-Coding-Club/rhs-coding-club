# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The RHS Coding Club website, rewritten from scratch (September 2026) on TanStack Start and Cloudflare. The previous Next.js + Firebase app lives only in git history before the `rewrite/tanstack-cloudflare` branch. Do not reintroduce Firebase, Next.js, or Vercel.

The club has no budget and no paid domain, so everything must stay on free tiers. It's live at https://rhs.riponhighcodingclub.workers.dev on the club's own Cloudflare account (`riponhighcodingclub@gmail.com`), and `wrangler.jsonc` pins that account.

## Commands

- `bun run dev` — dev server on http://localhost:3000 (Workers runtime via the Cloudflare Vite plugin)
- `bun run type-check`, `bun run lint`, `bun run format` — run all three before committing
- `bun run db:generate` after changing `src/db/schema/**`, then `bun run db:migrate` locally
- `bun run db:seed` — test users (`*@test.local`, password `password123`) and sample content
- `bun run deploy` — production; `bun run db:migrate:prod` first if there's a migration
- `bun run test:unit` / `test:integration` / `test:e2e`
- `bun run cf:types` after editing `wrangler.jsonc` or `.dev.vars.example`
- `bun run db:restore <file> --database <name>` loads a backup into an empty database

## Architecture rules

1. **The browser never touches the database.** All reads go through route loaders calling server functions; all writes are server functions. Client code imports from `#/lib/auth-client` only, never `#/lib/auth`, `#/db`, or `cloudflare:workers`.
2. **Authorization lives in server-function middleware.** Use `requireUser`, `requireMember`, `requireOfficer`, `requireAdmin` from `src/server/auth.ts`. Route `beforeLoad` redirects are UX, not security.
3. **Validate every input with Zod** in the server function's `.validator()`. Share schemas between forms and server functions via `src/lib/schemas/`.
4. **Bindings come from `import { env } from 'cloudflare:workers'`**, read lazily inside functions, never at module top level in code that could reach the client.
5. **Points are a ledger** (`point_entry`). Never store a mutable total. Leaderboards sum the ledger over a window; "this semester" starts at `pointsWindowStart()` (the semester start, or a later points season begun from the admin reset tool), never `semesterStart()` directly.
6. **Badges are awarded by the badge engine** in `src/lib/badges.ts` after any points change, attendance mark, or project approval. Do not award badges ad hoc.
7. **Files go to R2** under `FILES`, served through `/files/$key`. Store keys, not URLs.
8. **Settings** are one row per group in `setting`, each validated by a Zod schema in `src/lib/settings.ts`.
9. **Points go through `src/services/points.ts`**: `settlePoints` (idempotent per source row; amount 0 reverses) or `adjustPoints` (officer manual). Both run the badge engine.
10. **Rich text** (posts, challenge prompts, newsletters) is stored as Tiptap JSON, edited with `RichTextEditor`, and rendered with `RichText` (an allow-list renderer). Never store or inject HTML.
11. **Email** goes through `src/services/email.ts` (the club Gmail over SMTP with `worker-mailer`; logs to the console until `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set; about 500 recipients a day, split into tiers in `TIER_LIMIT` so resets keep room) with the layout in `email-templates.ts`. Respect `recipientsFor`/`recipientById` so opt-outs and club-wide toggles apply.
12. **Background jobs** run from the cron triggers in `wrangler.jsonc` via `src/server.ts` -> `src/services/cron.ts`. Every job must be idempotent (claim before sending).
13. **Public forms that send email** check Cloudflare Turnstile on the server with `passesTurnstile` (`src/services/turnstile.ts`), with its own action from `TURNSTILE_ACTIONS`. A production build with no `TURNSTILE_SECRET` refuses them. Sign-up and password reset are gated by a Better Auth hook in `src/lib/auth.ts`; login is deliberately not.
14. **Backups** go to the private `BACKUPS` R2 bucket through `src/services/backups.ts`, which never deletes anything unless a new backup just succeeded, and always keeps the newest `MIN_BACKUPS_KEPT`. Never serve this bucket publicly, and don't add login secrets to `BACKUP_TABLES`. A new table with data worth keeping goes in `BACKUP_TABLES`, parents before children.

## Auth

Google, GitHub, and email/password. Password sign-ups must confirm their email before logging in, and sign-up answers the same whether or not the address has an account. Better Auth won't link a provider to an unverified account, which blocks anyone who pre-registers someone else's email, so leave `requireLocalEmailVerified` at its default.

## MCP server

`POST /mcp` lets officers and admins run the admin panel from an AI app. `src/server.ts` lazily imports `src/mcp/http.ts`, so page views never load it.

- **Tools** live in `src/mcp/tools.ts`, one per officer or admin server function, calling the same services and schemas. Adding a protected server function fails `tests/integration/mcp.test.ts` until it has a tool or a stated reason not to. The admin reset tool and backups are left out on purpose.
- **Sign-in** is OAuth through Better Auth (`mcp()` in `src/lib/auth.ts`). Apps identify themselves with Client ID Metadata Documents; dynamic registration and the client API are off. Only protocol 2026-07-28 is served (`legacy: 'reject'`).
- **Roles** are read from the `user` row on every request and when a token is issued or refreshed. Tools set `minRole`; don't rely on the tool list for security.
- **Approval:** a tool with `confirm` writes a `mcp_pending_action` instead of acting, and only runs when its caller presses Approve at `/admin/mcp/$id`. Use it for deletes, role and settings changes, granting membership or org access, and anything that emails many people. Its `preview` must describe the action from the database, because the arguments come from an AI that may have read something malicious. It's rebuilt on approval and the action is refused if it changed, so put everything being approved in it.
- **Results** have email addresses removed unless the tool sets `revealEmails`, and rich text is exchanged as Markdown. Tools returning text from visitors or members set `untrusted`.

## Roles

`guest < member < officer < admin`. Guests are signed-in users awaiting membership approval. Officers manage content, reviews, events, and badges. Only admins change roles, edit officers, or write settings. `BOOTSTRAP_ADMIN_EMAILS` grants admin on the first provider-verified sign-in and refuses password sign-up for those addresses.

## Conventions

- File-based routes in `src/routes`. `_authed` = any signed-in user, `_admin` = officer or admin. Admin pages live under `_admin/admin/`; their navigation is the bottom dock (`src/components/admin/admin-dock.tsx`), so add a new page to `ADMIN_NAV` in `admin-nav.tsx` and to the dock's `GROUPS`.
- Server functions grouped by domain in `src/server/*.ts`. One file per domain, exported `createServerFn`s, named as verbs (`listChallenges`, `reviewSubmission`).
- Drizzle tables: camelCase keys, snake_case columns, text UUID ids from `helpers.id()`, `timestamp_ms` integers for dates, JSON text for string arrays.
- Public pages open with `PageHero` (a React Bits background that reads in both themes). React Bits live in `src/components/bits` (vendored; local changes are commented). Buttons are `RaisedButton`; `SplitButton` only for "Join the club".
- Motion: never branch markup on `useReducedMotion` (it breaks hydration); the root `MotionConfig reducedMotion="user"` handles it.
- Shadcn components in `src/components/ui` are generated; don't hand-edit them beyond styling tokens. Add with `bunx shadcn add <name>`.
- Tailwind only; brand tokens live in `src/styles.css`. Dark is the default theme. Display type is `font-display` (Instrument Serif), body is DM Sans, code and numeric labels are `font-mono`.
- Tests: pure logic in `tests/unit`, anything touching D1 or Better Auth in `tests/integration` (runs inside workerd with a fresh migrated database per file), browser flows in `tests/e2e`.
- Commits follow Conventional Commits. `main` is protected and squash-merge only, so PR titles must follow them too (CI checks this); `feat` and `fix` feed the release-please changelog.

## Gotchas

- `gsap` is stubbed in the Worker build (`src/lib/gsap-server-stub.ts`), because it starts a timer on import and Workers forbids that during SSR. Only call GSAP in effects, and add any new export you import to the stub.
- After a mutation use `router.invalidate({ sync: true })`. Plain `invalidate()` resolves before the new data is on screen, so controls re-enable with stale state.
- A Worker can't fetch its own `workers.dev` URL, so `src/mcp/http.ts` reads the JWKS in-process instead of giving the token verifier a URL.
- `wrangler.jsonc` needs its `previews` block because Workers Builds runs `wrangler preview` on PR branches. Previews inherit nothing from production, so they have no database and pages needing one fail on a preview URL.
- Create any new R2 bucket in the `r2_buckets` config before merging, or the deploy fails.
- The Turnstile widget is off in dev and tests (`TURNSTILE_SITE_KEY` is null), so forms skip the check there. To try it locally, set `VITE_TURNSTILE_SITE_KEY` in `.env` and `TURNSTILE_SECRET` in `.dev.vars`.
- The CSP is off in dev, so check new external hosts against `src/lib/security-headers.ts` with a production build (`bun run build`, `bunx vite preview`).

## Secrets

Local secrets go in `.dev.vars` (gitignored). Production secrets are set with `wrangler secret put`. Public config lives in `wrangler.jsonc` `vars`. Never commit `.dev.vars` or `.env`.
