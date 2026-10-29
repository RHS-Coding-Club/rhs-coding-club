import { useState } from 'react'
import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { fieldErrors, serverMessage } from '#/components/account/form-helpers'
import { EmptyState } from '#/components/empty-state'
import { ImageUpload } from '#/components/image-upload'
import { RaisedButton } from '#/components/raised-button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { fileUrl } from '#/lib/files'
import { initials } from '#/lib/format'
import { hasRole } from '#/lib/roles'
import { officerSchema } from '#/lib/schemas/officers'
import { cn } from '#/lib/utils'
import {
  listAllOfficers,
  removeOfficer,
  reorderOfficer,
  upsertOfficer,
} from '#/server/officers'
import type { OfficerRow } from '#/services/officers'

export const Route = createFileRoute('/_admin/admin/officers')({
  beforeLoad: ({ context }) => {
    if (!hasRole(context.user.role, 'admin')) throw redirect({ to: '/admin' })
  },
  loader: () => listAllOfficers(),
  head: () => ({ meta: [{ title: 'Officers · Admin · RHS Coding Club' }] }),
  component: AdminOfficers,
})

type Draft = {
  id?: string
  name: string
  title: string
  bio: string
  email: string
  githubUrl: string
  imageKey: string | null
  isActive: boolean
}

const BLANK: Draft = {
  name: '',
  title: '',
  bio: '',
  email: '',
  githubUrl: '',
  imageKey: null,
  isActive: true,
}

function AdminOfficers() {
  const officers = Route.useLoaderData()
  const router = useRouter()
  const [editing, setEditing] = useState<Draft | null>(null)
  const [deleting, setDeleting] = useState<OfficerRow | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function move(o: OfficerRow, direction: 'up' | 'down') {
    setBusy(`${o.id}-${direction}`)
    try {
      await reorderOfficer({ data: { id: o.id, direction } })
      await router.invalidate()
    } catch (err) {
      toast.error(serverMessage(err))
    } finally {
      setBusy(null)
    }
  }

  async function toggle(o: OfficerRow, isActive: boolean) {
    setBusy(`${o.id}-active`)
    try {
      await upsertOfficer({
        data: {
          id: o.id,
          name: o.name,
          title: o.title,
          bio: o.bio,
          email: o.email ?? '',
          githubUrl: o.githubUrl ?? '',
          imageKey: o.imageKey,
          isActive,
        },
      })
      toast.success(
        isActive ? `${o.name} is shown on About.` : `${o.name} is hidden from About.`,
      )
      await router.invalidate()
    } catch (err) {
      toast.error(serverMessage(err))
    } finally {
      setBusy(null)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(`${deleting.id}-delete`)
    try {
      await removeOfficer({ data: { id: deleting.id } })
      toast.success(`Removed ${deleting.name}.`)
      setDeleting(null)
      await router.invalidate()
    } catch (err) {
      toast.error(serverMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Club"
        title="Officers"
        description="The cards on the About page, in this order. Hide someone with the switch instead of deleting them."
        actions={
          <>
            <RaisedButton asChild variant="ghost">
              <Link to="/about">View About</Link>
            </RaisedButton>
            <RaisedButton onClick={() => setEditing({ ...BLANK })}>
              <Plus />
              Add officer
            </RaisedButton>
          </>
        }
      />

      {officers.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck />}
          title="No officer profiles yet."
          action={
            <RaisedButton onClick={() => setEditing({ ...BLANK })}>
              <Plus />
              Add the first one
            </RaisedButton>
          }
        >
          They show up on the About page under “The people running it”.
        </EmptyState>
      ) : (
        <ol className="divide-border border-border divide-y rounded-lg border">
          {officers.map((o, i) => (
            <li
              key={o.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                !o.isActive && 'opacity-60',
              )}
            >
              <div className="flex flex-col">
                <RaisedButton
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${o.name} up`}
                  disabled={i === 0}
                  loading={busy === `${o.id}-up`}
                  onClick={() => void move(o, 'up')}
                >
                  <ArrowUp />
                </RaisedButton>
                <RaisedButton
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${o.name} down`}
                  disabled={i === officers.length - 1}
                  loading={busy === `${o.id}-down`}
                  onClick={() => void move(o, 'down')}
                >
                  <ArrowDown />
                </RaisedButton>
              </div>
              <Avatar className="size-11">
                <AvatarImage src={fileUrl(o.imageKey)} alt="" />
                <AvatarFallback>{initials(o.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{o.name}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {o.title}
                  {o.bio && <span className="hidden md:inline"> · {o.bio}</span>}
                </p>
              </div>
              <label className="text-muted-foreground hidden items-center gap-2 text-xs sm:flex">
                {o.isActive ? 'Shown' : 'Hidden'}
                <Switch
                  checked={o.isActive}
                  disabled={busy === `${o.id}-active`}
                  onCheckedChange={(v) => void toggle(o, v)}
                  aria-label={`Show ${o.name} on About`}
                />
              </label>
              <RaisedButton
                variant="ghost"
                size="icon"
                aria-label={`Edit ${o.name}`}
                onClick={() =>
                  setEditing({
                    id: o.id,
                    name: o.name,
                    title: o.title,
                    bio: o.bio,
                    email: o.email ?? '',
                    githubUrl: o.githubUrl ?? '',
                    imageKey: o.imageKey,
                    isActive: o.isActive,
                  })
                }
              >
                <Pencil />
              </RaisedButton>
              <RaisedButton
                variant="ghost"
                size="icon"
                aria-label={`Delete ${o.name}`}
                onClick={() => setDeleting(o)}
              >
                <Trash2 />
              </RaisedButton>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {editing && (
            <OfficerForm
              initial={editing}
              onDone={async () => {
                setEditing(null)
                await router.invalidate()
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their card comes off the About page for good. To take it down for now,
              switch it to hidden instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <RaisedButton variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </RaisedButton>
            <RaisedButton
              className="text-white [--raise-fill:var(--destructive)]"
              loading={busy === `${deleting?.id}-delete`}
              onClick={() => void confirmDelete()}
            >
              Delete
            </RaisedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function OfficerForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: Draft
  onDone: () => Promise<void>
  onCancel: () => void
}) {
  const [d, setD] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const set = <TKey extends keyof Draft>(k: TKey, v: Draft[TKey]) =>
    setD((p) => ({ ...p, [k]: v }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = officerSchema.safeParse(d)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setPending(true)
    try {
      await upsertOfficer({ data: d })
      toast.success(d.id ? 'Saved.' : `Added ${d.name}.`)
      await onDone()
    } catch (err) {
      toast.error(serverMessage(err))
    } finally {
      setPending(false)
    }
  }

  const field = (
    key: 'name' | 'title' | 'email' | 'githubUrl',
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`officer-${key}`}>{label}</Label>
      <Input
        id={`officer-${key}`}
        value={d[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `officer-${key}-error` : undefined}
        {...props}
      />
      {errors[key] && (
        <p id={`officer-${key}-error`} role="alert" className="text-destructive text-sm">
          {errors[key]}
        </p>
      )}
    </div>
  )

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>{d.id ? `Edit ${initial.name}` : 'Add an officer'}</DialogTitle>
        <DialogDescription>Shown on the About page.</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-4">
        <ImageUpload
          value={d.imageKey}
          onChange={(k) => set('imageKey', k)}
          purpose="officer"
          label="Photo"
          aspect="aspect-square"
          className="size-24 shrink-0 [&>button]:rounded-full"
        />
        <p className="text-muted-foreground text-sm">
          A square headshot. Without one, the card shows their initials.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field('name', 'Name', { autoComplete: 'off' })}
        {field('title', 'Title', { placeholder: 'Vice President' })}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="officer-bio">Bio</Label>
        <Textarea
          id="officer-bio"
          rows={3}
          value={d.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="What they run: hackathons, RAP volunteers, the website…"
          aria-invalid={Boolean(errors.bio)}
        />
        {errors.bio && (
          <p role="alert" className="text-destructive text-sm">
            {errors.bio}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field('email', 'Email (optional)', { type: 'email' })}
        {field('githubUrl', 'GitHub profile (optional)', {
          placeholder: 'https://github.com/…',
        })}
      </div>
      <label className="flex items-center justify-between gap-4 text-sm">
        <span>
          <span className="font-medium">Show on About</span>
          <span className="text-muted-foreground block text-xs">
            Turn off for alumni or someone on a break.
          </span>
        </span>
        <Switch checked={d.isActive} onCheckedChange={(v) => set('isActive', v)} />
      </label>
      <DialogFooter>
        <RaisedButton type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </RaisedButton>
        <RaisedButton type="submit" loading={pending} loadingText="Saving…">
          {d.id ? 'Save' : 'Add officer'}
        </RaisedButton>
      </DialogFooter>
    </form>
  )
}
