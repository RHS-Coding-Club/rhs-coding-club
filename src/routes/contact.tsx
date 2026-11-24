import { createFileRoute } from '@tanstack/react-router'
import { ContactHelpDesk } from '#/components/contact/help-desk'
import { getContactInfo } from '#/server/contact'

export const Route = createFileRoute('/contact')({
  loader: () => getContactInfo(),
  head: () => ({
    meta: [
      { title: 'Contact · RHS Coding Club' },
      {
        name: 'description',
        content:
          'Questions about joining, the Ripon Afterschool Program, or the H2O hackathon? Send the RHS Coding Club officers a message.',
      },
      { property: 'og:title', content: 'Contact · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Send the RHS Coding Club officers a message.',
      },
    ],
  }),
  component: ContactPage,
})

function ContactPage() {
  const data = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  return (
    <ContactHelpDesk
      data={data}
      dark={theme === 'dark'}
      defaults={user ? { name: user.name, email: user.email } : undefined}
    />
  )
}
