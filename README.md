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

The app opens the site to sign in, and the officer approves it. Its tools match the admin panel and the officer's role. Deleting things, changing roles or settings, adjusting points, accepting members, GitHub invites, and emailing the club return a link instead of acting, and a person has to approve them on the site. The reset tool stays website-only.

`/admin/mcp` shows connected apps, waiting approvals, and recent activity. Calls are limited to 60 a minute per user.

## Security

`src/server.ts` adds security headers to every response (`src/lib/security-headers.ts`) and rate limits per IP: 10 a minute on sign-in, sign-up, and reset routes, and 5 a minute on the contact and newsletter forms. The limits are Workers rate limiting bindings in `wrangler.jsonc`, which is free, and only apply on Cloudflare, not in local dev.

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
| `BOOTSTRAP_ADMIN_EMAILS` | Optional. Only for setting up a brand new database |

Public configuration (`APP_URL`, the OAuth client IDs, the Gmail address) lives in `wrangler.jsonc`.

To deploy:

1. `bunx wrangler login` as the club account
2. `bun run db:migrate:prod` if the change includes a migration
3. `bun run deploy`

Free tier limits to watch: Workers requests and CPU time, D1 reads and writes, R2 storage (billed to the card past the free 10 GB), and Gmail's daily recipients. Cloudflare's own dashboard shows current usage.

The admin reset tool at `/admin/reset` handles the new school year, and offers a data backup first. That backup leaves out login data and uploaded files. To restore the database itself, use D1 Time Travel (`bunx wrangler d1 time-travel`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commit messages follow Conventional Commits.
