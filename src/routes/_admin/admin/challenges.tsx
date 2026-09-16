import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/challenges')({
  head: () => ({ meta: [{ title: 'Uchallenges · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Uchallenges" />,
})
