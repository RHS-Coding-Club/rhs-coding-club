import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/applications')({
  head: () => ({ meta: [{ title: 'Uapplications · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Uapplications" />,
})
