import { describe, expect, it } from 'vitest'
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

describe('sign-up and roles', () => {
  it('creates a user with the guest role by default', async () => {
    const created = await signUp('newbie@test.local')
    const row = await getDb().query.user.findFirst({
      where: eq(schema.user.id, created.id),
    })
    expect(row?.role).toBe('guest')
    expect(row?.email).toBe('newbie@test.local')
  })

  it('does not grant admin for a bootstrap email from a password sign-up', async () => {
    const created = await signUp('admin@test.local', 'Fake Ada')
    const row = await getDb().query.user.findFirst({
      where: eq(schema.user.id, created.id),
    })
    expect(row?.role).toBe('guest')
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

  it('rejects duplicate emails', async () => {
    await expect(signUp('admin@test.local')).rejects.toThrow()
  })
})
