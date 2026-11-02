import { describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { eq } from 'drizzle-orm'
import { getAuth } from '#/lib/auth'
import { getDb, schema } from '#/db'

async function signUp(email: string, name = 'Test User') {
  const auth = getAuth()
  const res = await auth.api.signUpEmail({
    body: { email, name, password: 'password123' },
  })
  return res.user
}

/** What the console fallback logged with this subject. */
const mails = (log: MockInstance, subject: string) =>
  log.mock.calls.filter((c) => String(c[0]).includes(subject))

describe('sign-up and roles', () => {
  it('creates a user with the guest role by default', async () => {
    const created = await signUp('newbie@test.local')
    const row = await getDb().query.user.findFirst({
      where: eq(schema.user.id, created.id),
    })
    expect(row?.role).toBe('guest')
    expect(row?.email).toBe('newbie@test.local')
  })

  it('refuses a password sign-up on a bootstrap email without saying why', async () => {
    await signUp('admin@test.local', 'Fake Ada')
    const row = await getDb().query.user.findFirst({
      where: eq(schema.user.email, 'admin@test.local'),
    })
    expect(row).toBeUndefined()
  })

  it('needs a confirmed email before a password sign-in works', async () => {
    const auth = getAuth()
    const u = await signUp('unconfirmed@test.local')
    const body = { email: u.email, password: 'password123' }
    await expect(auth.api.signInEmail({ body })).rejects.toThrow(/not verified/i)
    await getDb()
      .update(schema.user)
      .set({ emailVerified: true })
      .where(eq(schema.user.id, u.id))
    await expect(auth.api.signInEmail({ body })).resolves.toMatchObject({
      user: { email: u.email },
    })
  })

  it('emails a confirmation link on sign-up, and a notice to an existing owner', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const first = await signUp('twice@test.local')
    await vi.waitFor(() =>
      expect(mails(log, 'Confirm your RHS Coding Club email')).toHaveLength(1),
    )
    // The same request again gets the same answer, no error, and no new account.
    const again = await signUp('twice@test.local')
    expect(again.id).not.toBe(first.id)
    await vi.waitFor(() =>
      expect(mails(log, 'You already have an RHS Coding Club account')).toHaveLength(1),
    )
    log.mockRestore()
    const rows = await getDb()
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, 'twice@test.local'))
    expect(rows).toHaveLength(1)
  })

  it('limits how much mail anyone can trigger for one address', async () => {
    const auth = getAuth()
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const u = await signUp('flooded@test.local')
    const body = { email: u.email, password: 'password123' }
    // Each failed login with the right password asks for a fresh link.
    for (let i = 0; i < 5; i++)
      await auth.api.signInEmail({ body }).catch(() => undefined)
    for (let i = 0; i < 3; i++) await signUp(u.email)
    await vi.waitFor(() => {
      expect(mails(log, 'Confirm your RHS Coding Club email')).toHaveLength(3)
      expect(
        mails(log, 'You already have an RHS Coding Club account').filter((c) =>
          String(c[0]).includes('flooded@test.local'),
        ),
      ).toHaveLength(1)
    })
    // The link goes to the page with a button, not straight to the GET endpoint.
    expect(String(mails(log, 'Confirm your')[0]?.[0])).toContain('/verify-email?token=')
    log.mockRestore()
  })

  it('stops emailing reset links once an account has several outstanding', async () => {
    const auth = getAuth()
    const u = await signUp('forgetful@test.local')
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    for (let i = 0; i < 6; i++)
      await auth.api.requestPasswordReset({ body: { email: u.email } })
    await vi.waitFor(() =>
      expect(mails(log, 'Reset your RHS Coding Club password')).toHaveLength(3),
    )
    log.mockRestore()
  })

  it('grants admin to a bootstrap email a provider verified, and exposes it on the session', async () => {
    const auth = getAuth()
    const ctx = await auth.$context
    const created = await ctx.internalAdapter.createUser(
      { email: 'ada@admin.test', name: 'Ada', emailVerified: true },
      { method: 'oauth', oauth: { providerId: 'github' } },
    )
    expect((created as { role?: string }).role).toBe('admin')
    await ctx.internalAdapter.linkAccount({
      userId: created.id,
      providerId: 'credential',
      accountId: created.id,
      password: await ctx.password.hash('password123'),
    })
    const signIn = await auth.api.signInEmail({
      body: { email: 'ada@admin.test', password: 'password123' },
      asResponse: true,
    })
    const cookie = signIn.headers.get('set-cookie') ?? ''
    const session = await auth.api.getSession({ headers: new Headers({ cookie }) })
    expect((session?.user as { role?: string } | undefined)?.role).toBe('admin')
  })
})
