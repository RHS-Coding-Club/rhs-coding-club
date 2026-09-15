import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { env } from 'cloudflare:workers'
import { getDb, schema } from '#/db'
import { ROLES, initialRoleFor, parseBootstrapAdmins } from '#/lib/roles'

// Server-only. Built lazily so bindings are read per isolate, never at import
// time on the client. The role column is the only Better Auth "additional
// field": everything else on the user row is managed by our own server functions.
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
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: 'sqlite', schema }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
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
