import { env } from 'cloudflare:workers'
import type { TurnstileAction } from '#/lib/turnstile'

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * One Siteverify call. Anything other than a clean pass for this action on
 * this site is a failure, including Cloudflare being unreachable.
 */
export async function checkTurnstileToken(
  input: {
    secret: string
    token: string | null | undefined
    action: TurnstileAction
    hostname: string
    ip?: string | null
  },
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const { secret, token, action, hostname, ip } = input
  if (!token || token.length > 2048) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    const response = await fetcher(SITEVERIFY, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return false
    const result: { success?: boolean; action?: string; hostname?: string } =
      await response.json()
    return (
      result.success === true && result.action === action && result.hostname === hostname
    )
  } catch (err) {
    console.error('[turnstile] siteverify failed', err)
    return false
  }
}

/**
 * Whether this request may go ahead. A production build with no secret fails
 * closed, so a missing secret can't quietly remove the protection. Local dev
 * and tests have no widget, so they pass unless a secret is set.
 */
export async function passesTurnstile(
  action: TurnstileAction,
  token: string | null | undefined,
  ip?: string | null,
  production: boolean = import.meta.env.PROD,
): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET
  if (!secret) {
    if (production) console.error('[turnstile] TURNSTILE_SECRET is not set')
    return !production
  }
  return checkTurnstileToken({
    secret,
    token,
    action,
    hostname: new URL(env.APP_URL).hostname,
    ip,
  })
}
