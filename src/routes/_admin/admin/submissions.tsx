import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { Code2, Search } from 'lucide-react'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { UserAvatar } from '#/components/user-avatar'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ReviewPanel } from '#/components/challenges/review-panel'
import { ReviewStatusPill } from '#/components/challenges/meta'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import { getSubmission, listSubmissions } from '#/server/challenges'

const STATUS_TABS = ['all', 'pending', 'pass', 'fail'] as const
type StatusTab = (typeof STATUS_TABS)[number]

const searchSchema = z.object({
  status: z.enum(STATUS_TABS).optional(),
  challenge: z.string().max(64).optional(),
  id: z.string().max(64).optional(),
})

const submissionQuery = (id: string) =>
  queryOptions({
    queryKey: ['admin-submission', id],
    queryFn: () => getSubmission({ data: { id } }),
    staleTime: 0,
  })

export const Route = createFileRoute('/_admin/admin/submissions')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ status: search.status, challenge: search.challenge }),
  loader: async ({ deps, context, location }) => {
    const id = (location.search as z.infer<typeof searchSchema>).id
    const [list] = await Promise.all([
      listSubmissions({
        data: {
          status: deps.status && deps.status !== 'all' ? deps.status : undefined,
          challengeId: deps.challenge,
        },
      }),
      id ? context.queryClient.ensureQueryData(submissionQuery(id)) : null,
    ])
    return list
  },
  head: () => ({ meta: [{ title: 'Submissions · Admin · RHS Coding Club' }] }),
  component: AdminSubmissions,
})

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const read = () => setDesktop(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])
  return desktop
}

function AdminSubmissions() {
  const { submissions, challenges } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const router = useRouter()
  const queryClient = useQueryClient()
  const desktop = useIsDesktop()
  const [query, setQuery] = useState('')

  const status: StatusTab = search.status ?? 'all'
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return submissions
    return submissions.filter(
      (s) =>
        s.userName.toLowerCase().includes(q) || s.userEmail.toLowerCase().includes(q),
    )
  }, [submissions, query])

  const selectedIndex = visible.findIndex((s) => s.id === search.id)
  const pendingTotal = challenges.reduce((n, c) => n + c.pending, 0)

  const select = (id: string | undefined) =>
    navigate({ search: (prev) => ({ ...prev, id }), replace: true, resetScroll: false })

  const step = (dir: 1 | -1) => {
    if (visible.length === 0) return
    const next =
      selectedIndex < 0
        ? dir === 1
          ? 0
          : visible.length - 1
        : Math.min(visible.length - 1, Math.max(0, selectedIndex + dir))
    void select(visible[next].id)
  }

  // j / k move through the queue (outside text fields).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (
        t?.closest('input, textarea, select, [contenteditable="true"], [role="listbox"]')
      )
        return
      if (e.key === 'j') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'k') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'Escape' && search.id) {
        void select(undefined)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function afterReview(id: string) {
    await Promise.all([
      router.invalidate(),
      queryClient.invalidateQueries({ queryKey: ['admin-submission', id] }),
    ])
    // Move on to the next submission still waiting, if any.
    const after = visible.slice(selectedIndex + 1).find((s) => s.status === 'pending')
    const before = visible.slice(0, selectedIndex).find((s) => s.status === 'pending')
    const next = after ?? before
    if (next && next.id !== id) void select(next.id)
  }

  const detail = search.id ? (
    <SubmissionDetailPane
      id={search.id}
      onPrev={selectedIndex > 0 ? () => step(-1) : undefined}
      onNext={
        selectedIndex >= 0 && selectedIndex < visible.length - 1
          ? () => step(1)
          : undefined
      }
      onReviewed={() => afterReview(search.id as string)}
    />
  ) : null

  return (
    <>
      <AdminPageHeader
        eyebrow="Review"
        title="Submissions"
        description={
          pendingTotal === 0
            ? 'Nothing waiting. Every submission has been reviewed.'
            : `${pendingTotal} waiting for review. Press j and k to move through the queue.`
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs
          value={status}
          onValueChange={(v) =>
            navigate({
              search: (prev) => ({
                ...prev,
                status: v === 'all' ? undefined : (v as StatusTab),
                id: undefined,
              }),
            })
          }
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="pass">Passed</TabsTrigger>
            <TabsTrigger value="fail">Needs work</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select
          value={search.challenge ?? 'all'}
          onValueChange={(v) =>
            navigate({
              search: (prev) => ({
                ...prev,
                challenge: v === 'all' ? undefined : v,
                id: undefined,
              }),
            })
          }
        >
          <SelectTrigger className="w-full sm:w-64" aria-label="Filter by challenge">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All challenges</SelectItem>
            {challenges.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                Week {c.weekNo}: {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-full sm:w-56">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members"
            aria-label="Search by member"
            className="pl-9"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Code2 />} title="No submissions here.">
          {query
            ? 'Nobody by that name in this view.'
            : status === 'pending'
              ? 'The queue is empty. Nice.'
              : 'Try another filter.'}
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <ul
            aria-label="Submissions"
            className="divide-border border-border self-start divide-y overflow-hidden rounded-lg border"
          >
            {visible.map((s) => {
              const active = s.id === search.id
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => select(s.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset',
                      active ? 'bg-accent' : 'hover:bg-muted/60',
                    )}
                  >
                    <UserAvatar
                      user={{
                        name: s.userName,
                        image: s.userImage,
                        avatarKey: s.userAvatarKey,
                      }}
                      className="size-8"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{s.userName}</span>
                        <ReviewStatusPill status={s.status} />
                      </span>
                      <span className="text-muted-foreground mt-0.5 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate">
                          Wk {s.weekNo} · {s.challengeTitle}
                        </span>
                        <span className="tabular shrink-0 font-mono">
                          {fmtDate(s.submittedAt, 'short')}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {desktop && (
            <section
              aria-label="Selected submission"
              className="bg-card border-border hidden self-start rounded-lg border p-5 lg:sticky lg:top-24 lg:block"
            >
              {detail ?? (
                <p className="text-muted-foreground py-16 text-center text-sm">
                  Pick a submission to review it. j and k move through the list.
                </p>
              )}
            </section>
          )}
        </div>
      )}

      {!desktop && (
        <Sheet
          open={Boolean(search.id)}
          onOpenChange={(open) => !open && select(undefined)}
        >
          <SheetContent
            side="right"
            className="w-full overflow-y-auto p-5 pt-12 sm:max-w-lg"
          >
            <SheetTitle className="sr-only">Submission</SheetTitle>
            {detail}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}

function SubmissionDetailPane({
  id,
  onPrev,
  onNext,
  onReviewed,
}: {
  id: string
  onPrev?: () => void
  onNext?: () => void
  onReviewed: () => Promise<void>
}) {
  const { data, isPending, isError } = useQuery(submissionQuery(id))
  if (isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-11 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        That submission is gone. It may have been deleted with its challenge.
      </p>
    )
  }
  return (
    <ReviewPanel
      key={`${data.id}-${data.status}`}
      submission={data}
      onPrev={onPrev}
      onNext={onNext}
      onReviewed={onReviewed}
    />
  )
}
