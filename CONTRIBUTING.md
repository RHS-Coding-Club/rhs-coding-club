# Contributing to the RHS Coding Club website

Thanks for helping out. This guide covers getting the site running and how changes get merged.

## Getting started

You need [bun](https://bun.sh) 1.3 or newer.

```bash
git clone https://github.com/YOUR_USERNAME/rhs-coding-club.git
cd rhs-coding-club
git remote add upstream https://github.com/RHS-Coding-Club/rhs-coding-club.git

bun install
cp .dev.vars.example .dev.vars   # set BETTER_AUTH_SECRET: openssl rand -base64 32
bun run cf:types
bun run db:migrate
bun run db:seed
bun run dev                      # http://localhost:3000
```

Log in with `admin@test.local`, `officer@test.local`, `member@test.local`, or `guest@test.local`, all with the password `password123`. Emails print to the dev server console instead of being sent, including links to confirm an account or reset a password.

## Making a change

Branch from `main` with a descriptive name, such as `feature/new-challenge-page`, `fix/mobile-nav-overflow`, or `docs/update-readme`.

Before you push, run:

```bash
bun run type-check
bun run lint
bun run format
bun run test:unit
bun run test:integration
bun run test:e2e
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org): `feat: add leaderboard filters`, `fix: keep the RSVP from snapping back`.

Open a pull request against `main`, fill out the template, and link any related issue. CI runs the same checks.

`main` is protected: every change goes through a pull request and the required checks must pass. Pull requests are squash-merged, so the PR title becomes the commit message and has to follow Conventional Commits too. Merging to `main` deploys the site, so run `bun run db:migrate:prod` first if your change includes a migration.

## Releases

[release-please](https://github.com/googleapis/release-please) keeps an open release PR that bumps the version and updates `CHANGELOG.md` from `feat` and `fix` commits. Merging that PR tags the version and publishes a GitHub Release. It doesn't change how the site deploys.

GitHub doesn't run checks on PRs opened by a workflow, so close and reopen the release PR to start them before merging.

## How the code is organized

[`CLAUDE.md`](./CLAUDE.md) has the full architecture rules. The ones that come up most:

- **The browser never touches the database.** Reads go through route loaders calling server functions, and writes are server functions.
- **Authorization lives in server-function middleware** (`requireMember`, `requireOfficer`, `requireAdmin`). Route redirects are only for the user experience.
- **Validate every input with Zod.** Schemas live in `src/lib/schemas/` and are shared with the forms.
- **Points are a ledger.** Never store a total; change points through `src/services/points.ts`.
- **Rich text is stored as Tiptap JSON** and rendered with `RichText`. Never store or inject HTML.
- **Keep it free.** The club has no budget, so don't add anything that needs a paid plan or a paid domain.

After changing `src/db/schema/**`, run `bun run db:generate`, then `bun run db:migrate`. After editing `wrangler.jsonc` or `.dev.vars.example`, run `bun run cf:types`.

Tests go in `tests/unit` for pure logic, `tests/integration` for anything touching D1 or Better Auth, and `tests/e2e` for browser flows.

## Reporting issues

[Open an issue](https://github.com/RHS-Coding-Club/rhs-coding-club/issues/new/choose) using one of the forms. Report security problems the way [SECURITY.md](./SECURITY.md) describes, not in a public issue.

## Roles

- **Contributors:** anyone who opens a pull request.
- **Officers and admins:** club officers who review pull requests and run the project.

## License

By contributing, you agree that your contributions are licensed under the MIT License.
