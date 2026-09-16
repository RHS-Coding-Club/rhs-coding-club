import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard · RHS Coding Club' }] }),
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Dashboard</p>
      <h1 className="font-display mt-2 text-5xl">Hey, {user.name.split(' ')[0]}.</h1>
      <p className="text-muted-foreground mt-3">
        Signed in as <span className="font-mono text-sm">{user.email}</span> with role{' '}
        <span className="font-mono text-sm">{user.role}</span>.
      </p>
    </section>
  )
}
