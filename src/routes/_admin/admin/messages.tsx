import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/messages')({
  head: () => ({ meta: [{ title: 'Umessages · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Umessages" />,
})
