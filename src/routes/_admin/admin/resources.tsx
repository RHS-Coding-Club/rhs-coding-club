import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/resources')({
  head: () => ({ meta: [{ title: 'Uresources · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Uresources" />,
})
