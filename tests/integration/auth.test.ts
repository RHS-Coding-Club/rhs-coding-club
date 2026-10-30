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

  it('grants admin to bootstrap emails on first sign-in', async () => {
    const created = await signUp('admin@test.local', 'Ada')
    const row = await getDb().query.user.findFirst({
      where: eq(schema.user.id, created.id),
    })
    expect(row?.role).toBe('admin')
  })

  it('exposes role on the session', async () => {
    const auth = getAuth()
    const signIn = await auth.api.signInEmail({
      body: { email: 'admin@test.local', password: 'password123' },
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
