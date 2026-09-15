import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/projects')({
  head: () => ({ meta: [{ title: 'Uprojects · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Uprojects" />,
})
