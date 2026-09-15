import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/leaderboard')({
  head: () => ({ meta: [{ title: 'Leaderboard · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Points" title="Leaderboard" />,
})
