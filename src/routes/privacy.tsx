import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Legal" title="Privacy" />,
})
