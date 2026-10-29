import { useState } from 'react'
import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { signUp } from '#/lib/auth-client'
import { safeRedirect } from '#/lib/format'
import { AuthShell } from '#/components/auth/auth-shell'
import { SocialButtons } from '#/components/auth/social-buttons'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

const searchSchema = z.object({ redirect: z.string().optional() })

export const Route = createFileRoute('/signup')({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ to: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Join · RHS Coding Club' }] }),
  component: SignupPage,
})

function SignupPage() {
  const router = useRouter()
  // New accounts start as guests, so the membership application is the next step.
  const next = safeRedirect(Route.useSearch().redirect, '/join')
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
    setPending(false)
    if (err) {
      setError(err.message ?? 'Could not create your account.')
      return
    }
    await router.invalidate()
    await router.navigate({ to: next })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up, then fill out the short membership application. Any RHS student can apply."
    >
      <SocialButtons callbackURL={next} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required minLength={2} />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-muted-foreground text-xs">At least 8 characters.</p>
        </div>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <RaisedButton type="submit" size="lg" loading={pending} loadingText="Creating…">
          Create account
        </RaisedButton>
      </form>
      <p className="text-muted-foreground text-sm">
        Already have one?{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
