import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/join')({
  head: () => ({ meta: [{ title: 'Join · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Membership" title="Join" />,
})
