import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/users')({
  head: () => ({ meta: [{ title: 'Uusers · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Uusers" />,
})
