import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/events')({
  head: () => ({ meta: [{ title: 'Uevents · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Uevents" />,
})
