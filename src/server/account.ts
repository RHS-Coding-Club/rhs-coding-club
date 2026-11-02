import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders, setResponseHeader } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { getDb } from '#/db'
import { getAuth } from '#/lib/auth'
import { emailPrefsSchema, profileSchema } from '#/lib/schemas/account'
import { requireUser } from '#/server/auth'
import { getAccount, updateEmailPrefs, updateProfile } from '#/services/members'

/** The /account page: profile fields, email switches, and linked sign-in methods. */
export const getMyAccount = createServerFn({ method: 'GET' })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const data = await getAccount(getDb(), context.user.id)
    return {
      ...data,
      // Which providers this deployment can link (their secrets are set).
      providers: {
        google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
        github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      },
    }
  })

/**
 * Better Auth caches the session user in a cookie for a few minutes. After a
 * profile write, re-read the session past that cache and forward the fresh
 * cookie, so the header's name and avatar update on the next navigation.
 */
async function refreshSessionCookie() {
  const res = await getAuth().api.getSession({
    headers: getRequestHeaders(),
    query: { disableCookieCache: true },
    returnHeaders: true,
  })
  const cookies = res.headers.getSetCookie()
  if (cookies.length > 0) setResponseHeader('set-cookie', cookies)
}

export const saveProfile = createServerFn({ method: 'POST' })
  .middleware([requireUser])
  .validator(profileSchema)
  .handler(async ({ data, context }) => {
    await updateProfile(getDb(), context.user.id, data)
    await refreshSessionCookie()
    return { ok: true as const }
  })

export const saveEmailPrefs = createServerFn({ method: 'POST' })
  .middleware([requireUser])
  .validator(emailPrefsSchema)
  .handler(async ({ data, context }) => {
    await updateEmailPrefs(getDb(), context.user.id, data)
    return { ok: true as const }
  })
