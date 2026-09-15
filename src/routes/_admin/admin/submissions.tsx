import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/_admin/admin/submissions')({
  head: () => ({ meta: [{ title: 'Usubmissions · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Admin" title="Usubmissions" />,
})
