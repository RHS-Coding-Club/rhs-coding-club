import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/blog')({
  head: () => ({ meta: [{ title: 'Ublog · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Ublog" />,
})
