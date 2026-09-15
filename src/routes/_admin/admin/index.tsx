import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/admin/')({
  head: () => ({ meta: [{ title: 'Admin · RHS Coding Club' }] }),
  component: AdminHome,
})

function AdminHome() {
  const { user } = Route.useRouteContext()
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Admin</p>
      <h1 className="font-display mt-2 text-5xl">Overview</h1>
      <p className="text-muted-foreground mt-3">
        You're here as <span className="font-mono text-sm">{user.role}</span>. Queues and
        management pages land in phase 4.
      </p>
    </section>
  )
}
