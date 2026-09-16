import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/challenges')({
  head: () => ({ meta: [{ title: 'Challenges · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Weekly" title="Challenges" />,
})
