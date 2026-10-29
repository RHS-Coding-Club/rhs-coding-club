import { useState } from 'react'
import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { signIn } from '#/lib/auth-client'
import { safeRedirect } from '#/lib/format'
import { AuthShell } from '#/components/auth/auth-shell'
import { SocialButtons } from '#/components/auth/social-buttons'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

const searchSchema = z.object({ redirect: z.string().optional() })

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ to: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Log in · RHS Coding Club' }] }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
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
    setPending(false)
    if (err) {
      setError(err.message ?? 'Could not sign in. Check your email and password.')
      return
    }
    await router.invalidate()
    await router.navigate({ to: next })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to submit challenges, RSVP, and track your points."
    >
      <SocialButtons callbackURL={next} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <RaisedButton type="submit" size="lg" loading={pending} loadingText="Signing in…">
          Log in
        </RaisedButton>
      </form>
      <p className="text-muted-foreground text-sm">
        New here?{' '}
        <Link
          to="/signup"
          search={{ redirect: requested }}
          className="text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
