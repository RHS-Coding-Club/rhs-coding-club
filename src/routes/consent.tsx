import { useState } from 'react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { AuthLayout } from '#/components/auth/auth-layout'
import { RaisedButton } from '#/components/raised-button'
import { getConsentInfo } from '#/server/mcp'
import { getClubPulse } from '#/server/public'

// Loose because the whole signed query has to stay in the URL: the auth client
// reads it from there when the decision is sent.
const searchSchema = z.looseObject({
  client_id: z.string().optional(),
  redirect_uri: z.string().optional(),
})

export const Route = createFileRoute('/consent')({
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: '/login' })
  },
  loaderDeps: ({ search }) => ({
    clientId: search.client_id ?? '',
    redirectUri: search.redirect_uri,
  }),
  loader: async ({ deps }) => {
    const [info, pulse] = await Promise.all([
      getConsentInfo({ data: deps }),
      getClubPulse(),
    ])
    return { info, pulse }
  },
  head: () => ({ meta: [{ title: 'Connect an app · RHS Coding Club' }] }),
  component: ConsentPage,
})

/**
 * Where an MCP app's sign-in asks for permission. Says who is asking and where
 * the sign-in goes back to, since anyone can send an officer a link to this page.
 */
function ConsentPage() {
  const { info, pulse } = Route.useLoaderData()
  const [pending, setPending] = useState<'accept' | 'deny' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function decide(accept: boolean) {
    setPending(accept ? 'accept' : 'deny')
    setError(null)
    const { data, error: err } = await authClient.oauth2.consent({ accept })
    if (err) {
      setPending(null)
      setError(err.message ?? 'That request has expired. Start again from the app.')
      return
    }
    window.location.assign(data.url)
  }

  if (!info.allowed) {
    return (
      <AuthLayout
        title="Officers only"
        subtitle="Only club officers and admins can connect an AI app to the site."
        pulse={pulse}
      >
        <RaisedButton asChild size="lg" className="w-full">
          <Link to="/dashboard">Go to your dashboard</Link>
        </RaisedButton>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={`Connect ${info.name}?`}
      subtitle="It will be able to do what you can do in the admin panel, as you."
      pulse={pulse}
    >
      <dl className="mb-6 grid gap-3 text-sm">
        {info.publisher && (
          <div>
            <dt className="text-muted-foreground">Identified by</dt>
            <dd className="font-mono break-all">{info.publisher}</dd>
          </div>
        )}
        {info.redirectUri && (
          <div>
            <dt className="text-muted-foreground">Sends you back to</dt>
            <dd className="font-mono break-all">{info.redirectUri}</dd>
          </div>
        )}
      </dl>
      {info.redirect !== 'https' && (
        <p className="text-muted-foreground mb-6 text-sm">
          {info.redirect === 'local'
            ? 'This goes back to a program on your own computer.'
            : "This doesn't go back to a website, so nothing proves who receives it."}{' '}
          The name above can&apos;t be verified, so only continue if you just started this
          from an app you trust.
        </p>
      )}
      <p className="text-muted-foreground mb-6 text-sm">
        It can read club data and make changes. Deleting things, changing roles or
        settings, adjusting points, accepting members, GitHub invites, and emailing the
        club still need your approval here. Other reviews, like passing a submission or
        approving a project, run right away.
      </p>
      {error && (
        <p role="alert" className="text-destructive mb-4 text-sm">
          {error}
        </p>
      )}
      <div className="grid gap-2.5">
        <RaisedButton
          type="button"
          size="lg"
          className="w-full"
          loading={pending === 'accept'}
          loadingText="Connecting…"
          disabled={pending !== null}
          onClick={() => void decide(true)}
        >
          Connect
        </RaisedButton>
        <RaisedButton
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={pending !== null}
          onClick={() => void decide(false)}
        >
          Cancel
        </RaisedButton>
      </div>
    </AuthLayout>
  )
}
