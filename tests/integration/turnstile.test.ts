import { describe, expect, it, vi } from 'vitest'
import { env } from 'cloudflare:test'
import { CONTENT_SECURITY_POLICY } from '#/lib/security-headers'
import { checkTurnstileToken, passesTurnstile } from '#/services/turnstile'

const input = {
  secret: 'secret',
  token: 'token',
  action: 'contact' as const,
  hostname: 'rhs.example',
}
const answering = (body: unknown, status = 200) =>
  vi.fn(() => Promise.resolve(Response.json(body, { status }))) as unknown as typeof fetch
const pass = { success: true, action: 'contact', hostname: 'rhs.example' }

describe('checkTurnstileToken', () => {
  it('accepts a clean pass and sends the secret, token, and IP', async () => {
    const fetcher = vi.fn(answering(pass))
    expect(await checkTurnstileToken({ ...input, ip: '1.2.3.4' }, fetcher)).toBe(true)
    const body = fetcher.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(Object.fromEntries(body)).toEqual({
      secret: 'secret',
      response: 'token',
      remoteip: '1.2.3.4',
    })
  })

  it.each([
    ['failure', { ...pass, success: false }],
    ['another form', { ...pass, action: 'signup' }],
    ['another site', { ...pass, hostname: 'evil.example' }],
    ['an empty answer', {}],
  ])('rejects %s', async (_name, body) => {
    expect(await checkTurnstileToken(input, answering(body))).toBe(false)
  })

  it('rejects when Cloudflare errors or is unreachable', async () => {
    expect(await checkTurnstileToken(input, answering(pass, 500))).toBe(false)
    const offline = vi.fn(() => Promise.reject(new Error('offline')))
    expect(await checkTurnstileToken(input, offline as unknown as typeof fetch)).toBe(
      false,
    )
  })

  it('rejects a missing or oversized token without calling Cloudflare', async () => {
    const fetcher = vi.fn(answering(pass))
    for (const token of [undefined, null, '', 'x'.repeat(2049)])
      expect(await checkTurnstileToken({ ...input, token }, fetcher)).toBe(false)
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('passesTurnstile with no secret', () => {
  it('fails closed in a production build', async () => {
    expect(env.TURNSTILE_SECRET).toBeFalsy()
    expect(await passesTurnstile('contact', 'token', null, true)).toBe(false)
  })

  it('lets local dev and tests through', async () => {
    expect(await passesTurnstile('contact', undefined, null, false)).toBe(true)
  })
})

describe('the content security policy', () => {
  it('lets the widget load', () => {
    expect(CONTENT_SECURITY_POLICY).toMatch(/script-src[^;]*challenges\.cloudflare\.com/)
    expect(CONTENT_SECURITY_POLICY).toMatch(/frame-src[^;]*challenges\.cloudflare\.com/)
  })
})
