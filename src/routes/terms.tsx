import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Legal" title="Terms" />,
})
