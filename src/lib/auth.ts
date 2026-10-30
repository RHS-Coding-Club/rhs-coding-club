import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { env } from 'cloudflare:workers'
import { APIError } from 'better-auth/api'
import { count, eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { sendEmail } from '#/services/email'
import { renderEmail } from '#/services/email-templates'
import { ROLES, initialRoleFor, parseBootstrapAdmins } from '#/lib/roles'

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
      revokeSessionsOnPasswordReset: true,
      // Also how members imported from the old site claim their account: the
      // reset creates their first password, and the email proves they own it.
      // Not awaited, so response time doesn't reveal whether an email exists.
      sendResetPassword: async ({ user, url }) => {
        const { html, text } = renderEmail({
          preheader: 'Choose a new password for your RHS Coding Club account.',
          heading: 'Reset your password',
          paragraphs: [
            `Hi ${user.name.split(' ')[0] || user.name}, someone asked to set a new password for the RHS Coding Club account on this email.`,
            'The link works for one hour and only once.',
          ],
          cta: { label: 'Choose a new password', href: url },
          footer:
            "If you didn't ask for this, ignore this email. Your password won't change.",
        })
        void sendEmail(getDb(), {
          to: user.email,
          subject: 'Reset your RHS Coding Club password',
          html,
          text,
        })
      },
      onPasswordReset: async ({ user }) => {
        await getDb()
          .update(schema.user)
          .set({ emailVerified: true })
          .where(eq(schema.user.id, user.id))
      },
    },
    socialProviders,
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
          before: async (u) => ({
            data: { ...u, role: initialRoleFor(u.email, bootstrapAdmins) },
          }),
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
