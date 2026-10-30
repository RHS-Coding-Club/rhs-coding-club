import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, UserCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { serverMessage } from '#/components/account/form-helpers'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { fmtDate } from '#/lib/format'
import { GRADE_LABEL, experienceLabel } from '#/lib/schemas/membership'
import type { Grade } from '#/lib/schemas/membership'
import { ROLE_LABEL } from '#/lib/schemas/users'
import { cn } from '#/lib/utils'
import {
  getMembershipApplication,
  listMembershipApplications,
  reviewMembershipApplication,
} from '#/server/membership'
import type { ApplicationDetail } from '#/services/membership'

const STATUSES = ['pending', 'approved', 'rejected', 'all'] as const

const searchSchema = z.object({
  status: z.enum(STATUSES).optional().catch(undefined),
  id: z.string().max(64).optional(),
})

export const Route = createFileRoute('/_admin/admin/applications')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ status: search.status ?? 'pending' }),
  loader: ({ deps }) => listMembershipApplications({ data: { status: deps.status } }),
  head: () => ({ meta: [{ title: 'Applications · Admin · RHS Coding Club' }] }),
  component: AdminApplications,
})

const STATUS_PILL = {
  pending: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
} as const

function StatusPill({ status }: { status: keyof typeof STATUS_PILL }) {
  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-xs capitalize', STATUS_PILL[status])}
    >
      {status}
    </span>
  )
}

const gradeLabel = (g: string) =>
  g in GRADE_LABEL ? `${g}th · ${GRADE_LABEL[g as Grade]}` : g

function AdminApplications() {
  const rows = Route.useLoaderData()
  const search = Route.useSearch()
  const status = search.status ?? 'pending'
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <>
      <AdminPageHeader
        eyebrow="Membership"
        title="Applications"
        description="Guests who want to join. Approving makes them a member and emails them; rejecting sends your note so they know what to change."
      />
      <Tabs
        value={status}
        onValueChange={(v) =>
          void navigate({
            search: {
              status: v === 'pending' ? undefined : (v as (typeof STATUSES)[number]),
            },
          })
        }
        className="mb-4"
      >
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {rows.length === 0 ? (
        <EmptyState
          icon={<UserCheck />}
          title={status === 'pending' ? 'No one is waiting.' : 'Nothing here.'}
        >
          {status === 'pending'
            ? 'New applications from /join show up here.'
            : 'Try another tab.'}
        </EmptyState>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead className="hidden md:table-cell">Grade</TableHead>
                <TableHead className="hidden lg:table-cell">Experience</TableHead>
                <TableHead className="hidden xl:table-cell">Interests</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  data-state={search.id === r.id ? 'selected' : undefined}
                  onClick={() => void navigate({ search: (s) => ({ ...s, id: r.id }) })}
                >
                  <TableCell>
                    <button
                      type="button"
                      className="flex items-center gap-3 text-left outline-none focus-visible:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        void navigate({ search: (s) => ({ ...s, id: r.id }) })
                      }}
                    >
                      <UserAvatar user={r} className="size-8" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.name}</span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {r.email}
                        </span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {gradeLabel(r.grade)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {experienceLabel(r.experience)}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden max-w-56 truncate xl:table-cell">
                    {r.interests.join(', ')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {fmtDate(r.createdAt, 'short')}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet
        open={Boolean(search.id)}
        onOpenChange={(open) => {
          if (!open) void navigate({ search: (s) => ({ ...s, id: undefined }) })
        }}
      >
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
          {search.id && <ApplicationPanel id={search.id} />}
        </SheetContent>
      </Sheet>
    </>
  )
}

function ApplicationPanel({ id }: { id: string }) {
  const { data, isPending } = useQuery({
    queryKey: ['admin-application', id],
    queryFn: () => getMembershipApplication({ data: { id } }),
    staleTime: 0,
  })

  if (isPending)
    return (
      <div className="flex flex-col gap-4 p-6">
        <SheetTitle className="sr-only">Loading application</SheetTitle>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  if (!data)
    return (
      <div className="p-6">
        <SheetTitle>Application not found</SheetTitle>
        <p className="text-muted-foreground mt-2 text-sm">It may have been deleted.</p>
      </div>
    )
  return <ApplicationBody detail={data} />
}

function ApplicationBody({ detail }: { detail: ApplicationDetail }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { application: a, user } = detail
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)

  async function decide(decision: 'approve' | 'reject') {
    if (decision === 'reject' && !note.trim()) {
      setNoteError('Tell them why, so they know what to change before reapplying.')
      return
    }
    setBusy(decision)
    try {
      const r = await reviewMembershipApplication({
        data: { id: a.id, decision, note: decision === 'reject' ? note : '' },
      })
      toast.success(
        r.status === 'approved'
          ? r.promoted
            ? `${user.name} is now a member.`
            : `Approved. ${user.name} was already ${ROLE_LABEL[user.role].toLowerCase()}.`
          : 'Rejected. They’ll get your note by email.',
      )
      setRejecting(false)
      await queryClient.invalidateQueries({ queryKey: ['admin-application', a.id] })
      await router.invalidate()
    } catch (err) {
      toast.error(serverMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <SheetHeader className="border-border border-b p-6">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} className="size-12" />
          <div className="min-w-0">
            <SheetTitle className="truncate text-xl">{user.name}</SheetTitle>
            <SheetDescription className="truncate">
              {user.email} · {ROLE_LABEL[user.role]} · joined {fmtDate(user.createdAt)}
            </SheetDescription>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <StatusPill status={a.status} />
          <span className="text-muted-foreground">
            Applied {fmtDate(a.createdAt, 'datetime')}
          </span>
          {detail.history.length > 1 && (
            <span className="text-muted-foreground">
              · application {detail.history.findIndex((h) => h.id === a.id) + 1} of{' '}
              {detail.history.length}
            </span>
          )}
        </div>
      </SheetHeader>

      <dl className="grid gap-5 p-6 text-sm">
        <div className="grid grid-cols-2 gap-5">
          <Answer term="Grade" value={gradeLabel(a.grade)} />
          <Answer term="Experience" value={experienceLabel(a.experience)} />
        </div>
        <Answer term="Languages" value={<Chips items={a.languages} />} />
        <Answer term="Interests" value={<Chips items={a.interests} />} />
        <Answer term="What they want to build or learn" value={a.goals} long />
        <Answer term="Why they want to join" value={a.whyJoin} long />
        <div className="grid grid-cols-2 gap-5">
          <Answer term="Availability" value={a.availability} />
          <Answer
            term="GitHub"
            value={
              a.githubUsername ? (
                <a
                  href={`https://github.com/${a.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-mono underline-offset-4 hover:underline"
                >
                  {a.githubUsername}
                </a>
              ) : (
                <span className="text-muted-foreground">Not given</span>
              )
            }
          />
        </div>
        {a.status !== 'pending' && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium">
              {a.status === 'approved' ? 'Approved' : 'Rejected'}
              {detail.reviewerName && ` by ${detail.reviewerName}`}
              {a.reviewedAt && ` on ${fmtDate(a.reviewedAt)}`}
            </p>
            {a.reviewNote && <p className="text-muted-foreground mt-1">{a.reviewNote}</p>}
          </div>
        )}
      </dl>

      {a.status === 'pending' && (
        <div className="bg-background border-border sticky bottom-0 mt-auto flex gap-2 border-t p-4">
          <RaisedButton
            className="flex-1"
            loading={busy === 'approve'}
            loadingText="Approving…"
            onClick={() => void decide('approve')}
          >
            <Check />
            Approve
          </RaisedButton>
          <RaisedButton
            variant="outline"
            className="flex-1"
            onClick={() => setRejecting(true)}
          >
            <X />
            Reject
          </RaisedButton>
        </div>
      )}

      <Dialog open={rejecting} onOpenChange={setRejecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {user.name}’s application?</DialogTitle>
            <DialogDescription>
              They stay a guest and get this note by email. They can apply again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="review-note">Note to the applicant</Label>
            <Textarea
              id="review-note"
              rows={4}
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setNoteError(null)
              }}
              placeholder="Thanks for applying. Could you tell us a bit more about what you want to build?"
              aria-invalid={Boolean(noteError)}
              aria-describedby={noteError ? 'review-note-error' : undefined}
            />
            {noteError && (
              <p id="review-note-error" role="alert" className="text-destructive text-sm">
                {noteError}
              </p>
            )}
          </div>
          <DialogFooter>
            <RaisedButton variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </RaisedButton>
            <RaisedButton
              loading={busy === 'reject'}
              loadingText="Sending…"
              onClick={() => void decide('reject')}
            >
              Reject and send note
            </RaisedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Answer({
  term,
  value,
  long,
}: {
  term: string
  value: React.ReactNode
  long?: boolean
}) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{term}</dt>
      <dd className={cn('mt-1', long && 'leading-relaxed whitespace-pre-line')}>
        {value}
      </dd>
    </div>
  )
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-muted-foreground">None</span>
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="bg-muted rounded-md px-2 py-0.5 text-xs">
          {i}
        </span>
      ))}
    </span>
  )
}
