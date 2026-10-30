import { useState } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Download, Eye, Mail, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { NewsletterComposer } from '#/components/newsletter/composer'
import { IssuePreview } from '#/components/newsletter/issue-preview'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { fmtDate } from '#/lib/format'
import { subscribersToCsv } from '#/lib/schemas/newsletter'
import { serverErrorMessage } from '#/lib/schemas/community'
import { cn } from '#/lib/utils'
import { deleteIssue, getNewsletterAdmin } from '#/server/newsletter'

const TABS = ['compose', 'history', 'subscribers'] as const

const searchSchema = z.object({
  tab: z.enum(TABS).optional().catch(undefined),
  /** Draft open in the composer. */
  issue: z.string().max(64).optional(),
})

export const Route = createFileRoute('/_admin/admin/newsletter')({
  validateSearch: searchSchema,
  loader: () => getNewsletterAdmin(),
  head: () => ({ meta: [{ title: 'Newsletter · Admin · RHS Coding Club' }] }),
  component: AdminNewsletter,
})

function AdminNewsletter() {
  const { subscribers, issues, counts } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const tab = search.tab ?? 'compose'
  const draft = issues.find((i) => i.id === search.issue && !i.sentAt) ?? null

  return (
    <>
      <AdminPageHeader
        eyebrow="Email"
        title="Newsletter"
        description="Write an issue, check it, and send it to everyone who signed up in the site footer."
        actions={
          <div className="flex gap-6 text-right">
            <Count n={counts.active} label="active" />
            <Count n={counts.unsubscribed} label="unsubscribed" muted />
          </div>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) =>
          void navigate({ search: (s) => ({ ...s, tab: v as (typeof TABS)[number] }) })
        }
      >
        <TabsList className="mb-5">
          <TabsTrigger value="compose">{draft ? 'Edit draft' : 'Compose'}</TabsTrigger>
          <TabsTrigger value="history">
            Issues
            <span className="text-muted-foreground tabular ml-1.5 font-mono text-[10px]">
              {issues.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          {draft && (
            <div className="mb-4 flex items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                Editing a draft from {fmtDate(draft.updatedAt, 'date')}.
              </p>
              <RaisedButton asChild variant="ghost" size="sm">
                <Link to="/admin/newsletter" search={{}}>
                  <Plus aria-hidden="true" />
                  New issue
                </Link>
              </RaisedButton>
            </div>
          )}
          <NewsletterComposer
            key={draft?.id ?? 'new'}
            draft={draft}
            activeCount={counts.active}
            me={user.email}
          />
        </TabsContent>

        <TabsContent value="history">
          <IssueHistory issues={issues} />
        </TabsContent>

        <TabsContent value="subscribers">
          <Subscribers rows={subscribers} />
        </TabsContent>
      </Tabs>
    </>
  )
}

function Count({ n, label, muted }: { n: number; label: string; muted?: boolean }) {
  return (
    <div>
      <p
        className={cn('tabular text-2xl font-semibold', muted && 'text-muted-foreground')}
      >
        {n}
      </p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  )
}

type Data = Awaited<ReturnType<typeof getNewsletterAdmin>>

function IssueHistory({ issues }: { issues: Data['issues'] }) {
  const router = useRouter()
  const remove = useServerFn(deleteIssue)
  const [viewing, setViewing] = useState<Data['issues'][number] | null>(null)

  if (issues.length === 0) {
    return (
      <EmptyState icon={<Mail />} title="No issues yet.">
        Write the first one in Compose.
      </EmptyState>
    )
  }

  async function onDelete(id: string) {
    try {
      await remove({ data: { id } })
      toast.success('Draft deleted.')
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    }
  }

  return (
    <>
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                Recipients
              </TableHead>
              <TableHead className="hidden md:table-cell">Written by</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="max-w-80 truncate font-medium">
                  {i.subject}
                </TableCell>
                <TableCell>
                  {i.sentAt ? (
                    <span className="text-sm">
                      <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                        Sent
                      </span>{' '}
                      <span className="text-muted-foreground font-mono text-xs">
                        {fmtDate(i.sentAt, 'date')}
                      </span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                      Draft
                    </span>
                  )}
                </TableCell>
                <TableCell className="tabular hidden text-right font-mono text-xs sm:table-cell">
                  {i.sentAt ? i.recipientCount : ''}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {i.createdByName ?? 'Deleted user'}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <RaisedButton
                      size="icon"
                      variant="ghost"
                      aria-label={`Preview ${i.subject}`}
                      onClick={() => setViewing(i)}
                    >
                      <Eye />
                    </RaisedButton>
                    {!i.sentAt && (
                      <>
                        <RaisedButton asChild size="icon" variant="ghost">
                          <Link
                            to="/admin/newsletter"
                            search={{ tab: 'compose', issue: i.id }}
                            aria-label={`Edit ${i.subject}`}
                          >
                            <Pencil />
                          </Link>
                        </RaisedButton>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <RaisedButton
                              size="icon"
                              variant="ghost"
                              aria-label={`Delete ${i.subject}`}
                            >
                              <Trash2 />
                            </RaisedButton>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                              <AlertDialogDescription>
                                “{i.subject}” was never sent. This can’t be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete(i.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={viewing !== null} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewing?.subject}</DialogTitle>
            <DialogDescription>
              {viewing?.sentAt
                ? `Sent ${fmtDate(viewing.sentAt, 'datetime')} to ${viewing.recipientCount} subscribers.`
                : 'Draft, not sent yet.'}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <IssuePreview subject={viewing.subject} content={viewing.content} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Subscribers({ rows }: { rows: Data['subscribers'] }) {
  const [query, setQuery] = useState('')
  const [show, setShow] = useState<'all' | 'active' | 'unsubscribed'>('all')
  const q = query.trim().toLowerCase()
  const visible = rows.filter(
    (r) =>
      (!q || r.email.includes(q)) &&
      (show === 'all' || (show === 'active' ? !r.unsubscribedAt : r.unsubscribedAt)),
  )

  function exportCsv() {
    const blob = new Blob([subscribersToCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emails"
            aria-label="Search subscribers"
            className="pl-9"
          />
        </div>
        <Tabs value={show} onValueChange={(v) => setShow(v as typeof show)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="unsubscribed">Unsubscribed</TabsTrigger>
          </TabsList>
        </Tabs>
        <RaisedButton variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download aria-hidden="true" />
          Export CSV
        </RaisedButton>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={<Mail />}
          title={rows.length ? 'No matches.' : 'No subscribers yet.'}
        >
          {rows.length ? 'Try another search.' : 'People sign up from the site footer.'}
        </EmptyState>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.email}</TableCell>
                  <TableCell>
                    {r.unsubscribedAt ? (
                      <span className="text-muted-foreground text-xs">
                        Unsubscribed {fmtDate(r.unsubscribedAt, 'short')}
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden font-mono text-xs sm:table-cell">
                    {fmtDate(r.subscribedAt, 'date')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-muted-foreground border-border border-t px-4 py-2 text-xs">
            {visible.length} of {rows.length}
          </p>
        </div>
      )}
    </div>
  )
}
