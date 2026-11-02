/** Auth routes that send email, or check a password. Reads are never limited. */
const AUTH_WRITE =
  /^\/api\/auth\/(sign-in|sign-up|request-password-reset|send-verification-email|reset-password)(\/|$)/

export function isAuthWrite(method: string, pathname: string) {
  return method === 'POST' && AUTH_WRITE.test(pathname)
}

/**
 * MCP sign-in: tokens, consent, and authorize, which can fetch a client's
 * metadata. Limited apart from the routes above, so an app can't use up the
 * attempts someone on the same network needs to log in to the site.
 */
export function isOAuthRoute(pathname: string) {
  return pathname.startsWith('/api/auth/oauth2/')
}

/**
 * True when this IP or user is over a Workers rate limit. Only Cloudflare sets
 * cf-connecting-ip (visitors can't), so local dev and tests have no IP limits.
 */
export async function isRateLimited(limiter: RateLimit, key: string | null | undefined) {
  if (!key) return false
  const { success } = await limiter.limit({ key })
  return !success
}
