// Roles are ordered. A check for "officer" passes for admins too.
export const ROLES = ['guest', 'member', 'officer', 'admin'] as const
export type Role = (typeof ROLES)[number]

const RANK: Record<Role, number> = { guest: 0, member: 1, officer: 2, admin: 3 }

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/** True when `role` is at least `minimum` in the guest < member < officer < admin order. */
export function hasRole(role: Role | null | undefined, minimum: Role): boolean {
  if (!role) return false
  return RANK[role] >= RANK[minimum]
}

/** Parse the BOOTSTRAP_ADMIN_EMAILS env var into a lowercase set. */
export function parseBootstrapAdmins(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function initialRoleFor(email: string, bootstrapAdmins: Set<string>): Role {
  return bootstrapAdmins.has(email.trim().toLowerCase()) ? 'admin' : 'guest'
}
