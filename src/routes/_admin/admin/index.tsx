import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { ADMIN_NAV } from '#/components/admin/admin-nav'
import { hasRole } from '#/lib/roles'
import { cn } from '#/lib/utils'

const admin = getRouteApi('/_admin')

export const Route = createFileRoute('/_admin/admin/')({
  head: () => ({ meta: [{ title: 'Admin · RHS Coding Club' }] }),
  component: AdminHome,
})

/** What each section is for, under its name on the overview. */
const BLURB: Partial<Record<(typeof ADMIN_NAV)[number]['to'], string>> = {
  '/admin/applications': 'Membership requests to approve',
  '/admin/submissions': 'Challenge solutions to grade',
  '/admin/projects': 'Showcase entries to approve',
  '/admin/github': 'Org invites to send',
  '/admin/messages': 'Unread contact form messages',
  '/admin/challenges': 'Write and schedule weekly problems',
  '/admin/events': 'Meetings, RAP days, attendance',
  '/admin/blog': 'Posts and drafts',
  '/admin/resources': 'Links on the resources page',
  '/admin/badges': 'Badge rules and awards',
  '/admin/newsletter': 'Write and send issues',
  '/admin/users': 'Roles and accounts',
  '/admin/officers': 'Who shows on the about page',
  '/admin/settings': 'Points, email, club details',
}

function AdminHome() {
  const counts = admin.useLoaderData()
  const { user } = admin.useRouteContext()
  const pages = ADMIN_NAV.filter(
    (item) =>
      item.to !== '/admin' && (!('minRole' in item) || hasRole(user.role, item.minRole)),
  )
  const queues = pages.filter((p) => 'queue' in p)
  const rest = pages.filter((p) => !('queue' in p))
  const total = queues.reduce((s, q) => s + ('queue' in q ? counts[q.queue] : 0), 0)

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title={
          total === 0
            ? 'All caught up.'
            : `${total} thing${total === 1 ? '' : 's'} waiting.`
        }
        description="Pending work across every queue. Everything else is in the dock at the bottom of the screen."
      />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {queues.map((q) => {
          const n = 'queue' in q ? counts[q.queue] : 0
          const Icon = q.icon
          return (
            <li key={q.to}>
              <Link
                to={q.to}
                className={cn(
                  'group ring-border/70 hover:ring-foreground/25 flex h-full flex-col rounded-3xl p-5 ring-1 transition-shadow',
                  n > 0 && 'ring-brand-sky/50',
                )}
                style={{ background: 'var(--bits-surface)' }}
              >
                <span className="flex items-center justify-between">
                  <Icon
                    className={cn(
                      'size-5',
                      n > 0 ? 'text-brand-sky' : 'text-muted-foreground',
                    )}
                    aria-hidden="true"
                  />
                  <ArrowUpRight
                    className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={cn(
                    'tabular mt-6 font-mono text-4xl font-medium tracking-tight',
                    n === 0 && 'text-muted-foreground/60',
                  )}
                >
                  {n}
                </span>
                <span className="mt-1 font-medium">{q.label}</span>
                <span className="text-muted-foreground mt-0.5 text-xs">
                  {BLURB[q.to]}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <h2 className="mt-12 mb-4 text-lg font-semibold tracking-[-0.02em]">Manage</h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => {
          const Icon = p.icon
          return (
            <li key={p.to}>
              <Link
                to={p.to}
                className="hover:bg-muted/60 ring-border/70 flex items-center gap-4 rounded-2xl p-4 ring-1 transition-colors"
              >
                <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{p.label}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {BLURB[p.to]}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
