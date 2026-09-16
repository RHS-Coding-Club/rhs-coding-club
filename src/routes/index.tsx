import { createFileRoute } from '@tanstack/react-router'
import { getHome } from '#/server/public'

export const Route = createFileRoute('/')({
  loader: () => getHome(),
  component: Home,
})

/** Blank slate. The home page is being rebuilt one component at a time. */
function Home() {
  return (
    <main className="mx-auto max-w-7xl px-(--gutter) py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        RHS Coding Club
      </h1>
    </main>
  )
}
