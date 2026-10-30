import { describe, expect, it } from 'vitest'
import { hasRole, initialRoleFor, isRole, parseBootstrapAdmins } from '#/lib/roles'

describe('hasRole', () => {
  it('orders guest < member < officer < admin', () => {
    expect(hasRole('guest', 'member')).toBe(false)
    expect(hasRole('member', 'member')).toBe(true)
    expect(hasRole('officer', 'member')).toBe(true)
    expect(hasRole('admin', 'officer')).toBe(true)
    expect(hasRole('officer', 'admin')).toBe(false)
  })

  it('rejects missing roles', () => {
    expect(hasRole(null, 'guest')).toBe(false)
    expect(hasRole(undefined, 'guest')).toBe(false)
  })
})

describe('isRole', () => {
  it('accepts only known roles', () => {
    expect(isRole('admin')).toBe(true)
    expect(isRole('superuser')).toBe(false)
    expect(isRole(42)).toBe(false)
  })
})

describe('bootstrap admins', () => {
  it('parses a messy comma list case-insensitively', () => {
    const set = parseBootstrapAdmins(' Ada@Example.com , ,bob@example.com')
    expect(set).toEqual(new Set(['ada@example.com', 'bob@example.com']))
  })

  it('assigns admin only to listed emails', () => {
    const admins = parseBootstrapAdmins('ada@example.com')
    expect(initialRoleFor('ADA@example.com', admins)).toBe('admin')
    expect(initialRoleFor('someone@example.com', admins)).toBe('guest')
  })

  it('handles an unset env var', () => {
    expect(parseBootstrapAdmins(undefined).size).toBe(0)
  })
})
