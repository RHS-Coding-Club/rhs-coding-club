import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { deleteChallenge } from '#/server/challenges'

/** Confirm, then delete a challenge with its submissions (passes are reversed). */
export function DeleteChallengeDialog({
  challenge,
  open,
  onOpenChange,
  onDeleted,
}: {
  challenge: { id: string; title: string; submissions: number; solves: number } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void | Promise<void>
}) {
  const remove = useServerFn(deleteChallenge)
  const [pending, setPending] = useState(false)

  async function confirm() {
    if (!challenge) return
    setPending(true)
    try {
      const res = await remove({ data: { id: challenge.id } })
      toast.success('Challenge deleted', {
        description:
          res.reversed > 0
            ? `Reversed points for ${res.reversed} ${res.reversed === 1 ? 'pass' : 'passes'}.`
            : undefined,
      })
      onOpenChange(false)
      await onDeleted()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete it.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{challenge?.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {challenge && challenge.submissions > 0
              ? `This also deletes its ${challenge.submissions} ${challenge.submissions === 1 ? 'submission' : 'submissions'}${
                  challenge.solves > 0
                    ? `, and takes the points back from the ${challenge.solves} ${challenge.solves === 1 ? 'member' : 'members'} who passed`
                    : ''
                }. This cannot be undone.`
              : 'Nobody has submitted to it yet. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <RaisedButton variant="outline" onClick={() => onOpenChange(false)}>
            Keep it
          </RaisedButton>
          <RaisedButton
            className="text-destructive-foreground [--raise-fill:var(--destructive)]"
            onClick={confirm}
            loading={pending}
            loadingText="Deleting"
          >
            Delete challenge
          </RaisedButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
