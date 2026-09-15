# RHS Coding Club

The website for the Ripon High School Coding Club: weekly challenges, events and RSVPs, member projects, a blog, learning resources, and a points and badges system.

Built with TanStack Start and deployed to Cloudflare Workers. Data lives in D1 (SQLite), files in R2, auth is Better Auth, email goes through Resend.

## Stack

| Layer     | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | TanStack Start (React 19, Vite)                     |
| Runtime   | Cloudflare Workers via `@cloudflare/vite-plugin`    |
| Database  | Cloudflare D1 with Drizzle ORM                      |
| Auth      | Better Auth (Google, GitHub, email/password)        |
| Files     | Cloudflare R2                                       |
| Email     | Resend                                              |
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

Seeded logins (all with password `password123`):

| Email                | Role    |
| -------------------- | ------- |
| `admin@test.local`   | admin   |
| `officer@test.local` | officer |
| `member@test.local`  | member  |
| `guest@test.local`   | guest   |

Google and GitHub login need OAuth apps whose callback URLs are `{APP_URL}/api/auth/callback/google` and `{APP_URL}/api/auth/callback/github`. Leave the client IDs blank in `.dev.vars` and those buttons simply won't work locally.

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
  db/schema/       Drizzle tables (auth.ts = Better Auth, club.ts = everything else)
  db/migrations/   generated SQL, applied by Wrangler
  lib/             pure helpers, auth config, zod schemas
  components/      ui/ (Shadcn) and feature components
scripts/seed.ts    local seed
tests/             unit/, integration/, e2e/
```

## Authorization

Roles are `guest < member < officer < admin`. New sign-ups are guests until an officer approves their membership application. Emails listed in `BOOTSTRAP_ADMIN_EMAILS` become admin on first sign-in.

Every protected server function uses `requireUser`, `requireMember`, `requireOfficer`, or `requireAdmin` from `src/server/auth.ts`. Route layouts redirect too, but the server-function middleware is the actual security boundary.

## Deploying

1. `bunx wrangler login`
2. `bunx wrangler d1 create rhs-coding-club` and put the returned `database_id` in `wrangler.jsonc`
3. `bunx wrangler r2 bucket create rhs-coding-club-files`
4. `bunx wrangler secret put NAME` for each secret in `.dev.vars.example`
5. `bun run db:migrate:prod`
6. `bun run deploy`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commit messages follow Conventional Commits.
