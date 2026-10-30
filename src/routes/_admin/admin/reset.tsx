import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { ResetTool } from '#/components/admin/reset-tool'
import { hasRole } from '#/lib/roles'
import { getResetCounts } from '#/server/reset'

/** Admins only (the server functions check again). Officers are sent to the overview. */
export const Route = createFileRoute('/_admin/admin/reset')({
  beforeLoad: ({ context }) => {
    if (!hasRole(context.user.role, 'admin')) throw redirect({ to: '/admin' })
  },
  loader: () => getResetCounts(),
  head: () => ({ meta: [{ title: 'Reset data · Admin · RHS Coding Club' }] }),
  component: ResetPage,
})

function ResetPage() {
  const counts = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  return (
    <>
      <AdminPageHeader
        eyebrow="Danger zone"
        title="Reset data"
        description="Start a new school year, clear out demo content, or wipe the site. Pick a preset or choose exactly what goes, download a backup, then confirm."
      />
      <ResetTool counts={counts} initialDark={theme === 'dark'} />
    </>
  )
}
