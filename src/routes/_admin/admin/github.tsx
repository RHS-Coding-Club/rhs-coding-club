import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/github')({
  head: () => ({ meta: [{ title: 'Ugithub · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Ugithub" />,
})
