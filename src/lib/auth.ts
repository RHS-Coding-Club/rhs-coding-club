import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins'
import { cimd } from '@better-auth/cimd'
import { mcp } from '@better-auth/mcp'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { env, waitUntil } from 'cloudflare:workers'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { and, count, eq, gt, like, lte, sql } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { canonicalMailbox } from '#/lib/email-address'
import { MCP_SCOPE, mcpResource } from '#/lib/mcp-config'
import { sendEmail } from '#/services/email'
import type { EmailMessage } from '#/services/email'
import { renderEmail, siteUrl } from '#/services/email-templates'
import {
  ROLES,
  hasRole,
  initialRoleFor,
  isRole,
  isBootstrapAdmin,
  parseBootstrapAdmins,
} from '#/lib/roles'
import { TURNSTILE_ACTIONS, TURNSTILE_FAILED, TURNSTILE_HEADER } from '#/lib/turnstile'
import type { TurnstileAction } from '#/lib/turnstile'
import { passesTurnstile } from '#/services/turnstile'

/** Reset links one account can have outstanding before more stop being emailed. */
const MAX_LIVE_RESETS = 3

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/**
 * Whether this address has had its allowance of this kind of mail. Anyone can
 * trigger these for any address, so without it the site's Gmail could be used
 * to flood a stranger. Counted in `verification`, which holds short-lived rows.
 */
async function overLimit(key: string, max: number, windowMs: number) {
  const db = getDb()
  const { verification: v } = schema
  const identifier = `email-throttle:${key}`
  const now = Date.now()
  await db
    .delete(v)
    .where(and(eq(v.identifier, identifier), lte(v.expiresAt, new Date(now))))
  // One statement, so requests at the same moment can't all pass the count.
  const inserted = await db.run(sql`
    INSERT INTO verification (id, identifier, value, expires_at, created_at, updated_at)
    SELECT ${crypto.randomUUID()}, ${identifier}, '1', ${now + windowMs}, ${now}, ${now}
    WHERE (SELECT count(*) FROM verification WHERE identifier = ${identifier}) < ${max}
  `)
  return inserted.meta.changes === 0
}

/** Sends mail the public can trigger, after the response so timing reveals nothing. */
function sendThrottled(
  limit: { kind: string; email: string; max: number; windowMs: number },
  message: EmailMessage,
) {
  const key = `${limit.kind}:${canonicalMailbox(limit.email)}`
  waitUntil(
    overLimit(key, limit.max, limit.windowMs).then((over) =>
      over ? undefined : sendEmail(getDb(), message, 'public').then(() => undefined),
    ),
  )
}

/**
 * Better Auth's link confirms on GET, and mail scanners open links. Send people
 * to a page where a person has to press the button instead.
 */
function confirmPageUrl(url: string) {
  const { searchParams } = new URL(url)
  const query = new URLSearchParams({
    token: searchParams.get('token') ?? '',
    next: searchParams.get('callbackURL') ?? '/join',
  })
  return siteUrl(`/verify-email?${query}`)
}

/**
 * Fetches a Client ID Metadata Document, the JSON an MCP client hosts to say who
 * it is. The URL comes from whoever starts a sign-in, so redirects are refused.
 * Workers can't reach private addresses, which covers the rest of what the CIMD
 * plugin asks of this function.
 */
function fetchClientMetadata(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, {
    ...init,
    redirect: 'manual',
    signal: init?.signal ?? AbortSignal.timeout(5000),
  })
}

// Server-only. Built lazily so bindings are read per isolate, never at import
// time on the client. `role` and `avatarKey` are Better Auth "additional
// fields" (read-only from the client, so they ride along on the session);
// everything else on the user row is managed by our own server functions.
//
// Sign-in and sign-up always go through the /api/auth/* handler, which sets
// cookies on its own response, so the TanStack Start cookies plugin is not
// used. That keeps this module importable inside the Workers test pool, which
// has no Start runtime. If a server function ever needs to call an auth
// mutation, forward its Set-Cookie header with setResponseHeaders instead.
const TURNSTILE_PATHS: Partial<Record<string, TurnstileAction>> = {
  '/sign-up/email': TURNSTILE_ACTIONS.signup,
  '/request-password-reset': TURNSTILE_ACTIONS.forgotPassword,
}

function createAuth() {
  const bootstrapAdmins = parseBootstrapAdmins(env.BOOTSTRAP_ADMIN_EMAILS)

  const socialProviders: Parameters<typeof betterAuth>[0]['socialProviders'] = {}
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }
  }
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }
  }

  return betterAuth({
    appName: 'RHS Coding Club',
    baseURL: env.APP_URL,
    // Extra origins allowed to call /api/auth (e.g. a second local dev port).
    trustedOrigins: (env.TRUSTED_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: 'sqlite', schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // No session until the address is confirmed. Sign-up also stops saying
      // whether an email is registered, so an existing owner hears it by email.
      requireEmailVerification: true,
      onExistingUserSignUp: async ({ user }) => {
        const { html, text } = renderEmail({
          preheader: 'You already have an RHS Coding Club account.',
          heading: 'You already have an account',
          paragraphs: [
            'Someone tried to sign up with this email, but it already has an RHS Coding Club account, maybe from the old club site.',
            'Log in, or choose a password if you never set one.',
          ],
          cta: { label: 'Choose a password', href: siteUrl('/forgot-password') },
          footer: "If this wasn't you, ignore this email. Nothing changed.",
        })
        sendThrottled(
          { kind: 'existing', email: user.email, max: 1, windowMs: DAY },
          {
            to: user.email,
            subject: 'You already have an RHS Coding Club account',
            html,
            text,
          },
        )
      },
      revokeSessionsOnPasswordReset: true,
      // Also how members imported from the old site claim their account: the
      // reset creates their first password, and the email proves they own it.
      // Not awaited, so response time doesn't reveal whether an email exists;
      // waitUntil keeps the Worker alive until the send finishes.
      sendResetPassword: async ({ user, url }) => {
        // Anyone can ask for a reset for any address; don't let them flood one
        // inbox or spend the club's daily allowance. Tokens still live count.
        const live = await getDb()
          .select({ n: count() })
          .from(schema.verification)
          .where(
            and(
              eq(schema.verification.value, user.id),
              like(schema.verification.identifier, 'reset-password:%'),
              gt(schema.verification.expiresAt, new Date()),
            ),
          )
          .then((rows) => rows.at(0)?.n ?? 0)
        if (live > MAX_LIVE_RESETS) return

        const { html, text } = renderEmail({
          preheader: 'Choose a new password for your RHS Coding Club account.',
          heading: 'Reset your password',
          paragraphs: [
            'Someone asked to set a new password for the RHS Coding Club account on this email.',
            'The link works for one hour and only once.',
          ],
          cta: { label: 'Choose a new password', href: url },
          footer:
            "If you didn't ask for this, ignore this email. Your password won't change.",
        })
        waitUntil(
          sendEmail(
            getDb(),
            {
              to: user.email,
              subject: 'Reset your RHS Coding Club password',
              html,
              text,
            },
            'reset',
          ),
        )
      },
      onPasswordReset: async ({ user }) => {
        await getDb()
          .update(schema.user)
          .set({ emailVerified: true })
          .where(eq(schema.user.id, user.id))
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      // A correct password on an unconfirmed account sends a fresh link.
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const { html, text } = renderEmail({
          preheader: 'One click and your RHS Coding Club account is ready.',
          heading: 'Confirm your email',
          paragraphs: [
            'Confirm this address to finish making your RHS Coding Club account.',
          ],
          cta: { label: 'Confirm my email', href: confirmPageUrl(url) },
          footer: "If you didn't sign up, ignore this email. No account gets activated.",
        })
        sendThrottled(
          { kind: 'confirm', email: user.email, max: 3, windowMs: HOUR },
          {
            to: user.email,
            subject: 'Confirm your RHS Coding Club email',
            html,
            text,
          },
        )
      },
    },
    socialProviders,
    hooks: {
      // These two send email to whatever address is typed, so bots are kept out
      // of them. Login isn't gated: it sends nothing and has its own rate limit.
      before: createAuthMiddleware(async (ctx) => {
        const action = TURNSTILE_PATHS[ctx.path]
        if (!action) return
        const passed = await passesTurnstile(
          action,
          ctx.headers?.get(TURNSTILE_HEADER),
          ctx.headers?.get('cf-connecting-ip'),
        )
        if (!passed) throw new APIError('FORBIDDEN', { message: TURNSTILE_FAILED })
      }),
    },
    plugins: [
      // Only signs MCP access tokens. Without this flag every session read
      // would sign a JWT nothing uses.
      jwt({ disableSettingJwtHeader: true }),
      mcp({
        loginPage: '/login',
        consentPage: '/consent',
        resource: mcpResource(),
        scopes: ['openid', 'offline_access', MCP_SCOPE],
        // Short, because a token can't be revoked before it expires. Clients
        // refresh silently, and refreshing checks the role again below.
        accessTokenExpiresIn: 15 * 60,
        // Apps identify themselves with a metadata document. Nobody manages
        // clients through the API, where any signed-in guest could make one.
        clientPrivileges: () => false,
        // Anyone can start a sign-in, but only officers ever get a token. The
        // MCP endpoint checks the role again on every request.
        customAccessTokenClaims: async ({ user }) => {
          const row = user?.id
            ? await getDb().query.user.findFirst({
                where: eq(schema.user.id, user.id),
                columns: { role: true },
              })
            : undefined
          if (!hasRole(isRole(row?.role) ? row.role : null, 'officer'))
            throw new APIError('FORBIDDEN', {
              message: 'Only officers and admins can use the MCP server.',
            })
          return {}
        },
      }),
      cimd({
        fetchClientMetadataResource: fetchClientMetadata,
        metadataProfile: 'mcp-2026-07-28',
      }),
    ],
    account: {
      accountLinking: { enabled: true, trustedProviders: ['google', 'github'] },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    user: {
      additionalFields: {
        role: {
          type: [...ROLES],
          required: false,
          defaultValue: 'guest',
          input: false,
        },
        avatarKey: { type: 'string', required: false, input: false },
      },
      deleteUser: {
        enabled: true,
        // The club must always keep one admin; the last one hands the role
        // to someone else before leaving.
        beforeDelete: async (u) => {
          const role = (u as { role?: unknown }).role
          if (role !== 'admin') return
          const row = await getDb()
            .select({ n: count() })
            .from(schema.user)
            .where(eq(schema.user.role, 'admin'))
            .then((rows) => rows.at(0))
          if ((row?.n ?? 0) <= 1) {
            throw new APIError('BAD_REQUEST', {
              message:
                'You are the only admin. Make someone else an admin before deleting your account.',
            })
          }
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (u) => {
            // Otherwise a stranger could sit on a listed address, and the real
            // admin's provider sign-in couldn't link to an unverified account.
            if (!u.emailVerified && isBootstrapAdmin(u.email, bootstrapAdmins))
              throw new APIError('FORBIDDEN', {
                message: 'Could not create that account.',
              })
            return {
              data: {
                ...u,
                role: initialRoleFor(u.email, bootstrapAdmins, u.emailVerified),
              },
            }
          },
        },
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>

let cached: Auth | undefined

export function getAuth(): Auth {
  cached ??= createAuth()
  return cached
}
