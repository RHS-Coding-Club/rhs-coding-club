/** Auth routes that send email, or check a password. Reads are never limited. */
const AUTH_WRITE =
  /^\/api\/auth\/(sign-in|sign-up|request-password-reset|send-verification-email|reset-password)(\/|$)/

export function isAuthWrite(method: string, pathname: string) {
  return method === 'POST' && AUTH_WRITE.test(pathname)
}

/**
 * True when this IP is over a Workers rate limit. Only Cloudflare sets
 * cf-connecting-ip (visitors can't), so local dev and tests are never limited.
 */
export async function isRateLimited(limiter: RateLimit, ip: string | null | undefined) {
  if (!ip) return false
  const { success } = await limiter.limit({ key: ip })
  return !success
}
