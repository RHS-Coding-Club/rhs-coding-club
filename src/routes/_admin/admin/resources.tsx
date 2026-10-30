import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Check, ExternalLink, LibraryBig, Pencil, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { AdminResourceDialog } from '#/components/resources/admin-resource-dialog'
import type { EditableResource } from '#/components/resources/admin-resource-dialog'
import { EMPTY_RESOURCE } from '#/components/resources/resource-form'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { fmtDate } from '#/lib/format'
import { LEVELS, LEVEL_LABEL, resourceDomain } from '#/lib/schemas/resources'
import { serverErrorMessage } from '#/lib/schemas/community'
import { cn } from '#/lib/utils'
import { approveResource, deleteResource, listResourcesAdmin } from '#/server/resources'
import { safeHref } from '#/lib/rich-text'

const STATUS = ['all', 'pending', 'approved'] as const

const searchSchema = z.object({
  status: z.enum(STATUS).optional().catch(undefined),
  level: z.enum(LEVELS).optional().catch(undefined),
})

export const Route = createFileRoute('/_admin/admin/resources')({
  validateSearch: searchSchema,
  loader: () => listResourcesAdmin(),
  head: () => ({ meta: [{ title: 'Resources · Admin · RHS Coding Club' }] }),
  component: AdminResources,
})

function AdminResources() {
  const rows = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const router = useRouter()
  const approve = useServerFn(approveResource)
  const remove = useServerFn(deleteResource)
  const [editing, setEditing] = useState<EditableResource | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const pendingCount = rows.filter((r) => !r.approved).length
  const status = search.status ?? (pendingCount > 0 ? 'pending' : 'all')
  const visible = rows.filter(
    (r) =>
      (status === 'all' || (status === 'pending' ? !r.approved : r.approved)) &&
      (!search.level || r.level === search.level),
  )

  async function act(id: string, fn: () => Promise<unknown>, done: string) {
    setBusy(id)
    try {
      await fn()
      toast.success(done)
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
        eyebrow="Content"
        title="Resources"
        description="Links on /resources. Member suggestions wait here as pending until you approve them."
        actions={
          <RaisedButton onClick={() => setEditing({ ...EMPTY_RESOURCE, approved: true })}>
            <Plus aria-hidden="true" />
            New resource
          </RaisedButton>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={status}
          onValueChange={(v) =>
            void navigate({
              search: (s) => ({ ...s, status: v as (typeof STATUS)[number] }),
            })
          }
        >
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <span className="bg-primary text-primary-foreground tabular ml-1.5 rounded-full px-1.5 font-mono text-[10px]">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select
          value={search.level ?? 'all'}
          onValueChange={(v) =>
            void navigate({
              search: (s) => ({ ...s, level: v === 'all' ? undefined : (v as never) }),
            })
          }
        >
          <SelectTrigger className="w-44" aria-label="Filter by level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {LEVEL_LABEL[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<LibraryBig />}
          title={status === 'pending' ? 'No suggestions waiting.' : 'Nothing here.'}
        >
          {status === 'pending'
            ? 'Members suggest links from /resources. They show up here for review.'
            : 'Try another filter, or add a resource.'}
        </EmptyState>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="hidden md:table-cell">Level</TableHead>
                <TableHead className="hidden xl:table-cell">Tags</TableHead>
                <TableHead className="hidden lg:table-cell">Added by</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Saves</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-72">
                    <p className="truncate font-medium">{r.title}</p>
                    <a
                      href={safeHref(r.url) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-xs"
                    >
                      {resourceDomain(r.url)}
                      <ExternalLink className="size-3" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {LEVEL_LABEL[r.level]}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden max-w-48 truncate font-mono text-xs xl:table-cell">
                    {r.tags.join(', ')}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="block">{r.addedByName ?? 'Deleted user'}</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {fmtDate(r.createdAt, 'short')}
                    </span>
                  </TableCell>
                  <TableCell className="tabular hidden text-right font-mono text-xs sm:table-cell">
                    {r.saves}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        r.approved
                          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
                      )}
                    >
                      {r.approved ? 'Approved' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {!r.approved && (
                        <RaisedButton
                          size="sm"
                          loading={busy === r.id}
                          onClick={() =>
                            act(
                              r.id,
                              () => approve({ data: { id: r.id, approved: true } }),
                              `Approved “${r.title}”.`,
                            )
                          }
                        >
                          <Check aria-hidden="true" />
                          Approve
                        </RaisedButton>
                      )}
                      <RaisedButton
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${r.title}`}
                        onClick={() =>
                          setEditing({
                            id: r.id,
                            title: r.title,
                            url: r.url,
                            description: r.description,
                            level: r.level,
                            tags: r.tags,
                            approved: r.approved,
                          })
                        }
                      >
                        <Pencil />
                      </RaisedButton>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <RaisedButton
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${r.title}`}
                          >
                            <Trash2 />
                          </RaisedButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {r.approved
                                ? 'Delete this resource?'
                                : 'Reject this suggestion?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              “{r.title}” is removed for everyone
                              {r.saves > 0 ? `, including ${r.saves} saved copies` : ''}.
                              This can’t be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() =>
                                act(
                                  r.id,
                                  () => remove({ data: { id: r.id } }),
                                  'Deleted.',
                                )
                              }
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminResourceDialog resource={editing} onClose={() => setEditing(null)} />
    </>
  )
}
