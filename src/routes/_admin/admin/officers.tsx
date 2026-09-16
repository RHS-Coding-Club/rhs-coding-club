import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/officers')({
  head: () => ({ meta: [{ title: 'Uofficers · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Uofficers" />,
})
