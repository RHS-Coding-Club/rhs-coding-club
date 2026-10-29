import { useState } from 'react'
import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { AtSign, LockKeyhole, UserRound } from 'lucide-react'
import { z } from 'zod'
import { signUp } from '#/lib/auth-client'
import { safeRedirect } from '#/lib/format'
import { AuthDivider, AuthLayout } from '#/components/auth/auth-layout'
import { AuthField, FinePrint } from '#/components/auth/auth-field'
import { SocialButtons } from '#/components/auth/social-buttons'
import { RaisedButton } from '#/components/raised-button'
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
  const router = useRouter()
  const pulse = Route.useLoaderData()
  const { redirect: requested } = Route.useSearch()
  // New accounts start as guests, so the membership application is the next step.
  const next = safeRedirect(requested, '/join')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const { error: err } = await signUp.email({
      name: String(form.get('name')),
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    if (err) {
      setPending(false)
      setError(err.message ?? 'Could not create your account.')
      return
    }
    await router.invalidate()
    await router.navigate({ to: next })
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
