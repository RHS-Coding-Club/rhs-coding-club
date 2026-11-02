import { useRef, useState } from 'react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { AtSign, LockKeyhole, MailCheck, UserRound } from 'lucide-react'
import { z } from 'zod'
import { signUp } from '#/lib/auth-client'
import { safeRedirect } from '#/lib/format'
import { AuthDivider, AuthLayout } from '#/components/auth/auth-layout'
import { AuthField, FinePrint } from '#/components/auth/auth-field'
import { SocialButtons } from '#/components/auth/social-buttons'
import { RaisedButton } from '#/components/raised-button'
import { Turnstile } from '#/components/turnstile'
import type { TurnstileHandle } from '#/components/turnstile'
import { TURNSTILE_ACTIONS, TURNSTILE_HEADER } from '#/lib/turnstile'
import { getClubPulse } from '#/server/public'

const searchSchema = z.object({ redirect: z.string().optional() })

export const Route = createFileRoute('/signup')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ to: safeRedirect(search.redirect) })
  },
  loader: () => getClubPulse(),
  head: () => ({ meta: [{ title: 'Join · RHS Coding Club' }] }),
  component: SignupPage,
})

function SignupPage() {
  const pulse = Route.useLoaderData()
  const { redirect: requested } = Route.useSearch()
  // New accounts start as guests, so the membership application is the next step.
  const next = safeRedirect(requested, '/join')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const turnstile = useRef<TurnstileHandle>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email'))
    const token = await turnstile.current?.getToken()
    const { error: err } = await signUp.email({
      name: String(form.get('name')),
      email,
      password: String(form.get('password')),
      callbackURL: next,
      fetchOptions: { headers: { [TURNSTILE_HEADER]: token ?? '' } },
    })
    setPending(false)
    if (err) {
      setError(err.message ?? 'Could not create your account.')
      turnstile.current?.reset()
      return
    }
    setSentTo(email)
  }

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We sent a link to ${sentTo}. Open it to finish making your account.`}
        pulse={pulse}
      >
        <div className="bg-brand-sky/10 ring-brand-sky/25 flex items-start gap-3 rounded-2xl p-4 text-sm ring-1">
          <MailCheck
            className="text-brand-sky mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <p>
            Nothing after a few minutes? Check spam, or{' '}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-medium underline underline-offset-4"
            >
              try a different email
            </button>
            .
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          Already confirmed?{' '}
          <Link
            to="/login"
            search={{ redirect: requested }}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Join the club"
      subtitle="Make an account, then fill out the short membership application."
      pulse={pulse}
    >
      <SocialButtons callbackURL={next} />
      <AuthDivider>OR</AuthDivider>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs">Sign up with your email</p>
        <AuthField
          id="name"
          label="Name"
          icon={<UserRound />}
          autoComplete="name"
          placeholder="Your name"
          required
          minLength={2}
        />
        <AuthField
          id="email"
          label="Email"
          icon={<AtSign />}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <AuthField
          id="password"
          label="Password"
          icon={<LockKeyhole />}
          type="password"
          autoComplete="new-password"
          placeholder="Password (8+ characters)"
          required
          minLength={8}
        />
        <Turnstile ref={turnstile} action={TURNSTILE_ACTIONS.signup} />
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <RaisedButton
          type="submit"
          size="lg"
          className="mt-1 w-full"
          loading={pending}
          loadingText="Creating…"
        >
          Create account
        </RaisedButton>
      </form>
      <p className="text-muted-foreground text-sm">
        Already a member?{' '}
        <Link
          to="/login"
          search={{ redirect: requested }}
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
      <FinePrint action="signing up" />
    </AuthLayout>
  )
}
