import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { hasRole } from '#/lib/roles'

/** Pathless layout: officers and admins only. Guests and members are sent home. */
export const Route = createFileRoute('/_admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    if (!hasRole(context.user.role, 'officer')) {
      throw redirect({ to: '/dashboard' })
    }
    return { user: context.user }
  },
  component: Outlet,
})
