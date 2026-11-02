import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { hasRole } from '#/lib/roles'
import { getOverview } from '#/server/admin'
import { AdminDock } from '#/components/admin/admin-dock'

/**
 * Pathless layout: officers and admins only. Pages get the full width; the
 * navigation is a dock pinned to the bottom of the screen, badged with the
 * queue counts (reloaded whenever a page invalidates the router).
 */
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
  loader: () => getOverview(),
  component: AdminShell,
})

function AdminShell() {
  const { user, theme } = Route.useRouteContext()
  const counts = Route.useLoaderData()

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-36 sm:px-6">
        <Outlet />
      </div>
      <AdminDock role={user.role} counts={counts} initialDark={theme === 'dark'} />
    </>
  )
}
