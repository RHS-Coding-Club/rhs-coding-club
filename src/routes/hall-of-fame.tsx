import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '#/components/placeholder-page'

export const Route = createFileRoute('/hall-of-fame')({
  head: () => ({ meta: [{ title: 'Hall of Fame · RHS Coding Club' }] }),
  component: () => <PlaceholderPage eyebrow="Badges" title="Hall of Fame" />,
})
