import { useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'

/**
 * Account deletion behind a confirmation that names what goes and asks for
 * the account's email (and password, for email sign-ins). Same Better Auth
 * call as the live danger zone.
 */
export function DeleteAccountDialog({
  email,
  hasPassword,
  trigger,
}: {
  email: string
  hasPassword: boolean
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const ready =
    typed.trim().toLowerCase() === email.toLowerCase() && (!hasPassword || password)

  async function onDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) return
    setPending(true)
    setError(null)
    const { error: err } = await authClient.deleteUser(hasPassword ? { password } : {})
    setPending(false)
    if (err) {
      setError(
        err.code === 'SESSION_EXPIRED'
          ? 'For your safety, sign out and back in, then try again.'
          : err.code === 'INVALID_PASSWORD'
            ? 'That password doesn’t match. Check it and try again.'
            : (err.message ?? 'Unable to delete your account. Try again.'),
      )
      return
    }
    setOpen(false)
    toast.success('Account deleted.')
    await router.invalidate({ sync: true })
    await router.navigate({ to: '/' })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setTyped('')
          setPassword('')
          setError(null)
        }
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={(e) => void onDelete(e)} className="flex flex-col gap-5">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile, points, badges, submissions, RSVPs, and the projects you
              authored are removed for good. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delete-confirm-email">
                Type <span className="font-mono">{email}</span> to confirm
              </Label>
              <Input
                id="delete-confirm-email"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
              />
            </div>
            {hasPassword && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="delete-confirm-password">Password</Label>
                <Input
                  id="delete-confirm-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            )}
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <RaisedButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </RaisedButton>
            <RaisedButton
              type="submit"
              variant="primary"
              className="text-white [--raise-fill:var(--destructive)]"
              disabled={!ready}
              loading={pending}
              loadingText="Deleting…"
            >
              Delete account
            </RaisedButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
