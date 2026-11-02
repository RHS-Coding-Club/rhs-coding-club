import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { BackupManager } from '#/components/admin/backup-manager'
import { hasRole } from '#/lib/roles'
import { getBackups } from '#/server/backups'

/** Admins only (the server functions check again). Officers are sent to the overview. */
export const Route = createFileRoute('/_admin/admin/backups')({
  beforeLoad: ({ context }) => {
    if (!hasRole(context.user.role, 'admin')) throw redirect({ to: '/admin' })
  },
  loader: () => getBackups(),
  head: () => ({ meta: [{ title: 'Backups · Admin · RHS Coding Club' }] }),
  component: BackupsPage,
})

function BackupsPage() {
  const overview = Route.useLoaderData()
  return (
    <>
      <AdminPageHeader
        eyebrow="Site"
        title="Backups"
        description="Automatic copies of the club's data, in private storage. Passwords, sessions, and uploaded images aren't included."
      />
      <BackupManager overview={overview} />
    </>
  )
}
