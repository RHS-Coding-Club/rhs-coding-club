/**
 * Sent on every response. Scripts allow 'unsafe-inline' because TanStack Start
 * streams inline bootstrap scripts during SSR; React escapes what it renders
 * and rich text goes through an allow-list, so this is a second line of defense.
 * Images allow any https host for Google and GitHub avatars and external project
 * screenshots.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  // Turnstile draws its check in a frame.
  'frame-src https://challenges.cloudflare.com',
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

export function withSecurityHeaders(response: Response, csp = true) {
  const secured = new Response(response.body, response)
  const { headers } = secured
  if (csp) headers.set('content-security-policy', CONTENT_SECURITY_POLICY)
  headers.set('strict-transport-security', 'max-age=31536000')
  headers.set('x-frame-options', 'DENY')
  headers.set('x-content-type-options', 'nosniff')
  headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
  return secured
}
