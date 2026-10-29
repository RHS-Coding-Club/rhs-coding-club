import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { saveResourceSchema } from '#/lib/schemas/resources'
import { fieldErrors, serverErrorMessage } from '#/lib/schemas/community'
import type { FieldErrors } from '#/lib/schemas/community'
import { saveResource } from '#/server/resources'
import { RaisedButton } from '#/components/raised-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { ResourceFields, readResourceForm } from './resource-form'
import type { ResourceFormValues } from './resource-form'

export type EditableResource = ResourceFormValues & { id?: string; approved: boolean }

/** Officer create/edit dialog for one resource. `resource` null = closed. */
export function AdminResourceDialog({
  resource,
  onClose,
}: {
  resource: EditableResource | null
  onClose: () => void
}) {
  const router = useRouter()
  const save = useServerFn(saveResource)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [approved, setApproved] = useState(true)
  const [lastId, setLastId] = useState<string | undefined>('')

  // Reset local state when a different resource opens.
  const key = resource ? (resource.id ?? 'new') : ''
  if (key !== lastId) {
    setLastId(key)
    setErrors({})
    setApproved(resource?.approved ?? true)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = saveResourceSchema.safeParse({
      ...readResourceForm(e.currentTarget),
      id: resource?.id,
      approved,
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setPending(true)
    try {
      await save({ data: parsed.data })
      toast.success(resource?.id ? 'Resource updated.' : 'Resource added.')
      onClose()
      await router.invalidate()
    } catch (err) {
      setErrors({ _: serverErrorMessage(err) })
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={resource !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{resource?.id ? 'Edit resource' : 'New resource'}</DialogTitle>
          <DialogDescription>
            Approved resources show on /resources right away.
          </DialogDescription>
        </DialogHeader>
        {resource && (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <ResourceFields
              key={key}
              initial={resource}
              errors={errors}
              idPrefix="admin-res"
            />
            <div className="border-border flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
              <div>
                <Label htmlFor="admin-res-approved">Approved</Label>
                <p className="text-muted-foreground text-xs">
                  Off keeps it in the review queue.
                </p>
              </div>
              <Switch
                id="admin-res-approved"
                checked={approved}
                onCheckedChange={setApproved}
              />
            </div>
            {errors._ && (
              <p role="alert" className="text-destructive text-sm">
                {errors._}
              </p>
            )}
            <DialogFooter>
              <RaisedButton type="button" variant="ghost" onClick={onClose}>
                Cancel
              </RaisedButton>
              <RaisedButton type="submit" loading={pending} loadingText="Saving…">
                Save
              </RaisedButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
