import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Rocket,
  Trash2,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { DifficultyPill } from '#/components/challenges/meta'
import { DeleteChallengeDialog } from '#/components/challenges/delete-challenge'
import { fmtDate } from '#/lib/format'
import { challengeState } from '#/lib/schemas/challenges'
import type { ChallengeState } from '#/lib/schemas/challenges'
import { cn } from '#/lib/utils'
import { listAdminChallenges, publishChallenge } from '#/server/challenges'

export const Route = createFileRoute('/_admin/admin/challenges/')({
  loader: () => listAdminChallenges(),
  head: () => ({ meta: [{ title: 'Challenges · Admin · RHS Coding Club' }] }),
  component: AdminChallenges,
})

type Row = ReturnType<typeof Route.useLoaderData>['challenges'][number]

function AdminChallenges() {
  const { challenges } = Route.useLoaderData()
  const router = useRouter()
  const publish = useServerFn(publishChallenge)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const now = new Date()

  async function setPublished(row: Row, mode: 'now' | 'draft') {
    setBusy(row.id)
    try {
      const res = await publish({ data: { id: row.id, mode } })
      toast.success(mode === 'now' ? 'Published' : 'Moved back to drafts', {
        description:
          mode === 'now'
            ? res.announced
              ? 'Members were emailed.'
              : 'It is live.'
            : 'Members can no longer see it.',
      })
      await router.invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update it.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Challenges"
        description="One problem a week. Drafts and scheduled challenges stay hidden until they go live, and members get an email when they do."
        actions={
          <RaisedButton asChild>
            <Link to="/admin/challenges/new">
              <Plus aria-hidden="true" />
              New challenge
            </Link>
          </RaisedButton>
        }
      />

      {challenges.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No challenges yet."
          action={
            <RaisedButton asChild>
              <Link to="/admin/challenges/new">Write the first one</Link>
            </RaisedButton>
          }
        >
          Write week 1 and schedule it for Monday morning.
        </EmptyState>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Week</TableHead>
                <TableHead>Challenge</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Difficulty</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Submissions
                </TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenges.map((row) => {
                const state = challengeState(row.publishedAt, now)
                return (
                  <TableRow key={row.id} aria-busy={busy === row.id}>
                    <TableCell className="tabular font-mono">{row.weekNo}</TableCell>
                    <TableCell className="max-w-0 min-w-48">
                      <Link
                        to="/admin/challenges/$id"
                        params={{ id: row.id }}
                        className="block truncate font-medium hover:underline"
                      >
                        {row.title}
                      </Link>
                      <span className="text-muted-foreground block truncate text-xs">
                        {row.description}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2 md:hidden">
                        <StateLabel state={state} publishedAt={row.publishedAt} />
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <StateLabel state={state} publishedAt={row.publishedAt} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="flex items-center gap-2">
                        <DifficultyPill difficulty={row.difficulty} />
                        <span className="text-muted-foreground tabular font-mono text-xs">
                          {row.points}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-right lg:table-cell">
                      {row.submissions === 0 ? (
                        <span className="text-muted-foreground">None</span>
                      ) : (
                        <Link
                          to="/admin/submissions"
                          search={{ challenge: row.id }}
                          className="tabular inline-flex items-center gap-2 font-mono text-sm hover:underline"
                        >
                          {row.submissions}
                          {row.pending > 0 && (
                            <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                              {row.pending} to review
                            </span>
                          )}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <RaisedButton
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${row.title}`}
                            loading={busy === row.id}
                          >
                            <MoreHorizontal aria-hidden="true" />
                          </RaisedButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/challenges/$id" params={{ id: row.id }}>
                              <Pencil aria-hidden="true" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/challenges/$id" params={{ id: row.id }}>
                              <Eye aria-hidden="true" />
                              {state === 'live' ? 'View on site' : 'Preview'}
                            </Link>
                          </DropdownMenuItem>
                          {state === 'live' ? (
                            <DropdownMenuItem onSelect={() => setPublished(row, 'draft')}>
                              <Undo2 aria-hidden="true" />
                              Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => setPublished(row, 'now')}>
                              <Rocket aria-hidden="true" />
                              Publish now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleting(row)}
                          >
                            <Trash2 aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteChallengeDialog
        challenge={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={() => router.invalidate()}
      />
    </>
  )
}

function StateLabel({
  state,
  publishedAt,
}: {
  state: ChallengeState
  publishedAt: Date | null
}) {
  const dot = {
    draft: 'bg-muted-foreground/50',
    scheduled: 'bg-amber-500',
    live: 'bg-emerald-500',
  }[state]
  return (
    <span className="inline-flex items-center gap-2 text-sm whitespace-nowrap">
      <span aria-hidden="true" className={cn('size-2 rounded-full', dot)} />
      {state === 'draft' && <span className="text-muted-foreground">Draft</span>}
      {state === 'scheduled' && publishedAt && (
        <span>Scheduled for {fmtDate(publishedAt, 'datetime')}</span>
      )}
      {state === 'live' && publishedAt && (
        <span>
          Live{' '}
          <span className="text-muted-foreground">
            since {fmtDate(publishedAt, 'short')}
          </span>
        </span>
      )}
    </span>
  )
}
