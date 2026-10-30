import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Github, KeyRound, Link2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'
import { fmtDate } from '#/lib/format'

const PROVIDERS = {
  credential: { label: 'Email and password', icon: Mail },
  google: { label: 'Google', icon: GoogleMark },
  github: { label: 'GitHub', icon: Github },
} as const

type LinkedAccount = { id: string; providerId: string; createdAt: Date }

/**
 * Linked sign-in methods through the Better Auth client: link Google or
 * GitHub, unlink one (never the last), and change the password for
 * email accounts.
 */
export function SignInMethods({
  accounts,
  providers,
  email,
}: {
  accounts: LinkedAccount[]
  providers: { google: boolean; github: boolean }
  email: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const linked = new Set(accounts.map((a) => a.providerId))
  const hasPassword = linked.has('credential')
  const linkable = (['google', 'github'] as const).filter(
    (p) => providers[p] && !linked.has(p),
  )

  async function link(provider: 'google' | 'github') {
    setBusy(provider)
    const { error } = await authClient.linkSocial({ provider, callbackURL: '/account' })
    if (error) {
      toast.error(error.message ?? 'Could not start linking.')
      setBusy(null)
    }
  }

  async function unlink(accountId: string) {
    setBusy(accountId)
    const { error } = await authClient.unlinkAccount({ accountId })
    setBusy(null)
    if (error) {
      toast.error(
        error.code === 'FAILED_TO_UNLINK_LAST_ACCOUNT'
          ? 'That’s your only way to sign in. Link another one first.'
          : error.code === 'SESSION_EXPIRED'
            ? 'For safety, sign out and back in, then try again.'
            : (error.message ?? 'Could not unlink.'),
      )
      return
    }
    toast.success('Unlinked.')
    await router.invalidate()
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="divide-border/70 divide-y">
        {accounts.map((a) => {
          const p = (PROVIDERS[a.providerId as keyof typeof PROVIDERS] as
            (typeof PROVIDERS)[keyof typeof PROVIDERS] | undefined) ?? {
            label: a.providerId,
            icon: KeyRound,
          }
          const Icon = p.icon
          return (
            <li key={a.id} className="flex items-center gap-4 py-3.5 first:pt-0">
              <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{p.label}</span>
                <span className="text-muted-foreground block truncate text-sm">
                  {a.providerId === 'credential'
                    ? email
                    : `Linked ${fmtDate(a.createdAt)}`}
                </span>
              </span>
              {accounts.length > 1 && a.providerId !== 'credential' && (
                <RaisedButton
                  variant="ghost"
                  size="sm"
                  loading={busy === a.id}
                  onClick={() => void unlink(a.id)}
                >
                  Unlink
                </RaisedButton>
              )}
            </li>
          )
        })}
      </ul>

      {linkable.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {linkable.map((p) => {
            const Icon = PROVIDERS[p].icon
            return (
              <RaisedButton
                key={p}
                variant="outline"
                loading={busy === p}
                onClick={() => void link(p)}
              >
                <Icon aria-hidden="true" />
                Link {PROVIDERS[p].label}
                <Link2 className="opacity-60" aria-hidden="true" />
              </RaisedButton>
            )
          })}
        </div>
      )}

      {hasPassword && <ChangePassword />}
    </div>
  )
}

function ChangePassword() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const currentPassword = String(data.get('currentPassword'))
    const newPassword = String(data.get('newPassword'))
    if (newPassword.length < 8) {
      setError('Use at least 8 characters for the new password.')
      return
    }
    if (newPassword !== String(data.get('confirmPassword'))) {
      setError('The new passwords don’t match.')
      return
    }
    setError(null)
    setPending(true)
    const { error: err } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    setPending(false)
    if (err) {
      setError(
        err.code === 'INVALID_PASSWORD'
          ? 'Your current password is wrong.'
          : (err.message ?? 'Could not change your password.'),
      )
      return
    }
    form.reset()
    toast.success('Password changed. Other devices were signed out.')
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-border/70 flex flex-col gap-4 border-t pt-6"
    >
      <p className="font-medium">Change password</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <div>
        <RaisedButton
          type="submit"
          variant="outline"
          loading={pending}
          loadingText="Changing…"
        >
          Change password
        </RaisedButton>
      </div>
    </form>
  )
}

function GoogleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.4-1.64 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.78 3.96 14.7 3 12.18 3 7.1 3 3 7.03 3 12s4.1 9 9.18 9c5.3 0 8.82-3.72 8.82-8.96 0-.6-.07-1.06-.15-1.54z" />
    </svg>
  )
}
