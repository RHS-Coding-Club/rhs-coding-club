import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/projects')({
  head: () => ({ meta: [{ title: 'Projects · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Member showcase" title="Projects" />,
})
