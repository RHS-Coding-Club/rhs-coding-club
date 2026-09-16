import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

/** Pathless layout: everything under it requires a signed-in user of any role. */
export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user: context.user }
  },
  component: Outlet,
})
