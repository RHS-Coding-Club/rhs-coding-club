import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getAuth } from '#/lib/auth'
import { hasRole, isRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'

export interface SessionUser {
  id: string
  name: string
  email: string
  image: string | null
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
  const { user } = session
  // `role` is an additional field; read it defensively so a bad value can
  // never grant more than guest.
  const role = (user as { role?: unknown }).role
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: isRole(role) ? role : 'guest',
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
