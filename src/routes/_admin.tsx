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
      {/* Bottom room for the fixed dock (and the home indicator on phones), so the
          last row of every page scrolls clear of it. Admin is a tool used all day:
          the wheel scrolls natively (no Lenis smoothing) and icons hold still. */}
      <div
        data-lenis-prevent
        data-calm-icons
        className="mx-auto w-full max-w-7xl px-4 pt-6 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] sm:px-6"
      >
        <Outlet />
      </div>
      <AdminDock role={user.role} counts={counts} initialDark={theme === 'dark'} />
    </>
  )
}
