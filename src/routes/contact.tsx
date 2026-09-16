import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Say hi" title="Contact" />,
})
