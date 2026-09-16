import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/events')({
  head: () => ({ meta: [{ title: 'Events · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Meetings and more" title="Events" />,
})
