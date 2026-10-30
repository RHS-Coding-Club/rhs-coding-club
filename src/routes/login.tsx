import { useState } from 'react'
import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { AtSign, LockKeyhole } from 'lucide-react'
import { z } from 'zod'
import { signIn } from '#/lib/auth-client'
import { safeRedirect } from '#/lib/format'
import { AuthDivider, AuthLayout } from '#/components/auth/auth-layout'
import { AuthField, FinePrint } from '#/components/auth/auth-field'
import { SocialButtons } from '#/components/auth/social-buttons'
import { RaisedButton } from '#/components/raised-button'
import { getClubPulse } from '#/server/public'

const searchSchema = z.object({ redirect: z.string().optional() })

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ to: safeRedirect(search.redirect) })
  },
  loader: () => getClubPulse(),
  head: () => ({ meta: [{ title: 'Log in · RHS Coding Club' }] }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const pulse = Route.useLoaderData()
  const { redirect: requested } = Route.useSearch()
  const next = safeRedirect(requested)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const { error: err } = await signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    if (err) {
      setPending(false)
      setError(err.message ?? 'Could not sign in. Check your email and password.')
      return
    }
    await router.invalidate()
    await router.navigate({ to: next })
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to submit challenges, RSVP, and check your points."
      pulse={pulse}
    >
      <SocialButtons callbackURL={next} />
      <AuthDivider>OR</AuthDivider>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs">
          Log in with your email and password
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
        <AuthField
          id="password"
          label="Password"
          icon={<LockKeyhole />}
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          required
        />
        <Link
          to="/forgot-password"
          className="text-muted-foreground hover:text-foreground -mt-1 self-end text-xs underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
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
          loadingText="Signing in…"
        >
          Log in
        </RaisedButton>
      </form>
      <p className="text-muted-foreground text-sm">
        New here?{' '}
        <Link
          to="/signup"
          search={{ redirect: requested }}
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Join the club
        </Link>
      </p>
      <FinePrint action="continuing" />
    </AuthLayout>
  )
}
