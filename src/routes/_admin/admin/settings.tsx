import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/settings')({
  head: () => ({ meta: [{ title: 'Usettings · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Usettings" />,
})
