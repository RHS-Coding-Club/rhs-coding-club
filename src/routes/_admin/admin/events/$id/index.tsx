import { useEffect, useId, useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Pencil,
  Presentation,
  RefreshCw,
  Search,
  UserCheck,
  UserMinus,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getAttendance,
  getEventForm,
  markAttendance,
  regenerateCheckInCode,
  searchMembersForEvent,
  setCheckIn,
} from '#/server/events'
import type { AttendanceSheet } from '#/services/events'
import type { EventFormValues } from '#/lib/schemas/events'
import { fmtEventWhen } from '#/lib/events'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { EventFormDialog } from '#/components/events/event-form-dialog'
import { QrCode } from '#/components/events/qr-code'
import { errorMessage } from '#/components/events/rsvp'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export const Route = createFileRoute('/_admin/admin/events/$id/')({
  loader: ({ params }) => getAttendance({ data: { eventId: params.id } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Attendance: ${loaderData.event.title} · Admin · RHS Coding Club`
          : 'Attendance · Admin · RHS Coding Club',
      },
    ],
  }),
  component: AttendancePage,
})

const RSVP_LABEL = { yes: 'Going', maybe: 'Maybe', no: "Can't make it" } as const

function AttendancePage() {
  const sheet = Route.useLoaderData()
  const router = useRouter()
  const { event } = sheet
  const [editing, setEditing] = useState<{ id: string; values: EventFormValues } | null>(
    null,
  )
  const [formOpen, setFormOpen] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)

  // While check-in is open, keep the roster fresh as members scan in.
  useEffect(() => {
    if (!event.checkInOpen) return
    const t = window.setInterval(() => void router.invalidate(), 8000)
    return () => window.clearInterval(t)
  }, [event.checkInOpen, router])

  const openEdit = async () => {
    setLoadingEdit(true)
    try {
      setEditing(await getEventForm({ data: { eventId: event.id } }))
      setFormOpen(true)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setLoadingEdit(false)
    }
  }

  return (
    <>
      <Link
        to="/admin/events"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All events
      </Link>
      <AdminPageHeader
        eyebrow="Attendance"
        title={event.title}
        description={`${fmtEventWhen(event.startsAt, event.endsAt)} · ${event.location}`}
        actions={
          <>
            <RaisedButton
              variant="outline"
              onClick={() => void openEdit()}
              loading={loadingEdit}
            >
              <Pencil aria-hidden="true" />
              Edit
            </RaisedButton>
            <RaisedButton asChild variant="secondary">
              <a
                href={`/admin/events/${event.id}/present`}
                target="_blank"
                rel="noreferrer"
              >
                <Presentation aria-hidden="true" />
                Present
              </a>
            </RaisedButton>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <CheckInControls sheet={sheet} />
        <Stats counts={sheet.counts} />
      </div>

      <MarkMember eventId={event.id} />

      <Roster sheet={sheet} />

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={() => void router.invalidate()}
      />
    </>
  )
}

function CheckInControls({ sheet }: { sheet: AttendanceSheet }) {
  const router = useRouter()
  const { event, window: win, timing } = sheet
  const [toggling, setToggling] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const switchId = useId()

  const toggle = async (open: boolean) => {
    setToggling(true)
    try {
      await setCheckIn({ data: { eventId: event.id, open } })
      await router.invalidate()
      toast.success(open ? 'Check-in is open.' : 'Check-in is closed.')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setToggling(false)
    }
  }
  const regenerate = async () => {
    setRegenerating(true)
    try {
      const { code } = await regenerateCheckInCode({ data: { eventId: event.id } })
      await router.invalidate()
      toast.success(`New code: ${code}. The old QR code no longer works.`)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setRegenerating(false)
    }
  }
  const copy = async () => {
    if (!sheet.checkInUrl) return
    await navigator.clipboard.writeText(sheet.checkInUrl)
    toast.success('Check-in link copied.')
  }

  const status = !event.checkInOpen
    ? timing === 'late'
      ? `Closed. The check-in window ended ${fmtDate(win.closesAt, 'datetime')}. Mark people present by hand below.`
      : `Closed. Open it when the meeting starts. Members can check in from ${fmtDate(win.opensAt, 'datetime')} to ${fmtDate(win.closesAt, 'time')}.`
    : timing === 'open'
      ? `Open. Members can check in until ${fmtDate(win.closesAt, 'datetime')}.`
      : timing === 'early'
        ? `Open, but the window starts at ${fmtDate(win.opensAt, 'datetime')}.`
        : `Open, but the window ended at ${fmtDate(win.closesAt, 'datetime')}. Mark latecomers by hand.`

  return (
    <section
      aria-labelledby="check-in-heading"
      className="border-border flex flex-col gap-5 rounded-lg border p-5 sm:flex-row sm:items-start"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="check-in-heading" className="text-lg font-semibold">
            Check-in
          </h2>
          <div className="flex items-center gap-2.5">
            <Label htmlFor={switchId} className="text-sm">
              {event.checkInOpen ? 'Open' : 'Closed'}
            </Label>
            <Switch
              id={switchId}
              checked={event.checkInOpen}
              disabled={toggling}
              onCheckedChange={(v) => void toggle(v)}
            />
          </div>
        </div>
        <p
          className={cn(
            'text-sm',
            event.checkInOpen && timing === 'open'
              ? 'text-foreground'
              : 'text-muted-foreground',
          )}
        >
          {status}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs">Code</p>
            {event.checkInCode ? (
              <p
                className="font-mono text-3xl font-semibold tracking-[0.3em] tabular-nums"
                aria-label={`Code ${event.checkInCode.split('').join(' ')}`}
              >
                {event.checkInCode}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Generated when you open check-in.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <RaisedButton
              variant="outline"
              size="sm"
              onClick={() => void regenerate()}
              loading={regenerating}
              loadingText="Generating"
            >
              <RefreshCw aria-hidden="true" />
              {event.checkInCode ? 'New code' : 'Generate code'}
            </RaisedButton>
            {sheet.checkInUrl && (
              <RaisedButton variant="ghost" size="sm" onClick={() => void copy()}>
                <Copy aria-hidden="true" />
                Copy link
              </RaisedButton>
            )}
          </div>
        </div>
      </div>
      {sheet.checkInUrl && (
        <a
          href={`/admin/events/${event.id}/present`}
          target="_blank"
          rel="noreferrer"
          className="group focus-visible:ring-ring/50 relative block shrink-0 self-center overflow-hidden rounded-md ring-1 ring-black/10 outline-none focus-visible:ring-3"
          title="Open the projector view"
        >
          <QrCode value={sheet.checkInUrl} label="Check-in QR code" className="size-36" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/70 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ExternalLink className="size-3" aria-hidden="true" />
            Present
          </span>
        </a>
      )}
    </section>
  )
}

function Stats({ counts }: { counts: AttendanceSheet['counts'] }) {
  const items = [
    { label: 'Checked in', n: counts.attended, strong: true },
    { label: 'Going', n: counts.going },
    { label: 'Maybe', n: counts.maybe },
    { label: "Can't", n: counts.declined },
  ]
  return (
    <dl className="border-border grid grid-cols-4 divide-x rounded-lg border lg:w-80 lg:grid-cols-2 lg:divide-x-0">
      {items.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            'flex flex-col gap-1 px-4 py-3',
            'lg:border-border lg:nth-[n+3]:border-t lg:odd:border-r',
            i === 0 && 'lg:bg-muted/40',
          )}
        >
          <dt className="text-muted-foreground text-xs">{s.label}</dt>
          <dd
            className={cn(
              'font-mono text-2xl tabular-nums',
              s.strong ? 'font-semibold' : 'text-foreground/80',
            )}
          >
            {s.n}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms)
    return () => window.clearTimeout(t)
  }, [value, ms])
  return v
}

type Match = Awaited<ReturnType<typeof searchMembersForEvent>>[number]

/** Search members by name or email and mark them present by hand. */
function MarkMember({ eventId }: { eventId: string }) {
  const router = useRouter()
  const inputId = useId()
  const [query, setQuery] = useState('')
  const debounced = useDebounced(query.trim(), 200)
  const [results, setResults] = useState<Match[]>([])
  const [searching, setSearching] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (!debounced) {
      setResults([])
      return
    }
    let live = true
    setSearching(true)
    searchMembersForEvent({ data: { eventId, query: debounced } })
      .then((r) => live && setResults(r))
      .catch((err: unknown) => live && toast.error(errorMessage(err)))
      .finally(() => live && setSearching(false))
    return () => {
      live = false
    }
  }, [debounced, eventId])

  const mark = async (m: Match, present: boolean) => {
    setBusy(m.id)
    try {
      await markAttendance({ data: { eventId, userId: m.id, present } })
      setResults((rs) => rs.map((r) => (r.id === m.id ? { ...r, present } : r)))
      await router.invalidate()
      toast.success(present ? `${m.name} marked present.` : `${m.name} marked absent.`)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby={`${inputId}-heading`} className="mt-8">
      <h2 id={`${inputId}-heading`} className="mb-3 text-lg font-semibold">
        Mark someone present
      </h2>
      <div className="relative max-w-md">
        <Label htmlFor={inputId} className="sr-only">
          Search members by name or email
        </Label>
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members by name or email"
          autoComplete="off"
          className="pl-9"
        />
      </div>
      {debounced && (
        <div className="mt-3 max-w-md" aria-live="polite">
          {results.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {searching
                ? 'Searching…'
                : 'No members match. Guests have to be approved first.'}
            </p>
          ) : (
            <ul className="border-border divide-border divide-y rounded-lg border">
              {results.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar user={m} className="size-8" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.name}</span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {m.email}
                    </span>
                  </span>
                  {m.present ? (
                    <RaisedButton
                      size="sm"
                      variant="ghost"
                      onClick={() => void mark(m, false)}
                      loading={busy === m.id}
                    >
                      <UserMinus aria-hidden="true" />
                      Unmark
                    </RaisedButton>
                  ) : (
                    <RaisedButton
                      size="sm"
                      onClick={() => void mark(m, true)}
                      loading={busy === m.id}
                    >
                      <UserCheck aria-hidden="true" />
                      Mark present
                    </RaisedButton>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function Roster({ sheet }: { sheet: AttendanceSheet }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const toggle = async (userId: string, name: string, present: boolean) => {
    setBusy(userId)
    try {
      await markAttendance({ data: { eventId: sheet.event.id, userId, present } })
      await router.invalidate()
      toast.success(
        present
          ? `${name} marked present. +${sheet.points} points.`
          : `${name} marked absent. Points reversed.`,
      )
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="roster-heading" className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="roster-heading" className="text-lg font-semibold">
          RSVPs and attendance
        </h2>
        <p className="text-muted-foreground text-xs">
          Marking present gives {sheet.points} points; unmarking takes them back.
        </p>
      </div>
      {sheet.roster.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-10 text-center text-sm">
          No RSVPs or check-ins yet.
        </p>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Checked in</TableHead>
                <TableHead className="text-right">Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sheet.roster.map((r) => {
                const isGuest = r.user.role === 'guest'
                return (
                  <TableRow key={r.user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={r.user} className="size-8" />
                        <div className="min-w-0">
                          <span className="block truncate font-medium">
                            {r.user.name}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {r.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.rsvp ? (
                        <span
                          className={cn(
                            'text-xs',
                            r.rsvp === 'yes'
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground',
                          )}
                        >
                          {RSVP_LABEL[r.rsvp]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No RSVP</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {r.attendance ? (
                        <>
                          <span className="block">
                            {fmtDate(r.attendance.markedAt, 'time')}
                          </span>
                          <span className="text-muted-foreground">
                            {r.attendance.self
                              ? 'Self check-in'
                              : r.attendance.markedByName
                                ? `By ${r.attendance.markedByName}`
                                : 'Marked by hand'}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Not yet</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isGuest ? (
                        <span className="text-muted-foreground text-xs">Guest</span>
                      ) : (
                        <Switch
                          checked={!!r.attendance}
                          disabled={busy === r.user.id}
                          aria-label={`${r.user.name} present`}
                          onCheckedChange={(v) => void toggle(r.user.id, r.user.name, v)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
