import { useMemo, useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import {
  Check,
  ExternalLink,
  FolderGit2,
  Github,
  Globe,
  Pencil,
  Search,
  Star,
  Undo2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { ProjectCover } from '#/components/projects/project-cover'
import { TeamAvatars, teamNames } from '#/components/projects/team-avatars'
import { TechChip } from '#/components/projects/tech-chip'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { fileUrl } from '#/lib/files'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import type { ProjectDecision } from '#/lib/schemas/projects'
import { featureProject, listProjectReviewQueue, reviewProject } from '#/server/projects'
import type { QueueProject } from '#/services/projects'
import { safeHref } from '#/lib/rich-text'

export const Route = createFileRoute('/_admin/admin/projects')({
  loader: () => listProjectReviewQueue(),
  head: () => ({ meta: [{ title: 'Projects · Admin · RHS Coding Club' }] }),
  component: AdminProjects,
})

type Filter = 'pending' | 'rejected' | 'approved' | 'all'

function AdminProjects() {
  const projects = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  const router = useRouter()
  const pendingCount = projects.filter((p) => p.status === 'pending').length
  const [filter, setFilter] = useState<Filter>(pendingCount ? 'pending' : 'all')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const counts = useMemo(
    () => ({
      pending: pendingCount,
      rejected: projects.filter((p) => p.status === 'rejected').length,
      approved: projects.filter((p) => p.status === 'approved').length,
      all: projects.length,
    }),
    [projects, pendingCount],
  )

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return projects.filter(
      (p) =>
        (filter === 'all' || p.status === filter) &&
        (!term ||
          [p.title, ...p.tech, ...p.team.map((m) => m.name)]
            .join(' ')
            .toLowerCase()
            .includes(term)),
    )
  }, [projects, filter, q])

  const open = projects.find((p) => p.id === openId) ?? null

  async function toggleFeatured(p: QueueProject, featured: boolean) {
    setBusy(`feature:${p.id}`)
    try {
      await featureProject({ data: { id: p.id, featured } })
      toast.success(
        featured ? `${p.title} is featured.` : `${p.title} is no longer featured.`,
      )
      await router.invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the project.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin"
        title="Projects"
        description="Review team submissions. Approving pays every teammate the project points; rejecting or un-approving takes them back."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {(['pending', 'rejected', 'approved', 'all'] as const).map((f) => (
              <TabsTrigger key={f} value={f} className="capitalize">
                {f}
                <span className="text-muted-foreground ml-1.5 font-mono text-xs">
                  {counts[f]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Label htmlFor="admin-project-search" className="sr-only">
            Search projects
          </Label>
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="admin-project-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, tech, or teammate"
            className="pl-9"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<FolderGit2 />} title="Nothing here">
          {filter === 'pending'
            ? 'The review queue is empty. New submissions show up here.'
            : 'No projects match.'}
        </EmptyState>
      ) : (
        <div className="bg-card overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead className="hidden lg:table-cell">Featured</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setOpenId(p.id)}
                      className="group flex items-center gap-3 text-left outline-none"
                    >
                      <span className="bg-brand-navy relative block h-10 w-14 shrink-0 overflow-hidden rounded-md">
                        <ProjectCover
                          project={p}
                          initialDark={theme === 'dark'}
                          height={430}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[16rem] truncate font-medium group-hover:underline group-focus-visible:underline">
                          {p.title}
                        </span>
                        <span className="text-muted-foreground block max-w-[16rem] truncate font-mono text-xs">
                          {p.tech.join(' · ') || 'No stack listed'}
                        </span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <TeamAvatars team={p.team} size="size-7" max={3} />
                      <span className="text-muted-foreground max-w-[10rem] truncate text-xs">
                        {teamNames(p.team)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={p.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                    {fmtDate(p.updatedAt)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Switch
                      checked={p.featured}
                      disabled={p.status !== 'approved' || busy === `feature:${p.id}`}
                      onCheckedChange={(v) => void toggleFeatured(p, v)}
                      aria-label={`Feature ${p.title}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <RaisedButton
                      size="sm"
                      variant={p.status === 'pending' ? 'primary' : 'outline'}
                      onClick={() => setOpenId(p.id)}
                    >
                      {p.status === 'pending' ? 'Review' : 'Open'}
                    </RaisedButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={Boolean(open)} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
          {open && (
            <ReviewPanel
              key={open.id}
              project={open}
              initialDark={theme === 'dark'}
              busy={busy}
              onFeature={(v) => void toggleFeatured(open, v)}
              onDone={async () => {
                await router.invalidate()
              }}
              setBusy={setBusy}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function StatusPill({ status }: { status: QueueProject['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1',
        status === 'pending' && 'bg-brand-sky/12 text-foreground ring-brand-sky/40',
        status === 'approved' &&
          'bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300',
        status === 'rejected' &&
          'bg-amber-500/12 text-amber-800 ring-amber-500/30 dark:text-amber-200',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 rounded-full',
          status === 'pending' && 'bg-brand-sky',
          status === 'approved' && 'bg-emerald-500',
          status === 'rejected' && 'bg-amber-500',
        )}
      />
      {status}
    </span>
  )
}

function ReviewPanel({
  project: p,
  initialDark,
  busy,
  setBusy,
  onFeature,
  onDone,
}: {
  project: QueueProject
  initialDark: boolean
  busy: string | null
  setBusy: (v: string | null) => void
  onFeature: (featured: boolean) => void
  onDone: () => Promise<void>
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  async function decide(decision: ProjectDecision) {
    if (decision === 'reject' && reason.trim().length < 3) {
      setReasonError('Tell the team what to change so they can fix it.')
      document.getElementById('reject-reason')?.focus()
      return
    }
    setBusy(decision)
    try {
      const r = await reviewProject({
        data: { id: p.id, decision, reason: decision === 'reject' ? reason : undefined },
      })
      toast.success(
        decision === 'approve'
          ? `Approved. ${p.team.length} ${p.team.length === 1 ? 'member' : 'members'} earned ${r.points} points.`
          : decision === 'reject'
            ? 'Sent back to the team with your note.'
            : 'Moved back to the review queue. Points were taken back.',
      )
      setRejecting(false)
      setReason('')
      await onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the project.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <SheetHeader className="border-b p-5 pr-12">
        <div className="flex items-center gap-2">
          <StatusPill status={p.status} />
          {p.year && (
            <span className="text-muted-foreground font-mono text-xs">{p.year}</span>
          )}
        </div>
        <SheetTitle className="text-xl">{p.title}</SheetTitle>
        <SheetDescription>
          Submitted {fmtDate(p.createdAt)} by {p.team[0]?.name ?? 'a member'}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 p-5">
        {p.imageKeys.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2" aria-label="Screenshots">
            {p.imageKeys.map((key, i) => (
              <li key={key} className={cn(i === 0 && 'col-span-2')}>
                <a
                  href={fileUrl(key)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-muted relative block aspect-video overflow-hidden rounded-lg"
                >
                  <img
                    src={fileUrl(key)}
                    alt={`Screenshot ${i + 1}`}
                    className="absolute inset-0 size-full object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-brand-navy relative aspect-[2/1] overflow-hidden rounded-lg">
            <ProjectCover project={p} initialDark={initialDark} height={300} />
            <span className="bg-background/85 absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-xs">
              No screenshots, generated cover
            </span>
          </div>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-line">{p.description}</p>

        {p.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.tech.map((t) => (
              <TechChip key={t}>{t}</TechChip>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-sm">
          {p.repoUrl && (
            <a
              href={safeHref(p.repoUrl) ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              <Github className="size-4" aria-hidden="true" />
              {p.repoUrl.replace(/^https:\/\/(www\.)?/, '')}
            </a>
          )}
          {p.demoUrl && (
            <a
              href={safeHref(p.demoUrl) ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              <Globe className="size-4" aria-hidden="true" />
              {p.demoUrl.replace(/^https:\/\/(www\.)?/, '')}
            </a>
          )}
          {!p.repoUrl && !p.demoUrl && (
            <span className="text-muted-foreground">No links provided.</span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium">Team ({p.team.length})</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {p.team.map((m, i) => (
              <li key={m.id} className="flex items-center gap-2.5 text-sm">
                <UserAvatar user={m} className="size-7" />
                {m.name}
                {i === 0 && (
                  <span className="text-muted-foreground text-xs">submitter</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {p.status === 'rejected' && p.rejectionReason && (
          <div className="rounded-lg bg-amber-500/10 p-3 text-sm ring-1 ring-amber-500/25">
            <p className="font-medium">Rejection note</p>
            <p className="text-muted-foreground mt-1">{p.rejectionReason}</p>
          </div>
        )}

        {p.status === 'approved' && (
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <Label htmlFor="feature-switch" className="flex items-center gap-1.5">
                <Star className="size-4" aria-hidden="true" />
                Featured
              </Label>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Featured projects lead the showcase and the home page.
              </p>
            </div>
            <Switch
              id="feature-switch"
              checked={p.featured}
              disabled={busy === `feature:${p.id}`}
              onCheckedChange={onFeature}
            />
          </div>
        )}

        {rejecting && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject-reason">What should the team change?</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setReasonError(null)
              }}
              rows={3}
              maxLength={500}
              placeholder="Add a screenshot and a repo link so we can try it."
              aria-invalid={reasonError ? true : undefined}
              aria-describedby={reasonError ? 'reject-reason-error' : undefined}
            />
            {reasonError && (
              <p
                id="reject-reason-error"
                role="alert"
                className="text-destructive text-sm"
              >
                {reasonError}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Every teammate gets this note by email.
            </p>
          </div>
        )}
      </div>

      <div className="bg-background sticky bottom-0 flex flex-wrap items-center gap-2 border-t p-4">
        {rejecting ? (
          <>
            <RaisedButton
              variant="secondary"
              loading={busy === 'reject'}
              loadingText="Sending…"
              onClick={() => void decide('reject')}
            >
              <X aria-hidden="true" />
              Send back
            </RaisedButton>
            <RaisedButton variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </RaisedButton>
          </>
        ) : (
          <>
            {p.status !== 'approved' && (
              <RaisedButton
                loading={busy === 'approve'}
                loadingText="Approving…"
                onClick={() => void decide('approve')}
              >
                <Check aria-hidden="true" />
                Approve
              </RaisedButton>
            )}
            {p.status !== 'rejected' && p.status !== 'approved' && (
              <RaisedButton variant="outline" onClick={() => setRejecting(true)}>
                <X aria-hidden="true" />
                Reject
              </RaisedButton>
            )}
            {p.status === 'approved' && (
              <RaisedButton
                variant="outline"
                loading={busy === 'unapprove'}
                loadingText="Updating…"
                onClick={() => void decide('unapprove')}
              >
                <Undo2 aria-hidden="true" />
                Un-approve
              </RaisedButton>
            )}
            <div className="ml-auto flex gap-1">
              <RaisedButton asChild variant="ghost" size="icon" aria-label="Edit project">
                <Link to="/projects/$id/edit" params={{ id: p.id }} title="Edit project">
                  <Pencil />
                </Link>
              </RaisedButton>
              <RaisedButton
                asChild
                variant="ghost"
                size="icon"
                aria-label="Open project page"
              >
                <Link to="/projects/$id" params={{ id: p.id }} title="Open project page">
                  <ExternalLink />
                </Link>
              </RaisedButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
