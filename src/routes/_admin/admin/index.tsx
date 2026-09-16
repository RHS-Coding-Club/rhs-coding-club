import { Link, createFileRoute } from '@tanstack/react-router'
import { getOverview } from '#/server/admin'
import { AdminPageHeader } from '#/components/admin/admin-page-header'

export const Route = createFileRoute('/_admin/admin/')({
  loader: () => getOverview(),
  head: () => ({ meta: [{ title: 'Admin · RHS Coding Club' }] }),
  component: AdminHome,
})

function AdminHome() {
  const o = Route.useLoaderData()
  const queues = [
    { label: 'Applications', n: o.pendingApplications, to: '/admin/applications' },
    { label: 'Submissions to review', n: o.pendingSubmissions, to: '/admin/submissions' },
    { label: 'Projects to approve', n: o.pendingProjects, to: '/admin/projects' },
    { label: 'GitHub requests', n: o.pendingGithubRequests, to: '/admin/github' },
    { label: 'Unread messages', n: o.unreadMessages, to: '/admin/messages' },
  ] as const
  const total = queues.reduce((s, q) => s + q.n, 0)

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title={
          total === 0
            ? 'All caught up.'
            : `${total} thing${total === 1 ? '' : 's'} waiting.`
        }
        description="Pending work across every queue. Click a row to open it."
      />
      <ul className="divide-border border-border divide-y rounded-lg border">
        {queues.map((q) => (
          <li key={q.to}>
            <Link
              to={q.to}
              className="hover:bg-muted/60 flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <span>{q.label}</span>
              <span
                className={
                  q.n > 0
                    ? 'bg-primary text-primary-foreground tabular rounded-full px-2 py-0.5 font-mono text-xs'
                    : 'text-muted-foreground tabular font-mono text-xs'
                }
              >
                {q.n}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
