import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Who we are" title="About" />,
})
