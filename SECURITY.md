# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have found a security vulnerability in the RHS Coding Club website, please [report it privately on GitHub](https://github.com/RHS-Coding-Club/rhs-coding-club/security/advisories/new). You can also reach us through the website's contact page or the club's Discord.

**Links:** [Contact Us Page](https://rhs.riponhighcodingclub.workers.dev/contact), [Discord](https://discord.com/invite/UQR79bn6ZZ)

Please include the following details in your report:

- A description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact of the vulnerability.
- Any relevant code snippets or screenshots.

## Supported Versions

Only the latest version of the `main` branch is currently supported for security updates.

## Security Scope

### What to look for

- **Authorization:** server functions in `src/server/*` that a role shouldn't be able to reach. Route redirects are only for the user experience; `requireUser`, `requireMember`, `requireOfficer`, and `requireAdmin` are the real boundary.
- **Authentication:** Better Auth configuration in `src/lib/auth.ts`, account linking, email confirmation, password resets, and sessions.
- **Data exposure:** private data (emails, unapproved projects, applications) in public loaders or server function responses.
- **File uploads and serving:** `src/services/files.ts` and the `/files/$` route.
- **Rich text:** anything that gets past the allow-list renderer in `RichText`.
- **Email:** header injection or abuse of the daily sending limit in `src/services/email.ts`.

### Out of scope

- DDoS or other volume-based attacks.
- Social engineering against club members or officers.
- Vulnerabilities in third-party dependencies, unless we're misusing the library.

## Contributor Guidelines

1. **Secrets:** never commit `.dev.vars` or `.env`, or hardcode secrets. Local values go in `.dev.vars`, production values in Worker secrets. `wrangler.jsonc` `vars` are public.
2. **Bindings:** read them from `cloudflare:workers` inside functions. Client code must never import `#/lib/auth`, `#/db`, or `cloudflare:workers`.
3. **Input validation:** validate every server function input with Zod, in `.validator()`.
4. **Output:** never store or inject HTML. Strip line breaks from anything that goes in an email header.
5. **Dependencies:** check for vulnerable packages with `bun audit`.

## Response Process

1.  **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
2.  **Investigation**: The club officers/maintainers will investigate the issue to confirm the vulnerability.
3.  **Fix**: If confirmed, we will work on a patch in a private branch.
4.  **Disclosure**: Once the fix is deployed, we will credit you (if desired) and may publish a security advisory.

Thank you for helping keep the RHS Coding Club community safe!
