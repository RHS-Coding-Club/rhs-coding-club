import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/blog')({
  head: () => ({ meta: [{ title: 'Blog · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Posts" title="Blog" />,
})
