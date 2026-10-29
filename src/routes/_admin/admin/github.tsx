import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { AlertTriangle, Check, ExternalLink, Github, RotateCw, X } from 'lucide-react'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
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
import { STATUS_LABEL, canSendInvite, denyRequestSchema } from '#/lib/schemas/github'
import type { RequestStatus } from '#/lib/schemas/github'
import { serverErrorMessage } from '#/lib/schemas/community'
import { cn } from '#/lib/utils'
import {
  approveGithubRequest,
  denyGithubRequest,
  listGithubRequests,
  retryGithubInvite,
} from '#/server/github'

const TABS = {
  pending: ['pending'],
  active: ['approved', 'invite-sent', 'already-invited'],
  done: ['joined', 'already-member'],
  denied: ['denied'],
} satisfies Record<string, RequestStatus[]>
type Tab = keyof typeof TABS | 'all'

const searchSchema = z.object({
  tab: z.enum(['pending', 'active', 'done', 'denied', 'all']).optional().catch(undefined),
})

export const Route = createFileRoute('/_admin/admin/github')({
  validateSearch: searchSchema,
  loader: () => listGithubRequests(),
  head: () => ({ meta: [{ title: 'GitHub org · Admin · RHS Coding Club' }] }),
  component: AdminGithub,
})

const PILL: Record<RequestStatus, string> = {
  pending: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  approved: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  'invite-sent': 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  'already-invited': 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  joined: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  'already-member': 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  denied: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
}

function AdminGithub() {
  const { requests, org, tokenConfigured, peopleUrl } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const router = useRouter()
  const approve = useServerFn(approveGithubRequest)
  const retry = useServerFn(retryGithubInvite)
  const [busy, setBusy] = useState<string | null>(null)
  const [denying, setDenying] = useState<{ id: string; name: string } | null>(null)

  const count = (t: keyof typeof TABS) =>
    requests.filter((r) => (TABS[t] as RequestStatus[]).includes(r.status)).length
  const tab: Tab = search.tab ?? (count('pending') > 0 ? 'pending' : 'all')
  const visible =
    tab === 'all'
      ? requests
      : requests.filter((r) => (TABS[tab] as RequestStatus[]).includes(r.status))

  async function invite(id: string, kind: 'approve' | 'retry') {
    setBusy(id)
    try {
      const result =
        kind === 'approve'
          ? await approve({ data: { id } })
          : await retry({ data: { id } })
      if (result.manual) toast.success('Approved. Send the invite on GitHub.')
      else if (result.error) toast.error(result.error)
      else toast.success(STATUS_LABEL[result.status])
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Members"
        title="GitHub org"
        description={`Invite requests for the ${org} organization. The hourly sync marks people joined once they accept.`}
        actions={
          <RaisedButton asChild variant="outline">
            <a href={peopleUrl} target="_blank" rel="noopener noreferrer">
              <Github aria-hidden="true" />
              Org people
              <ExternalLink aria-hidden="true" />
            </a>
          </RaisedButton>
        }
      />

      {!tokenConfigured && (
        <div
          role="note"
          className="mb-4 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300"
            aria-hidden="true"
          />
          <p>
            <span className="font-medium">No GitHub token is set.</span> Approving marks a
            request approved; then send the invite yourself on{' '}
            <a
              href={peopleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              the org’s people page
            </a>
            . Set <code className="font-mono text-xs">GITHUB_TOKEN</code> (admin:org) to
            send invites and track joins automatically.
          </p>
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => void navigate({ search: { tab: v as Tab } })}
        className="mb-4"
      >
        <TabsList>
          {(
            [
              ['pending', 'Pending'],
              ['active', 'In progress'],
              ['done', 'Joined'],
              ['denied', 'Denied'],
              ['all', 'All'],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
              {value === 'pending' && count('pending') > 0 && (
                <span className="bg-primary text-primary-foreground tabular ml-1.5 rounded-full px-1.5 font-mono text-[10px]">
                  {count('pending')}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Github />}
          title={tab === 'pending' ? 'No requests waiting.' : 'Nothing here.'}
        >
          Members request invites from /github.
        </EmptyState>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>GitHub</TableHead>
                <TableHead className="hidden xl:table-cell">Note</TableHead>
                <TableHead className="hidden md:table-cell">Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id} className="align-top">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={r.user} className="size-8" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{r.user.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {r.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://github.com/${r.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-sky inline-flex items-center gap-1 font-mono text-sm"
                    >
                      @{r.githubUsername}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                    {r.githubId === null && (
                      <p className="text-muted-foreground text-xs">Not verified yet</p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden max-w-64 text-sm whitespace-normal xl:table-cell">
                    {r.note ?? <span className="opacity-60">No note</span>}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">
                    {fmtDate(r.createdAt, 'short')}
                  </TableCell>
                  <TableCell className="max-w-64 whitespace-normal">
                    <span
                      className={cn('rounded-full px-2 py-0.5 text-xs', PILL[r.status])}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                    {r.reviewedByName && r.status !== 'pending' && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        by {r.reviewedByName}
                        {r.reviewedAt && `, ${fmtDate(r.reviewedAt, 'short')}`}
                      </p>
                    )}
                    {r.inviteError && (
                      <p className="text-destructive mt-1 text-xs">{r.inviteError}</p>
                    )}
                    {r.status === 'denied' && r.adminNote && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        “{r.adminNote}”
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-1">
                      {r.status === 'pending' && (
                        <RaisedButton
                          size="sm"
                          loading={busy === r.id}
                          onClick={() => invite(r.id, 'approve')}
                        >
                          <Check aria-hidden="true" />
                          Approve
                        </RaisedButton>
                      )}
                      {r.status === 'approved' && !tokenConfigured && (
                        <RaisedButton asChild size="sm" variant="secondary">
                          <a href={peopleUrl} target="_blank" rel="noopener noreferrer">
                            Send the invite on GitHub
                            <ExternalLink aria-hidden="true" />
                          </a>
                        </RaisedButton>
                      )}
                      {canSendInvite(r.status) && tokenConfigured && (
                        <RaisedButton
                          size="sm"
                          variant="outline"
                          loading={busy === r.id}
                          onClick={() => invite(r.id, 'retry')}
                        >
                          <RotateCw aria-hidden="true" />
                          {r.status === 'approved' ? 'Retry invite' : 'Resend'}
                        </RaisedButton>
                      )}
                      {(r.status === 'pending' || r.status === 'approved') && (
                        <RaisedButton
                          size="sm"
                          variant="ghost"
                          onClick={() => setDenying({ id: r.id, name: r.user.name })}
                        >
                          <X aria-hidden="true" />
                          Deny
                        </RaisedButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DenyDialog target={denying} onClose={() => setDenying(null)} />
    </>
  )
}

function DenyDialog({
  target,
  onClose,
}: {
  target: { id: string; name: string } | null
  onClose: () => void
}) {
  const router = useRouter()
  const deny = useServerFn(denyGithubRequest)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!target) return
    const parsed = denyRequestSchema.safeParse({
      id: target.id,
      note: String(new FormData(e.currentTarget).get('note') ?? ''),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Add a note.')
      return
    }
    setPending(true)
    try {
      await deny({ data: parsed.data })
      toast.success('Request denied.')
      onClose()
      await router.invalidate()
    } catch (err) {
      setError(serverErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(o) => {
        if (!o) {
          setError(null)
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deny {target?.name}’s request</DialogTitle>
          <DialogDescription>
            They see this note on their GitHub page and can request again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deny-note">Note to the member</Label>
            <Textarea
              id="deny-note"
              name="note"
              rows={3}
              maxLength={500}
              placeholder="Use your own account, not a shared one."
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'deny-note-error' : undefined}
            />
            {error && (
              <p id="deny-note-error" role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <RaisedButton type="button" variant="ghost" onClick={onClose}>
              Cancel
            </RaisedButton>
            <RaisedButton type="submit" loading={pending} loadingText="Denying…">
              Deny request
            </RaisedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
