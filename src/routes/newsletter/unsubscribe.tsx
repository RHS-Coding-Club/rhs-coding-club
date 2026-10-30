import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { MailCheck, MailX, Unlink } from 'lucide-react'
import { PageHero } from '#/components/page-hero'
import { RaisedButton } from '#/components/raised-button'
import { unsubscribeSearchSchema } from '#/lib/schemas/newsletter'
import { serverErrorMessage } from '#/lib/schemas/community'
import { getUnsubscribeState, resubscribe, unsubscribe } from '#/server/newsletter'

export const Route = createFileRoute('/newsletter/unsubscribe')({
  validateSearch: unsubscribeSearchSchema,
  loaderDeps: ({ search }) => ({ token: search.token }),
  // Reading the link only looks the token up; nothing changes until the button posts.
  loader: ({ deps }) => getUnsubscribeState({ data: { token: deps.token } }),
  head: () => ({
    meta: [
      { title: 'Unsubscribe · RHS Coding Club' },
      { name: 'description', content: 'Stop getting the RHS Coding Club newsletter.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: UnsubscribePage,
})

type Status = 'active' | 'unsubscribed' | 'invalid' | 'welcome-back'

function UnsubscribePage() {
  const initial = Route.useLoaderData()
  const { token } = Route.useSearch()
  const doUnsubscribe = useServerFn(unsubscribe)
  const doResubscribe = useServerFn(resubscribe)
  const [status, setStatus] = useState<Status>(initial.status)
  const [pending, setPending] = useState(false)
  const email = initial.email

  async function run(action: 'unsubscribe' | 'resubscribe') {
    if (!token) return
    setPending(true)
    try {
      const fn = action === 'unsubscribe' ? doUnsubscribe : doResubscribe
      const result = await fn({ data: { token } })
      setStatus(
        result.status === 'invalid'
          ? 'invalid'
          : action === 'resubscribe'
            ? 'welcome-back'
            : 'unsubscribed',
      )
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const who = email ? (
    <span className="font-mono text-[0.92em]">{email}</span>
  ) : (
    'this address'
  )

  const view = {
    active: {
      icon: MailX,
      title: 'Stop getting the newsletter?',
      description: (
        <>
          We will stop sending the club newsletter to {who}. You can come back any time
          from the signup in the site footer.
        </>
      ),
      actions: (
        <>
          <RaisedButton
            size="lg"
            loading={pending}
            loadingText="Unsubscribing…"
            onClick={() => run('unsubscribe')}
          >
            Unsubscribe
          </RaisedButton>
          <RaisedButton asChild size="lg" variant="outline">
            <Link to="/">Keep me subscribed</Link>
          </RaisedButton>
        </>
      ),
    },
    unsubscribed: {
      icon: MailCheck,
      title: 'You’re unsubscribed.',
      description: (
        <>
          We won’t send the newsletter to {who} again. Club members still get the account
          emails they choose in Account settings.
        </>
      ),
      actions: (
        <>
          <RaisedButton
            size="lg"
            variant="outline"
            loading={pending}
            loadingText="Resubscribing…"
            onClick={() => run('resubscribe')}
          >
            Changed my mind, resubscribe
          </RaisedButton>
          <RaisedButton asChild size="lg" variant="ghost">
            <Link to="/">Back to the site</Link>
          </RaisedButton>
        </>
      ),
    },
    'welcome-back': {
      icon: MailCheck,
      title: 'Welcome back.',
      description: <>You’re on the list again. The next issue will land in {who}.</>,
      actions: (
        <RaisedButton asChild size="lg">
          <Link to="/">Back to the site</Link>
        </RaisedButton>
      ),
    },
    invalid: {
      icon: Unlink,
      title: 'This link doesn’t work.',
      description: (
        <>
          The unsubscribe link may be cut off. Open it again from the bottom of the email,
          or send us a message and an officer will take you off the list.
        </>
      ),
      actions: (
        <>
          <RaisedButton asChild size="lg">
            <Link to="/contact">Contact the officers</Link>
          </RaisedButton>
          <RaisedButton asChild size="lg" variant="outline">
            <Link to="/">Back to the site</Link>
          </RaisedButton>
        </>
      ),
    },
  }[status]

  const Icon = view.icon
  return (
    <div className="pb-16 sm:pb-24">
      <PageHero
        key={status}
        size="md"
        background={
          <div className="absolute inset-0 bg-[radial-gradient(55%_70%_at_88%_90%,rgba(95,178,238,0.32)_0%,transparent_70%)] dark:bg-[radial-gradient(55%_70%_at_88%_90%,rgba(31,79,138,0.6)_0%,transparent_70%)]" />
        }
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Icon className="size-4" aria-hidden="true" />
            Newsletter
          </span>
        }
        title={view.title}
        description={view.description}
        actions={view.actions}
      />
      <p role="status" className="sr-only">
        {status === 'unsubscribed'
          ? 'You are unsubscribed.'
          : status === 'welcome-back'
            ? 'You are subscribed again.'
            : ''}
      </p>
    </div>
  )
}
