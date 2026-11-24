import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/legal/legal-page'
import { TERMS } from '#/components/legal/terms-doc'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms · RHS Coding Club' },
      {
        name: 'description',
        content:
          'The ground rules for using the RHS Coding Club website: accounts, your work, points, and how to treat each other.',
      },
      { property: 'og:title', content: 'Terms · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Plain-language terms of use for the RHS Coding Club website.',
      },
    ],
  }),
  component: TermsPage,
})

// The wording lives in src/components/legal/terms-doc.tsx.
function TermsPage() {
  return <LegalPage doc={TERMS} />
}
