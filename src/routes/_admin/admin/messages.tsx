import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { ArrowLeft, Inbox, Mail, MailOpen, Reply, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
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
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { fmtDate } from '#/lib/format'
import { serverErrorMessage } from '#/lib/schemas/community'
import { cn } from '#/lib/utils'
import { deleteMessage, listMessages, markMessage } from '#/server/contact'

const searchSchema = z.object({
  id: z.string().max(64).optional(),
  filter: z.enum(['all', 'unread']).optional().catch(undefined),
})

export const Route = createFileRoute('/_admin/admin/messages')({
  validateSearch: searchSchema,
  loader: () => listMessages(),
  head: () => ({ meta: [{ title: 'Messages · Admin · RHS Coding Club' }] }),
  component: AdminMessages,
})

type Message = Awaited<ReturnType<typeof listMessages>>[number]

function AdminMessages() {
  const messages = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const filter = search.filter ?? 'all'
  const unread = messages.filter((m) => !m.readAt).length
  const visible = filter === 'unread' ? messages.filter((m) => !m.readAt) : messages
  const selected = messages.find((m) => m.id === search.id) ?? null

  const open = (id: string | undefined) =>
    void navigate({ search: (s) => ({ ...s, id }), resetScroll: false })

  return (
    <>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Everything sent through /contact. Opening a message marks it read; reply goes out from your own email."
      />

      {messages.length === 0 ? (
        <EmptyState icon={<Inbox />} title="No messages yet.">
          Messages from the contact form land here.
        </EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div
            className={cn('flex min-w-0 flex-col gap-3', selected && 'hidden lg:flex')}
          >
            <Tabs
              value={filter}
              onValueChange={(v) =>
                void navigate({
                  search: (s) => ({ ...s, filter: v === 'all' ? undefined : 'unread' }),
                })
              }
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unread > 0 && (
                    <span className="bg-primary text-primary-foreground tabular ml-1.5 rounded-full px-1.5 font-mono text-[10px]">
                      {unread}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {visible.length === 0 ? (
              <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-10 text-center text-sm">
                All read. Nice.
              </p>
            ) : (
              <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
                {visible.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => open(m.id)}
                      aria-current={selected?.id === m.id ? 'true' : undefined}
                      className={cn(
                        'hover:bg-muted/60 focus-visible:bg-muted/60 flex w-full gap-3 px-4 py-3 text-left outline-none',
                        selected?.id === m.id && 'bg-muted',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-1.5 size-2 shrink-0 rounded-full',
                          m.readAt ? 'bg-transparent' : 'bg-brand-sky',
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              'truncate text-sm',
                              !m.readAt && 'font-semibold',
                            )}
                          >
                            {m.name}
                          </span>
                          <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
                            {fmtDate(m.createdAt, 'short')}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'block truncate text-sm',
                            m.readAt ? 'text-muted-foreground' : 'text-foreground',
                          )}
                        >
                          {m.subject}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {m.message.replace(/\s+/g, ' ')}
                        </span>
                        {!m.readAt && <span className="sr-only">Unread</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cn('min-w-0', !selected && 'hidden lg:block')}>
            {selected ? (
              <MessageView
                key={selected.id}
                message={selected}
                onBack={() => open(undefined)}
              />
            ) : (
              <div className="border-border text-muted-foreground flex h-full min-h-72 flex-col items-center justify-center rounded-lg border border-dashed text-sm">
                <Mail className="mb-3 size-6" aria-hidden="true" />
                Pick a message to read it.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function MessageView({ message: m, onBack }: { message: Message; onBack: () => void }) {
  const router = useRouter()
  const mark = useServerFn(markMessage)
  const remove = useServerFn(deleteMessage)
  const [busy, setBusy] = useState(false)
  const autoRead = useRef(false)

  // Opening an unread message marks it read (once).
  useEffect(() => {
    if (m.readAt || autoRead.current) return
    autoRead.current = true
    void mark({ data: { id: m.id, read: true } }).then(() => router.invalidate())
  }, [m.id, m.readAt, mark, router])

  async function setRead(read: boolean) {
    setBusy(true)
    try {
      await mark({ data: { id: m.id, read } })
      if (!read) {
        toast.success('Marked unread.')
        onBack()
      }
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    try {
      await remove({ data: { id: m.id } })
      toast.success('Message deleted.')
      onBack()
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    }
  }

  const reply = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(
    `Re: ${m.subject}`,
  )}&body=${encodeURIComponent(
    `\n\n---\nOn ${fmtDate(m.createdAt, 'date')}, ${m.name} wrote:\n> ${m.message.replace(/\n/g, '\n> ')}`,
  )}`

  return (
    <article className="border-border rounded-lg border">
      <header className="border-border flex flex-wrap items-start justify-between gap-4 border-b p-5">
        <div className="min-w-0">
          <RaisedButton
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 lg:hidden"
            onClick={onBack}
          >
            <ArrowLeft aria-hidden="true" />
            Inbox
          </RaisedButton>
          <h2 className="text-xl font-semibold tracking-tight">{m.subject}</h2>
          <p className="mt-1 text-sm">
            <span className="font-medium">{m.name}</span>{' '}
            <a
              href={`mailto:${m.email}`}
              className="text-muted-foreground hover:text-foreground font-mono text-xs"
            >
              &lt;{m.email}&gt;
            </a>
          </p>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs">
            {fmtDate(m.createdAt, 'datetime')}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <RaisedButton asChild size="sm">
            <a href={reply}>
              <Reply aria-hidden="true" />
              Reply
            </a>
          </RaisedButton>
          <RaisedButton
            size="sm"
            variant="outline"
            loading={busy}
            onClick={() => setRead(!m.readAt)}
          >
            {m.readAt ? <Mail aria-hidden="true" /> : <MailOpen aria-hidden="true" />}
            {m.readAt ? 'Mark unread' : 'Mark read'}
          </RaisedButton>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <RaisedButton size="sm" variant="ghost" aria-label="Delete message">
                <Trash2 aria-hidden="true" />
              </RaisedButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                <AlertDialogDescription>
                  The message from {m.name} is removed for every officer. This can’t be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>
      <div className="p-5 text-[15px] leading-relaxed whitespace-pre-wrap">
        {m.message}
      </div>
    </article>
  )
}
