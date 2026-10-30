import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import {
  ExternalLink,
  MoreHorizontal,
  NotebookPen,
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
import { UserAvatar } from '#/components/user-avatar'
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import { deletePost, listPostsForAdmin, publishPost } from '#/server/blog'
import type { AdminPost } from '#/services/blog'

export const Route = createFileRoute('/_admin/admin/blog/')({
  loader: () => listPostsForAdmin(),
  head: () => ({ meta: [{ title: 'Blog · Admin · RHS Coding Club' }] }),
  component: AdminBlog,
})

type Filter = 'all' | 'drafts' | 'published'

function AdminBlog() {
  const posts = Route.useLoaderData()
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<AdminPost | null>(null)

  const drafts = posts.filter((p) => !p.publishedAt).length
  const rows = posts.filter((p) =>
    filter === 'all'
      ? true
      : filter === 'drafts'
        ? !p.publishedAt
        : Boolean(p.publishedAt),
  )

  async function setPublished(p: AdminPost, published: boolean) {
    setBusy(p.id)
    try {
      await publishPost({ data: { id: p.id, published } })
      toast.success(
        published ? `Published “${p.title}”.` : `“${p.title}” is a draft again.`,
      )
      await router.invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the post.')
    } finally {
      setBusy(null)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(deleting.id)
    try {
      await deletePost({ data: { id: deleting.id } })
      toast.success('Post deleted.')
      setDeleting(null)
      await router.invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete the post.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin"
        title="Blog"
        description="Write, preview, and publish posts. Drafts are only visible to officers."
        actions={
          <RaisedButton asChild>
            <Link to="/admin/blog/new">
              <Plus aria-hidden="true" />
              New post
            </Link>
          </RaisedButton>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">
            All{' '}
            <span className="text-muted-foreground ml-1.5 font-mono text-xs">
              {posts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts{' '}
            <span className="text-muted-foreground ml-1.5 font-mono text-xs">
              {drafts}
            </span>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published{' '}
            <span className="text-muted-foreground ml-1.5 font-mono text-xs">
              {posts.length - drafts}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {rows.length === 0 ? (
        <EmptyState
          icon={<NotebookPen />}
          title={posts.length ? 'Nothing in this view' : 'No posts yet'}
          action={
            <RaisedButton asChild variant="outline">
              <Link to="/admin/blog/new">Write the first one</Link>
            </RaisedButton>
          }
        >
          Posts show up on the public blog once they&apos;re published.
        </EmptyState>
      ) : (
        <div className="bg-card overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[22rem]">
                    <Link
                      to="/admin/blog/$id"
                      params={{ id: p.id }}
                      className="block truncate font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                    <span className="text-muted-foreground block truncate font-mono text-xs">
                      /blog/{p.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1',
                        p.publishedAt
                          ? 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground ring-border',
                      )}
                    >
                      {p.publishedAt
                        ? `Published ${fmtDate(p.publishedAt, 'short')}`
                        : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {p.author ? (
                      <span className="flex items-center gap-2 text-sm">
                        <UserAvatar user={p.author} className="size-6" />
                        {p.author.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                    {fmtDate(p.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <RaisedButton asChild size="sm" variant="outline">
                        <Link to="/admin/blog/$id" params={{ id: p.id }}>
                          <Pencil aria-hidden="true" />
                          Edit
                        </Link>
                      </RaisedButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <RaisedButton
                            size="sm"
                            variant="ghost"
                            aria-label={`More actions for ${p.title}`}
                            disabled={busy === p.id}
                          >
                            <MoreHorizontal />
                          </RaisedButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">
                              <ExternalLink />
                              {p.publishedAt ? 'View' : 'Preview'}
                            </a>
                          </DropdownMenuItem>
                          {p.publishedAt ? (
                            <DropdownMenuItem
                              onSelect={() => void setPublished(p, false)}
                            >
                              <Undo2 />
                              Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => void setPublished(p, true)}>
                              <Rocket />
                              Publish now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleting(p)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.publishedAt ? 'It comes off the blog and the RSS feed. ' : ''}
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <RaisedButton variant="outline" onClick={() => setDeleting(null)}>
              Keep it
            </RaisedButton>
            <RaisedButton
              variant="secondary"
              loading={busy === deleting?.id}
              loadingText="Deleting…"
              onClick={() => void confirmDelete()}
            >
              Delete post
            </RaisedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
