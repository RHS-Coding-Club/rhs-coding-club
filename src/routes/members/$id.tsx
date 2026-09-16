import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/members/$id')({
  head: () => ({ meta: [{ title: 'Member · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Profile" title="Member" />,
})
