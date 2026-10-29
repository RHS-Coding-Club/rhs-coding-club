import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { getAuth } from '#/lib/auth'
import { hasRole, isRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'

export interface SessionUser {
  id: string
  name: string
  email: string
  image: string | null
  /** R2 key of an uploaded avatar; render with `avatarUrl(user)`. */
  avatarKey: string | null
  role: Role
}

export class AuthError extends Error {
  constructor(
    public readonly code: 'UNAUTHORIZED' | 'FORBIDDEN',
    message?: string,
  ) {
    super(message ?? code)
    this.name = 'AuthError'
  }
}

async function readSessionUser(): Promise<SessionUser | null> {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() })
  if (!session) return null
  // The session comes from a 5-minute cookie cache, so role and avatar are
  // re-read from the user row: a promotion, demotion, or new avatar applies on
  // the very next request instead of when the cache expires.
  const row = await getDb().query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
    columns: { name: true, image: true, role: true, avatarKey: true },
  })
  if (!row) return null
  return {
    id: session.user.id,
    name: row.name,
    email: session.user.email,
    image: row.image ?? null,
    avatarKey: row.avatarKey ?? null,
    // Read defensively so a bad value can never grant more than guest.
    role: isRole(row.role) ? row.role : 'guest',
  }
}

/** The signed-in user, or null. Safe to call from any loader. */
export const getSessionUser = createServerFn({ method: 'GET' }).handler(readSessionUser)

/** Server-function middleware: rejects anonymous callers, exposes `context.user`. */
export const requireUser = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const user = await readSessionUser()
    if (!user) throw new AuthError('UNAUTHORIZED')
    return next({ context: { user } })
  },
)

/** Server-function middleware factory: requires `minimum` role or higher. */
export function requireRole(minimum: Role) {
  return createMiddleware({ type: 'function' })
    .middleware([requireUser])
    .server(async ({ next, context }) => {
      if (!hasRole(context.user.role, minimum)) throw new AuthError('FORBIDDEN')
      return next({ context: { user: context.user } })
    })
}

export const requireMember = requireRole('member')
export const requireOfficer = requireRole('officer')
export const requireAdmin = requireRole('admin')
