import { describe, expect, it } from 'vitest'
import { canonicalMailbox } from '#/lib/email-address'
import { isAuthWrite, isOAuthRoute } from '#/lib/rate-limit'
import { CONTENT_SECURITY_POLICY, withSecurityHeaders } from '#/lib/security-headers'

describe('canonicalMailbox', () => {
  it('folds aliases that reach one Gmail inbox', () => {
    const same = ['n.ame+1@gmail.com', 'NAME@gmail.com', 'na.me+x@googlemail.com']
    expect(new Set(same.map(canonicalMailbox))).toEqual(new Set(['name@gmail.com']))
  })

  it('keeps dots elsewhere, where they can be different people', () => {
    expect(canonicalMailbox('a.b+c@school.org')).toBe('a.b@school.org')
  })
})

describe('isAuthWrite', () => {
  it('covers password checks and routes that send email', () => {
    expect(isAuthWrite('POST', '/api/auth/sign-in/email')).toBe(true)
    expect(isAuthWrite('POST', '/api/auth/sign-up/email')).toBe(true)
    expect(isAuthWrite('POST', '/api/auth/request-password-reset')).toBe(true)
    expect(isAuthWrite('POST', '/api/auth/send-verification-email')).toBe(true)
  })

  it('leaves reads and OAuth callbacks alone', () => {
    expect(isAuthWrite('GET', '/api/auth/get-session')).toBe(false)
    expect(isAuthWrite('GET', '/api/auth/callback/github')).toBe(false)
    expect(isAuthWrite('POST', '/api/auth/sign-out')).toBe(false)
  })
})

describe('isOAuthRoute', () => {
  it('covers MCP sign-in, apart from the limit on site logins', () => {
    expect(isOAuthRoute('/api/auth/oauth2/token')).toBe(true)
    expect(isOAuthRoute('/api/auth/oauth2/authorize')).toBe(true)
    expect(isAuthWrite('POST', '/api/auth/oauth2/token')).toBe(false)
    expect(isOAuthRoute('/api/auth/sign-in/email')).toBe(false)
  })
})

describe('withSecurityHeaders', () => {
  it('adds the headers and keeps the response', async () => {
    const res = withSecurityHeaders(
      new Response('hi', { status: 201, headers: { etag: 'x' } }),
    )
    expect(res.status).toBe(201)
    expect(res.headers.get('etag')).toBe('x')
    expect(res.headers.get('content-security-policy')).toBe(CONTENT_SECURITY_POLICY)
    expect(res.headers.get('x-frame-options')).toBe('DENY')
    expect(await res.text()).toBe('hi')
  })

  it('can skip only the CSP, and handles an empty 304', () => {
    const res = withSecurityHeaders(new Response(null, { status: 304 }), false)
    expect(res.headers.get('content-security-policy')).toBeNull()
    expect(res.headers.get('x-frame-options')).toBe('DENY')
  })
})
