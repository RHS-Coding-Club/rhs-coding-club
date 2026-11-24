import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/legal/legal-page'
import { PRIVACY } from '#/components/legal/privacy-doc'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy · RHS Coding Club' },
      {
        name: 'description',
        content:
          'What the RHS Coding Club website collects, where it is stored, who can see it, and how to delete it.',
      },
      { property: 'og:title', content: 'Privacy · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Plain-language privacy notice for the RHS Coding Club website.',
      },
    ],
  }),
  component: PrivacyPage,
})

// The wording lives in src/components/legal/privacy-doc.tsx.
function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />
}
