import { useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Eye, FlaskConical, Save, Send } from 'lucide-react'
import { EMPTY_DOC_JSON } from '#/lib/rich-text'
import { issueSchema } from '#/lib/schemas/newsletter'
import { fieldErrors, serverErrorMessage } from '#/lib/schemas/community'
import type { FieldErrors } from '#/lib/schemas/community'
import { saveIssue, sendIssue, sendTestIssue } from '#/server/newsletter'
import { RichTextEditor } from '#/components/rich-text/editor'
import { RaisedButton } from '#/components/raised-button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { IssuePreview } from './issue-preview'

/**
 * Writes one issue: subject and rich-text body, saved as a draft. From here
 * an officer previews it, mails a test copy to themselves, and finally sends
 * it to every active subscriber (once; the server refuses a second send).
 */
export function NewsletterComposer({
  draft,
  activeCount,
  me,
}: {
  draft: { id: string; subject: string; content: string } | null
  activeCount: number
  me: string
}) {
  const router = useRouter()
  const navigate = useNavigate()
  const save = useServerFn(saveIssue)
  const test = useServerFn(sendTestIssue)
  const send = useServerFn(sendIssue)

  const [id, setId] = useState(draft?.id)
  const [subject, setSubject] = useState(draft?.subject ?? '')
  const [content, setContent] = useState(draft?.content ?? EMPTY_DOC_JSON)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState<'save' | 'test' | 'send' | null>(null)
  const [preview, setPreview] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [dirty, setDirty] = useState(false)

  function validate() {
    const parsed = issueSchema.safeParse({ id, subject, content })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return null
    }
    setErrors({})
    return parsed.data
  }

  async function persist() {
    const data = validate()
    if (!data) return null
    const row = await save({ data })
    setId(row.id)
    setDirty(false)
    if (!id)
      void navigate({ to: '/admin/newsletter', search: { issue: row.id }, replace: true })
    return row.id
  }

  async function run(kind: 'save' | 'test' | 'send') {
    setBusy(kind)
    try {
      if (kind === 'save') {
        if (await persist()) {
          toast.success('Draft saved.')
          await router.invalidate()
        }
      } else if (kind === 'test') {
        const data = validate()
        if (!data) return
        const r = await test({ data })
        toast.success(
          r.logged > 0
            ? `Test logged to the server console (no email key set).`
            : `Test sent to ${r.to}.`,
        )
      } else {
        const issueId = await persist()
        if (!issueId) return
        const r = await send({ data: { id: issueId } })
        toast.success(
          `Sent to ${r.recipients} subscriber${r.recipients === 1 ? '' : 's'}.`,
        )
        void navigate({ to: '/admin/newsletter', search: { tab: 'history' } })
        await router.invalidate()
      }
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nl-subject">Subject</Label>
          <Input
            id="nl-subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value)
              setDirty(true)
            }}
            maxLength={150}
            placeholder="November at the club"
            className="h-11 text-base"
            aria-invalid={errors.subject ? true : undefined}
            aria-describedby={errors.subject ? 'nl-subject-error' : undefined}
          />
          {errors.subject && (
            <p id="nl-subject-error" role="alert" className="text-destructive text-sm">
              {errors.subject}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nl-body">Body</Label>
          <RichTextEditor
            id="nl-body"
            value={content}
            onChange={(v) => {
              setContent(v)
              setDirty(true)
            }}
            imagePurpose="post"
            placeholder="What happened this month, what’s coming up…"
            aria-invalid={Boolean(errors.content)}
          />
          {errors.content && (
            <p role="alert" className="text-destructive text-sm">
              {errors.content}
            </p>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-3 xl:pt-6">
        <div className="border-border rounded-lg border p-4 text-sm">
          <p className="text-muted-foreground">Goes to</p>
          <p className="tabular mt-0.5 text-2xl font-semibold">{activeCount}</p>
          <p className="text-muted-foreground">
            active subscriber{activeCount === 1 ? '' : 's'}
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            {id ? (dirty ? 'Unsaved changes.' : 'Draft saved.') : 'Not saved yet.'}
          </p>
        </div>
        <RaisedButton
          variant="outline"
          loading={busy === 'save'}
          onClick={() => run('save')}
        >
          <Save aria-hidden="true" />
          Save draft
        </RaisedButton>
        <RaisedButton variant="outline" onClick={() => setPreview(true)}>
          <Eye aria-hidden="true" />
          Preview
        </RaisedButton>
        <RaisedButton
          variant="outline"
          loading={busy === 'test'}
          loadingText="Sending test…"
          onClick={() => run('test')}
        >
          <FlaskConical aria-hidden="true" />
          Send test to me
        </RaisedButton>
        <p className="text-muted-foreground -mt-1 truncate px-1 text-xs">{me}</p>
        <RaisedButton
          className="mt-2"
          disabled={activeCount === 0}
          loading={busy === 'send'}
          loadingText="Sending…"
          onClick={() => {
            if (validate()) setConfirm(true)
          }}
        >
          <Send aria-hidden="true" />
          Send to all subscribers
        </RaisedButton>
      </aside>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>Close to how it looks in an inbox.</DialogDescription>
          </DialogHeader>
          <IssuePreview subject={subject} content={content} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Send to {activeCount} subscriber{activeCount === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{subject}” goes out now, each copy with its own unsubscribe link. An issue
              can only be sent once, and it can’t be edited afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction onClick={() => run('send')}>Send it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
