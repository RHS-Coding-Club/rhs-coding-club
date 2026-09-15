import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/newsletter')({
  head: () => ({ meta: [{ title: 'Unewsletter · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Unewsletter" />,
})
