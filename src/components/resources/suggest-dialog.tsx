import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { suggestResourceSchema } from '#/lib/schemas/resources'
import { fieldErrors, serverErrorMessage } from '#/lib/schemas/community'
import type { FieldErrors } from '#/lib/schemas/community'
import { suggestResource } from '#/server/resources'
import { RaisedButton } from '#/components/raised-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { ResourceFields, readResourceForm } from './resource-form'

/** Members suggest a link; it shows up for them as "pending review" until an officer approves it. */
export function SuggestResourceDialog({
  size = 'lg',
  variant = 'primary',
}: {
  size?: 'md' | 'lg'
  variant?: 'primary' | 'outline'
}) {
  const router = useRouter()
  const suggest = useServerFn(suggestResource)
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = suggestResourceSchema.safeParse(readResourceForm(e.currentTarget))
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setPending(true)
    try {
      await suggest({ data: parsed.data })
      setOpen(false)
      toast.success('Thanks! An officer will review it soon.')
      await router.invalidate()
    } catch (err) {
      setErrors({ _: serverErrorMessage(err) })
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setErrors({})
      }}
    >
      <DialogTrigger asChild>
        <RaisedButton size={size} variant={variant}>
          <Plus aria-hidden="true" />
          Suggest a resource
        </RaisedButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggest a resource</DialogTitle>
          <DialogDescription>
            Something that helped you learn? Officers review every link before it goes on
            the list. You will see it marked as pending until then.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <ResourceFields errors={errors} idPrefix="suggest" />
          {errors._ && (
            <p role="alert" className="text-destructive text-sm">
              {errors._}
            </p>
          )}
          <DialogFooter>
            <RaisedButton type="submit" loading={pending} loadingText="Sending…">
              Send for review
            </RaisedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
