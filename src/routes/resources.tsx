import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/resources')({
  head: () => ({ meta: [{ title: 'Resources · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Learn" title="Resources" />,
})
