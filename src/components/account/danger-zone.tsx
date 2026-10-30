import { useState } from 'react'
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

const PHRASE = 'delete my account'

/**
 * Deletes the account through Better Auth after a typed confirmation (and
 * the password, for email accounts). Points, submissions, and RSVPs go with it.
 */
export function DangerZone({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const ready = typed.trim().toLowerCase() === PHRASE && (!hasPassword || password)

  async function onDelete() {
    setPending(true)
    setError(null)
    const { error: err } = await authClient.deleteUser(hasPassword ? { password } : {})
    setPending(false)
    if (err) {
      setError(
        err.code === 'SESSION_EXPIRED'
          ? 'For safety, sign out and back in, then try again.'
          : err.code === 'INVALID_PASSWORD'
            ? 'That password is wrong.'
            : (err.message ?? 'Could not delete your account.'),
      )
      return
    }
    setOpen(false)
    toast.success('Your account was deleted.')
    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-muted-foreground max-w-md text-sm">
        Deleting your account removes your profile, points, badges, submissions, and RSVPs
        for good. Projects you authored are removed too.
      </p>
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
        <AlertDialogTrigger asChild>
          <RaisedButton variant="outline" className="text-destructive">
            Delete account
          </RaisedButton>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This can’t be undone. Type{' '}
              <span className="text-foreground font-mono">{PHRASE}</span> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-phrase">Confirmation</Label>
              <Input
                id="confirm-phrase"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                placeholder={PHRASE}
              />
            </div>
            {hasPassword && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Password</Label>
                <Input
                  id="confirm-password"
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
            <RaisedButton variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </RaisedButton>
            <RaisedButton
              variant="primary"
              className="text-white [--raise-fill:var(--destructive)]"
              disabled={!ready}
              loading={pending}
              loadingText="Deleting…"
              onClick={() => void onDelete()}
            >
              Delete forever
            </RaisedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
