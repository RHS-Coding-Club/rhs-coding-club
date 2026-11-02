# RHS Coding Club

[![CI](https://github.com/RHS-Coding-Club/rhs-coding-club/actions/workflows/ci.yml/badge.svg)](https://github.com/RHS-Coding-Club/rhs-coding-club/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/RHS-Coding-Club/rhs-coding-club/badge)](https://scorecard.dev/viewer/?uri=github.com/RHS-Coding-Club/rhs-coding-club)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The website for the Ripon High School Coding Club: weekly challenges, events and RSVPs, member projects, a blog, learning resources, and a points and badges system.

Live at **https://rhs.riponhighcodingclub.workers.dev**.

Built with TanStack Start and deployed to Cloudflare Workers. Data lives in D1 (SQLite), files in R2, auth is Better Auth, email goes through the club's Gmail account. The club has no budget, so everything runs on free tiers and there is no paid domain.

## Stack

| Layer     | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | TanStack Start (React 19, Vite)                     |
| Runtime   | Cloudflare Workers via `@cloudflare/vite-plugin`    |
| Database  | Cloudflare D1 with Drizzle ORM                      |
| Auth      | Better Auth (Google, GitHub, email/password)        |
| Files     | Cloudflare R2                                       |
| Email     | Gmail SMTP (`worker-mailer`)                        |
| UI        | Tailwind CSS v4, Shadcn UI, lucide icons            |
| Tests     | Vitest (unit + Workers integration), Playwright e2e |
| Tooling   | bun, ESLint, Prettier, GitHub Actions               |

## Getting started

Requirements: [bun](https://bun.sh) 1.3+.

```bash
bun install
cp .dev.vars.example .dev.vars   # fill in BETTER_AUTH_SECRET at minimum
bun run cf:types                 # generate worker-configuration.d.ts
bun run db:migrate               # apply migrations to the local D1
bun run db:seed                  # test users + sample content
bun run dev                      # http://localhost:3000
```

Seeded logins, which only work locally (all with password `password123`):

| Email                | Role    |
| -------------------- | ------- |
| `admin@test.local`   | admin   |
| `officer@test.local` | officer |
| `member@test.local`  | member  |
| `guest@test.local`   | guest   |

Google and GitHub login need OAuth apps whose callback URLs are `{APP_URL}/api/auth/callback/google` and `{APP_URL}/api/auth/callback/github`. Without credentials in `.dev.vars` those buttons won't work locally. Everything else does: with no `GMAIL_APP_PASSWORD`, emails print to the dev server console, including the links to confirm an account or reset a password.

## Scripts

| Command                    | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `bun run dev`              | Vite dev server with the Workers runtime              |
| `bun run build`            | Production build                                      |
| `bun run deploy`           | Build and `wrangler deploy`                           |
| `bun run type-check`       | `tsc --noEmit`                                        |
| `bun run lint` / `format`  | ESLint / Prettier                                     |
| `bun run db:generate`      | Generate a migration from `src/db/schema`             |
| `bun run db:migrate`       | Apply migrations to local D1                          |
| `bun run db:migrate:prod`  | Apply migrations to the production D1                 |
| `bun run db:seed`          | Seed local D1                                         |
| `bun run db:restore`       | Load a backup into an empty D1 database               |
| `bun run test:unit`        | Pure-function tests in Node                           |
| `bun run test:integration` | Server code against a real D1 inside workerd          |
| `bun run test:e2e`         | Playwright smoke tests against the dev server         |
| `bun run cf:types`         | Regenerate binding types after editing wrangler.jsonc |

## Project layout

```
src/
  routes/          file-based routes; _authed and _admin are pathless guards
  server/          server functions and auth middleware
  services/        business logic; takes the database as an argument
  db/schema/       Drizzle tables (auth.ts = Better Auth, club.ts = everything else)
  db/migrations/   generated SQL, applied by Wrangler
  lib/             pure helpers, auth config, zod schemas
  components/      ui/ (Shadcn), bits/ (vendored React Bits), feature components
scripts/           local seed and the one-time import from the old Firebase site
tests/             unit/, integration/, e2e/
```

## Accounts and sign-in

People sign in with Google, GitHub, or an email and password. A password sign-up has to confirm its email before it can log in. Signing up with an address that already has an account gets the same response as a new sign-up, and the owner gets an email telling them to log in or set a password, so the form can't be used to find out who has an account.

Members imported from the old site have no password. They set one through **Forgot password**, or sign in with a Google or GitHub account that uses the same email.

## Authorization

Roles are `guest < member < officer < admin`. New sign-ups are guests until an officer approves their membership application. Emails listed in `BOOTSTRAP_ADMIN_EMAILS` become admin the first time they sign in with Google or GitHub. Password sign-up is refused for those addresses, because it doesn't prove ownership until the email is confirmed.

Every protected server function uses `requireUser`, `requireMember`, `requireOfficer`, or `requireAdmin` from `src/server/auth.ts`. Route layouts redirect too, but the server-function middleware is the actual security boundary.

## MCP server

Officers and admins can run the admin panel from an AI app that speaks the 2026-07-28 MCP protocol. Point it at `{APP_URL}/mcp`, for example:

```bash
claude mcp add --transport http rhs https://rhs.riponhighcodingclub.workers.dev/mcp
```

The app opens the site to sign in, and the officer approves it. Its tools match the admin panel and the officer's role. Deleting things, changing roles or settings, adjusting points, accepting members, GitHub invites, and emailing the club return a link instead of acting, and a person has to approve them on the site. The reset tool and backups stay website-only.

`/admin/mcp` shows connected apps, waiting approvals, and recent activity. Calls are limited to 60 a minute per user.

## Security

`src/server.ts` adds security headers to every response (`src/lib/security-headers.ts`) and rate limits per IP: 10 a minute on sign-in, sign-up, and reset routes, and 5 a minute on the contact and newsletter forms. The limits are Workers rate limiting bindings in `wrangler.jsonc`, which is free, and only apply on Cloudflare, not in local dev.

Sign-up, forgot password, contact, and the newsletter form also check Cloudflare Turnstile on the server, because those forms send email and spend the Gmail daily limit. It's free. Forms fail closed: if `TURNSTILE_SECRET` is missing in production or Cloudflare can't be reached, they refuse the request. Login isn't gated, so Google, GitHub, and password sign-in keep working if Turnstile is down.

## Backups

Admins configure automatic backups at `/admin/backups`: how often (daily, weekly, or every 30 days) and how long to keep them (7 to 365 days). The default is weekly, kept for 90 days. The page estimates storage from the size of the latest real backup, against R2's free 10 GB, which uploaded files share.

Backups live in the private `rhs-coding-club-backups` bucket, and a daily cron job checks whether one is due. Old ones are only deleted right after a new backup succeeds, and the newest three are always kept, so a failing job can't age out the last good copies.

They leave out passwords, sessions, and uploaded images. After a full restore, people sign in with Google or GitHub on the same email, or set a new password through **Forgot password**. Uploaded images need their own copy.

To restore, never over live data:

1. `bunx wrangler d1 create rhs-coding-club-restore`
2. `bunx wrangler d1 migrations apply rhs-coding-club-restore --remote` (with a temporary `d1_databases` entry for it)
3. Download a backup from `/admin/backups`, then `bun run db:restore <file> --database rhs-coding-club-restore --remote`
4. Check the data, then point `database_id` in `wrangler.jsonc` at the new database and deploy

For a mistake in the last few days, D1 Time Travel is faster: `bunx wrangler d1 time-travel`.

## Email

`src/services/email.ts` sends through the club's Gmail account over SMTP using an app password. Gmail allows about 500 recipients a day, so each kind of mail gets a limit (`TIER_LIMIT`): public-triggered mail stops first and password resets always have room left. Bulk sends beyond a limit are dropped and logged, not queued.

Changing the Gmail password cancels the app password, and email stops until a new one is generated and set as `GMAIL_APP_PASSWORD`.

## Running the site

Everything belongs to the club account `riponhighcodingclub@gmail.com`, so it can be handed to next year's officers by passing on that login. That account owns the Cloudflare account, the OAuth apps, and the mailbox the site sends from. The card on the Cloudflare account is only there because R2 requires one.

Set these on the `rhs` Worker as secrets (`bunx wrangler secret put NAME`, or the dashboard):

| Secret                   | Needed for                                         |
| ------------------------ | -------------------------------------------------- |
| `BETTER_AUTH_SECRET`     | Signing sessions. `openssl rand -base64 32`        |
| `GOOGLE_CLIENT_SECRET`   | Google sign-in                                     |
| `GITHUB_CLIENT_SECRET`   | GitHub sign-in                                     |
| `GMAIL_APP_PASSWORD`     | Sending email                                      |
| `GITHUB_TOKEN`           | Org invites. Needs `admin:org` and `read:user`     |
| `TURNSTILE_SECRET`       | Bot checks on forms. Forms refuse without it       |
| `BOOTSTRAP_ADMIN_EMAILS` | Optional. Only for setting up a brand new database |

Public configuration (`APP_URL`, the OAuth client IDs, the Gmail address) lives in `wrangler.jsonc`.

To deploy:

1. `bunx wrangler login` as the club account
2. `bun run db:migrate:prod` if the change includes a migration
3. `bun run deploy`

Free tier limits to watch: Workers requests and CPU time, D1 reads and writes, R2 storage (billed to the card past the free 10 GB), and Gmail's daily recipients. Cloudflare's own dashboard shows current usage.

The admin reset tool at `/admin/reset` handles the new school year, and offers a data backup first.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commit messages follow Conventional Commits.
