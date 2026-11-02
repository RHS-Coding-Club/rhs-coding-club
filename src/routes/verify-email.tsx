import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { verifyEmail } from '#/lib/auth-client'
import { safeRedirect } from '#/lib/format'
import { AuthLayout } from '#/components/auth/auth-layout'
import { RaisedButton } from '#/components/raised-button'
import { getClubPulse } from '#/server/public'

const searchSchema = z.object({
  token: z.string().optional(),
  next: z.string().optional(),
})

export const Route = createFileRoute('/verify-email')({
  validateSearch: searchSchema,
  loader: () => getClubPulse(),
  head: () => ({ meta: [{ title: 'Confirm your email · RHS Coding Club' }] }),
  component: VerifyEmailPage,
})

/**
 * Where the confirmation email lands. Nothing happens until someone presses
 * the button, so a mail scanner opening the link can't confirm an account.
 */
function VerifyEmailPage() {
  const router = useRouter()
  const pulse = Route.useLoaderData()
  const { token, next } = Route.useSearch()
  const [failed, setFailed] = useState(!token)
  const [pending, setPending] = useState(false)

  async function confirm() {
    if (!token) return
    setPending(true)
    const { error } = await verifyEmail({ query: { token } })
    if (error) {
      setPending(false)
      setFailed(true)
      return
    }
    await router.invalidate()
    await router.navigate({ to: safeRedirect(next, '/join') })
  }

  if (failed) {
    return (
      <AuthLayout
        title="That link has expired"
        subtitle="Log in with your email and password and we'll send you a new one."
        pulse={pulse}
      >
        <RaisedButton asChild size="lg" className="w-full">
          <Link to="/login">Log in</Link>
        </RaisedButton>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Confirm your email"
      subtitle="Press the button to finish making your account. If you didn't sign up, close this page and nothing happens."
      pulse={pulse}
    >
      <RaisedButton
        size="lg"
        className="w-full"
        loading={pending}
        loadingText="Confirming…"
        onClick={() => void confirm()}
      >
        Confirm my email
      </RaisedButton>
    </AuthLayout>
  )
}
