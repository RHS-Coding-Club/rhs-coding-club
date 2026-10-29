import { useState } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import {
  CalendarDays,
  ClipboardCheck,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Presentation,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteEvent, getEventForm, listAdminEvents } from '#/server/events'
import type { AdminEventRow } from '#/services/events'
import type { EventFormValues } from '#/lib/schemas/events'
import { eventPhase, fmtTimeRange, tagLabel } from '#/lib/events'
import { fmtDate } from '#/lib/format'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { RaisedButton } from '#/components/raised-button'
import { EmptyState } from '#/components/empty-state'
import { EventFormDialog } from '#/components/events/event-form-dialog'
import { errorMessage } from '#/components/events/rsvp'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

export const Route = createFileRoute('/_admin/admin/events/')({
  loader: () => listAdminEvents(),
  head: () => ({ meta: [{ title: 'Events · Admin · RHS Coding Club' }] }),
  component: AdminEvents,
})

function AdminEvents() {
  const { events, now } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: string; values: EventFormValues } | null>(
    null,
  )
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<AdminEventRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const upcoming = events.filter((e) => e.endsAt.getTime() >= now).reverse()
  const past = events.filter((e) => e.endsAt.getTime() < now)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = async (id: string) => {
    setLoadingEdit(id)
    try {
      setEditing(await getEventForm({ data: { eventId: id } }))
      setFormOpen(true)
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load that event.'))
    } finally {
      setLoadingEdit(null)
    }
  }
  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteEvent({ data: { eventId: toDelete.id } })
      toast.success(`Deleted "${toDelete.title}".`)
      setToDelete(null)
      await router.invalidate()
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the event.'))
    } finally {
      setDeleting(false)
    }
  }

  const table = (rows: AdminEventRow[], kind: 'upcoming' | 'past') =>
    rows.length === 0 ? (
      <EmptyState
        icon={<CalendarDays />}
        title={kind === 'upcoming' ? 'Nothing scheduled' : 'No past events'}
        action={
          kind === 'upcoming' ? (
            <RaisedButton onClick={openCreate}>
              <Plus aria-hidden="true" />
              New event
            </RaisedButton>
          ) : undefined
        }
      >
        {kind === 'upcoming'
          ? 'Schedule the next lunch meeting and members can RSVP right away.'
          : 'Events move here once they end.'}
      </EmptyState>
    ) : (
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Going</TableHead>
              <TableHead className="text-right">Maybe</TableHead>
              <TableHead className="text-right">Attended</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => {
              const phase = eventPhase(e, now)
              return (
                <TableRow key={e.id}>
                  <TableCell className="max-w-72">
                    <Link
                      to="/admin/events/$id"
                      params={{ id: e.id }}
                      className="hover:text-primary block truncate font-medium"
                    >
                      {e.title}
                    </Link>
                    <span className="text-muted-foreground block truncate text-xs">
                      {e.location}
                      {e.tags.length > 0 && ` · ${e.tags.map(tagLabel).join(', ')}`}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="block">{fmtDate(e.startsAt, 'date')}</span>
                    <span className="text-muted-foreground block text-xs">
                      {fmtDate(e.startsAt, 'weekday')},{' '}
                      {fmtTimeRange(e.startsAt, e.endsAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {e.going}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right font-mono tabular-nums">
                    {e.maybe}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {e.attended}
                  </TableCell>
                  <TableCell>
                    {e.checkInOpen ? (
                      <span className="text-brand-sky inline-flex items-center gap-1.5 text-xs font-medium">
                        <span
                          className="bg-brand-sky size-1.5 rounded-full"
                          aria-hidden="true"
                        />
                        Open
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {phase === 'live' ? 'Live, closed' : 'Closed'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <RaisedButton
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${e.title}`}
                          loading={loadingEdit === e.id}
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </RaisedButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-48">
                        <DropdownMenuItem
                          onSelect={() =>
                            void navigate({
                              to: '/admin/events/$id',
                              params: { id: e.id },
                            })
                          }
                        >
                          <ClipboardCheck aria-hidden="true" />
                          Attendance
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`/admin/events/${e.id}/present`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Presentation aria-hidden="true" />
                            Present check-in
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => void openEdit(e.id)}>
                          <Pencil aria-hidden="true" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/events/$id" params={{ id: e.id }}>
                            <ExternalLink aria-hidden="true" />
                            Public page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setToDelete(e)}
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
    )

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin"
        title="Events"
        description="Schedule meetings, run check-in from the projector, and fix attendance by hand."
        actions={
          <RaisedButton onClick={openCreate}>
            <Plus aria-hidden="true" />
            New event
          </RaisedButton>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming{' '}
            <span className="text-muted-foreground font-mono text-xs">
              {upcoming.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="past">
            Past{' '}
            <span className="text-muted-foreground font-mono text-xs">{past.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {table(upcoming, 'upcoming')}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {table(past, 'past')}
        </TabsContent>
      </Tabs>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={(id) => {
          if (editing) void router.invalidate()
          else void navigate({ to: '/admin/events/$id', params: { id } })
        }}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{toDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the event, its RSVPs, and its attendance.
              {toDelete && toDelete.attended > 0
                ? ` The ${toDelete.attended} members who attended lose the attendance points it gave them.`
                : ''}{' '}
              This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <RaisedButton variant="outline" onClick={() => setToDelete(null)}>
              Keep it
            </RaisedButton>
            <RaisedButton
              onClick={() => void confirmDelete()}
              loading={deleting}
              loadingText="Deleting"
              className="text-white [--raise-fill:var(--destructive)]"
            >
              Delete event
            </RaisedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
