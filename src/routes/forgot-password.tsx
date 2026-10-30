import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AtSign, MailCheck } from 'lucide-react'
import { requestPasswordReset } from '#/lib/auth-client'
import { AuthLayout } from '#/components/auth/auth-layout'
import { AuthField } from '#/components/auth/auth-field'
import { RaisedButton } from '#/components/raised-button'
import { getClubPulse } from '#/server/public'

export const Route = createFileRoute('/forgot-password')({
  loader: () => getClubPulse(),
  head: () => ({ meta: [{ title: 'Reset your password · RHS Coding Club' }] }),
  component: ForgotPasswordPage,
})

/**
 * Asks for an email and sends a reset link. Members brought over from the
 * old site use this to set their first password. The answer is the same
 * whether or not the email has an account, so it can't be used to probe.
 */
function ForgotPasswordPage() {
  const pulse = Route.useLoaderData()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const email = String(new FormData(e.currentTarget).get('email'))
    const { error: err } = await requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })
    setPending(false)
    if (err) {
      setError(err.message ?? 'Could not send the email. Try again in a minute.')
      return
    }
    setSentTo(email)
  }

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`If ${sentTo} has an account, a link to choose a new password is on its way. It works for one hour.`}
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
          Remembered it?{' '}
          <Link
            to="/login"
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
      title="Reset your password"
      subtitle="Had an account on the old club site? This is how you set a password for the new one."
      pulse={pulse}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs">
          Enter the email you use for the club and we&apos;ll send you a link
        </p>
        <AuthField
          id="email"
          label="Email"
          icon={<AtSign />}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
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
          loadingText="Sending…"
        >
          Send reset link
        </RaisedButton>
      </form>
      <p className="text-muted-foreground text-sm">
        Remembered it?{' '}
        <Link
          to="/login"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
