import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { fieldErrors, serverMessage } from '#/components/account/form-helpers'
import { EmptyState } from '#/components/empty-state'
import { LedgerList } from '#/components/members/ledger-list'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
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
import { fmtDate } from '#/lib/format'
import { ROLES, hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import { ROLE_LABEL, adjustPointsSchema } from '#/lib/schemas/users'
import { cn } from '#/lib/utils'
import { adjustUserPoints, getUser, listAllUsers, setUserRole } from '#/server/users'
import type { UserDetail } from '#/services/members'

const searchSchema = z.object({
  q: z.string().max(100).optional(),
  role: z
    .enum([...ROLES, 'all'])
    .optional()
    .catch(undefined),
  user: z.string().max(64).optional(),
})

export const Route = createFileRoute('/_admin/admin/users')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ q: search.q ?? '', role: search.role ?? 'all' }),
  loader: ({ deps }) => listAllUsers({ data: deps }),
  head: () => ({ meta: [{ title: 'Users · Admin · RHS Coding Club' }] }),
  component: AdminUsers,
})

const ROLE_PILL: Record<Role, string> = {
  guest: 'bg-muted text-muted-foreground',
  member: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  officer: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',
  admin: 'bg-amber-500/14 text-amber-700 dark:text-amber-300',
}

function RolePill({ role }: { role: Role }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs', ROLE_PILL[role])}>
      {ROLE_LABEL[role]}
    </span>
  )
}

function AdminUsers() {
  const rows = Route.useLoaderData()
  const search = Route.useSearch()
  const { user: me } = Route.useRouteContext()
  const navigate = useNavigate({ from: Route.fullPath })
  const [q, setQ] = useState(search.q ?? '')

  // Search as you type, debounced, kept in the URL.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((search.q ?? '') !== q.trim())
        void navigate({
          search: (s) => ({ ...s, q: q.trim() || undefined }),
          replace: true,
        })
    }, 250)
    return () => clearTimeout(t)
  }, [q, search.q, navigate])

  return (
    <>
      <AdminPageHeader
        eyebrow="People"
        title="Users"
        description={
          hasRole(me.role, 'admin')
            ? 'Everyone with an account. Open a row to change a role or adjust points.'
            : 'Everyone with an account. Only admins can change roles or points.'
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
            className="pl-9"
          />
        </div>
        <Select
          value={search.role ?? 'all'}
          onValueChange={(v) =>
            void navigate({
              search: (s) => ({ ...s, role: v === 'all' ? undefined : (v as Role) }),
            })
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABEL[r]}s
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Users />} title="No users match.">
          Try a different search or role.
        </EmptyState>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer"
                  data-state={search.user === u.id ? 'selected' : undefined}
                  onClick={() => void navigate({ search: (s) => ({ ...s, user: u.id }) })}
                >
                  <TableCell>
                    <button
                      type="button"
                      className="flex items-center gap-3 text-left outline-none focus-visible:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        void navigate({ search: (s) => ({ ...s, user: u.id }) })
                      }}
                    >
                      <UserAvatar user={u} className="size-8" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {u.name}
                          {u.id === me.id && (
                            <span className="text-muted-foreground font-normal">
                              {' '}
                              (you)
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {u.email}
                        </span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <RolePill role={u.role} />
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {u.points.toLocaleString('en-US')}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs sm:table-cell">
                    {fmtDate(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet
        open={Boolean(search.user)}
        onOpenChange={(open) => {
          if (!open) void navigate({ search: (s) => ({ ...s, user: undefined }) })
        }}
      >
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
          {search.user && (
            <UserPanel
              id={search.user}
              meId={me.id}
              canEdit={hasRole(me.role, 'admin')}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function UserPanel({
  id,
  meId,
  canEdit,
}: {
  id: string
  meId: string
  canEdit: boolean
}) {
  const { data, isPending } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => getUser({ data: { userId: id } }),
    staleTime: 0,
  })
  if (isPending)
    return (
      <div className="flex flex-col gap-4 p-6">
        <SheetTitle className="sr-only">Loading user</SheetTitle>
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  if (!data)
    return (
      <div className="p-6">
        <SheetTitle>User not found</SheetTitle>
      </div>
    )
  return <UserBody detail={data} self={data.user.id === meId} canEdit={canEdit} />
}

function UserBody({
  detail,
  self,
  canEdit,
}: {
  detail: UserDetail
  self: boolean
  canEdit: boolean
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, points, ledger } = detail
  const [role, setRole] = useState<Role>(user.role)
  const [savingRole, setSavingRole] = useState(false)
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [adjusting, setAdjusting] = useState(false)

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-user', user.id] })
    await router.invalidate()
  }

  async function saveRole() {
    setSavingRole(true)
    try {
      const r = await setUserRole({ data: { userId: user.id, role } })
      toast.success(
        r.changed
          ? `${user.name} is now ${ROLE_LABEL[role].toLowerCase()}.`
          : 'No change.',
      )
      await refresh()
    } catch (err) {
      toast.error(serverMessage(err))
      setRole(user.role)
    } finally {
      setSavingRole(false)
    }
  }

  async function adjust(e: React.FormEvent) {
    e.preventDefault()
    const parsed = adjustPointsSchema.safeParse({
      userId: user.id,
      delta: delta.trim() === '' ? Number.NaN : Number(delta),
      note,
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setAdjusting(true)
    try {
      const r = await adjustUserPoints({ data: parsed.data })
      toast.success(
        `${parsed.data.delta > 0 ? 'Added' : 'Removed'} ${Math.abs(parsed.data.delta)} points.` +
          (r.awarded.length
            ? ` New badge: ${r.awarded.map((b) => b.name).join(', ')}.`
            : ''),
      )
      setDelta('')
      setNote('')
      await refresh()
    } catch (err) {
      toast.error(serverMessage(err))
    } finally {
      setAdjusting(false)
    }
  }

  return (
    <>
      <SheetHeader className="border-border border-b p-6">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} className="size-12" />
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate text-xl">{user.name}</SheetTitle>
            <SheetDescription className="truncate">
              {user.email} · joined {fmtDate(user.createdAt)}
            </SheetDescription>
          </div>
          {user.role !== 'guest' && (
            <RaisedButton asChild variant="ghost" size="icon" aria-label="Public profile">
              <Link to="/members/$id" params={{ id: user.id }} target="_blank">
                <ExternalLink />
              </Link>
            </RaisedButton>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat term="All time" value={points.allTime.toLocaleString('en-US')} />
          <MiniStat
            term="This semester"
            value={points.semester.toLocaleString('en-US')}
          />
          <MiniStat term="Badges" value={String(detail.badges.length)} />
        </dl>
      </SheetHeader>

      <section className="border-border border-b p-6" aria-labelledby="role-heading">
        <h3 id="role-heading" className="font-medium">
          Role
        </h3>
        {canEdit && !self ? (
          <div className="mt-3 flex gap-2">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="flex-1" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RaisedButton
              disabled={role === user.role}
              loading={savingRole}
              onClick={() => void saveRole()}
            >
              Save role
            </RaisedButton>
          </div>
        ) : (
          <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
            <RolePill role={user.role} />
            {self
              ? 'You can’t change your own role. Ask another admin.'
              : 'Only admins can change roles.'}
          </p>
        )}
        {detail.application && (
          <p className="text-muted-foreground mt-3 text-xs">
            Latest application: {detail.application.status},{' '}
            {fmtDate(detail.application.createdAt)}.{' '}
            <Link
              to="/admin/applications"
              search={{ status: 'all', id: detail.application.id }}
              className="text-primary underline-offset-4 hover:underline"
            >
              Open
            </Link>
          </p>
        )}
      </section>

      {canEdit && (
        <section className="border-border border-b p-6" aria-labelledby="adjust-heading">
          <h3 id="adjust-heading" className="font-medium">
            Adjust points
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Adds a manual entry to the ledger. Use a negative number to take points away.
            The member sees your note.
          </p>
          <form
            onSubmit={adjust}
            className="mt-4 grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delta">Points</Label>
              <Input
                id="delta"
                inputMode="numeric"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                placeholder="+50"
                className="font-mono"
                aria-invalid={Boolean(errors.delta)}
                aria-describedby={errors.delta ? 'delta-error' : undefined}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note">Reason</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ran the lunch session on recursion"
                maxLength={200}
                aria-invalid={Boolean(errors.note)}
                aria-describedby={errors.note ? 'note-error' : undefined}
              />
            </div>
            {(errors.delta || errors.note) && (
              <div className="sm:col-span-2">
                {errors.delta && (
                  <p id="delta-error" role="alert" className="text-destructive text-sm">
                    {errors.delta}
                  </p>
                )}
                {errors.note && (
                  <p id="note-error" role="alert" className="text-destructive text-sm">
                    {errors.note}
                  </p>
                )}
              </div>
            )}
            <div className="sm:col-span-2">
              <RaisedButton
                type="submit"
                variant="outline"
                loading={adjusting}
                loadingText="Saving…"
              >
                Add to ledger
              </RaisedButton>
            </div>
          </form>
        </section>
      )}

      <section className="p-6" aria-labelledby="ledger-heading">
        <h3 id="ledger-heading" className="font-medium">
          Ledger
        </h3>
        {ledger.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-sm">No points yet.</p>
        ) : (
          <LedgerList entries={ledger} showSource className="mt-2" />
        )}
      </section>
    </>
  )
}

function MiniStat({ term, value }: { term: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg px-3 py-2">
      <dt className="text-muted-foreground text-xs">{term}</dt>
      <dd className="font-mono text-lg font-medium tabular-nums">{value}</dd>
    </div>
  )
}
