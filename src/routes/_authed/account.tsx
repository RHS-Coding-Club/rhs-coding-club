import { createFileRoute } from '@tanstack/react-router'
import { AccountSettings } from '#/components/account/settings-cards'
import { getMyAccount } from '#/server/account'

export const Route = createFileRoute('/_authed/account')({
  loader: () => getMyAccount(),
  head: () => ({
    meta: [
      { title: 'Account settings · RHS Coding Club' },
      { name: 'description', content: 'Your profile, email, and sign-in settings.' },
    ],
  }),
  component: AccountPage,
})

function AccountPage() {
  const data = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  return <AccountSettings data={data} dark={theme === 'dark'} />
}
