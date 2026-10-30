import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { LockKeyhole, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { resetPassword } from '#/lib/auth-client'
import { AuthLayout } from '#/components/auth/auth-layout'
import { AuthField } from '#/components/auth/auth-field'
import { RaisedButton } from '#/components/raised-button'
import { getClubPulse } from '#/server/public'

// Better Auth sends the emailed link through /api/auth/reset-password/:token,
// which lands here with ?token=... (or ?error=INVALID_TOKEN if it expired).
const searchSchema = z.object({
  token: z.string().max(200).optional().catch(undefined),
  error: z.string().max(60).optional().catch(undefined),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: searchSchema,
  loader: () => getClubPulse(),
  head: () => ({ meta: [{ title: 'Choose a new password · RHS Coding Club' }] }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const router = useRouter()
  const pulse = Route.useLoaderData()
  const { token, error: linkError } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (!token || linkError) {
    return (
      <AuthLayout
        title="That link has expired"
        subtitle="Reset links work once, for one hour. Ask for a fresh one and use the newest email."
        pulse={pulse}
      >
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 text-sm ring-1 ring-amber-500/25">
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300"
            aria-hidden="true"
          />
          <p>Your password hasn&apos;t changed.</p>
        </div>
        <RaisedButton asChild size="lg" className="w-full">
          <Link to="/forgot-password">Send a new link</Link>
        </RaisedButton>
      </AuthLayout>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password'))
    if (password !== String(form.get('confirm'))) {
      setError('Those passwords don’t match.')
      return
    }
    setPending(true)
    const { error: err } = await resetPassword({ newPassword: password, token })
    if (err) {
      setPending(false)
      setError(
        err.code === 'INVALID_TOKEN'
          ? 'That link has expired. Ask for a new one.'
          : (err.message ?? 'Could not save your password.'),
      )
      return
    }
    toast.success('Password saved. Log in with it now.')
    await router.navigate({ to: '/login' })
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="At least 8 characters. You'll log in with it right after."
      pulse={pulse}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <AuthField
          id="password"
          label="New password"
          icon={<LockKeyhole />}
          type="password"
          autoComplete="new-password"
          placeholder="New password (8+ characters)"
          required
          minLength={8}
        />
        <AuthField
          id="confirm"
          label="Confirm new password"
          icon={<LockKeyhole />}
          type="password"
          autoComplete="new-password"
          placeholder="Type it again"
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
          loadingText="Saving…"
        >
          Save password
        </RaisedButton>
      </form>
    </AuthLayout>
  )
}
