import { useRef, useState } from 'react'
import { Link, useBlocker, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'
import { RichTextEditor } from '#/components/rich-text/editor'
import { ChipInput } from '#/components/projects/chip-input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { fmtDate, slugify } from '#/lib/format'
import { EMPTY_DOC_JSON } from '#/lib/rich-text'
import { POST_LIMITS, postInputSchema } from '#/lib/schemas/blog'
import type { PostFieldErrors, PostInput } from '#/lib/schemas/blog'
import { cn } from '#/lib/utils'
import { deletePost, savePost } from '#/server/blog'

export interface PostEditorInitial {
  id: string | null
  title: string
  slug: string
  summary: string
  tags: string[]
  content: string
  publishedAt: Date | string | null
}

type Errors = PostFieldErrors & { form?: string }

/**
 * The full-page post editor. The slug follows the title until you edit it
 * yourself. Leaving with unsaved changes asks first.
 */
export function PostEditor({ initial }: { initial: PostEditorInitial }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial.title)
  const [slug, setSlug] = useState(initial.slug)
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id))
  const [summary, setSummary] = useState(initial.summary)
  const [tags, setTags] = useState(initial.tags)
  const [content, setContent] = useState(initial.content || EMPTY_DOC_JSON)
  const [publishedAt, setPublishedAt] = useState(initial.publishedAt)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState<'draft' | 'publish' | 'unpublish' | 'delete' | null>(
    null,
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const saved = useRef({
    title: initial.title,
    slug: initial.slug,
    summary: initial.summary,
    tags: initial.tags.join(','),
    content: initial.content || EMPTY_DOC_JSON,
  })
  const leaving = useRef(false)

  const dirty =
    title !== saved.current.title ||
    slug !== saved.current.slug ||
    summary !== saved.current.summary ||
    tags.join(',') !== saved.current.tags ||
    content !== saved.current.content

  const blocker = useBlocker({
    shouldBlockFn: () => dirty && !leaving.current,
    enableBeforeUnload: () => dirty && !leaving.current,
    withResolver: true,
  })

  const isPublished = publishedAt !== null

  async function save(action: 'draft' | 'publish' | 'unpublish') {
    const input: PostInput = { title, slug, summary, tags, content }
    const parsed = postInputSchema.safeParse(input)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof PostInput
        next[key] ??= issue.message
      }
      setErrors(next)
      document.getElementById(`post-${Object.keys(next)[0]}`)?.focus()
      return
    }
    setErrors({})
    setBusy(action)
    try {
      const result = await savePost({
        data: {
          ...input,
          id: initial.id,
          publish: action === 'draft' ? 'keep' : action,
        },
      })
      if (!result.ok) {
        setErrors(result.errors)
        if (result.errors.slug) document.getElementById('post-slug')?.focus()
        return
      }
      saved.current = {
        title,
        slug: result.slug,
        summary,
        tags: parsed.data.tags.join(','),
        content,
      }
      setTags(parsed.data.tags)
      setPublishedAt(result.publishedAt)
      toast.success(
        action === 'publish'
          ? isPublished
            ? 'Post updated.'
            : 'Published. It is live on the blog.'
          : action === 'unpublish'
            ? 'Moved back to drafts.'
            : isPublished
              ? 'Saved.'
              : 'Draft saved.',
      )
      if (!initial.id) {
        leaving.current = true
        await router.navigate({
          to: '/admin/blog/$id',
          params: { id: result.id },
          replace: true,
        })
      } else {
        await router.invalidate()
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Could not save the post.' })
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    if (!initial.id) return
    setBusy('delete')
    try {
      await deletePost({ data: { id: initial.id } })
      toast.success('Post deleted.')
      leaving.current = true
      await router.navigate({ to: '/admin/blog' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete the post.')
      setBusy(null)
    }
  }

  const fieldError = (f: keyof PostInput) =>
    errors[f] ? (
      <p id={`post-${f}-error`} role="alert" className="text-destructive text-sm">
        {errors[f]}
      </p>
    ) : null
  const aria = (f: keyof PostInput) => ({
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby': errors[f] ? `post-${f}-error` : undefined,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save(isPublished ? 'publish' : 'draft')
      }}
      noValidate
    >
      <div className="bg-background/85 sticky top-(--header-offset) z-20 -mx-1 mb-6 flex flex-wrap items-center gap-3 border-b px-1 py-3 backdrop-blur">
        <RaisedButton asChild variant="ghost" size="sm">
          <Link to="/admin/blog">
            <ArrowLeft aria-hidden="true" />
            Posts
          </Link>
        </RaisedButton>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium ring-1',
            isPublished
              ? 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300'
              : 'bg-muted text-muted-foreground ring-border',
          )}
        >
          {publishedAt ? `Published ${fmtDate(publishedAt)}` : 'Draft'}
        </span>
        <span className="text-muted-foreground text-xs" aria-live="polite">
          {dirty ? 'Unsaved changes' : initial.id ? 'All changes saved' : ''}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {initial.id && (
            <RaisedButton asChild variant="ghost" size="sm">
              <a href={`/blog/${saved.current.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden="true" />
                {isPublished ? 'View' : 'Preview'}
              </a>
            </RaisedButton>
          )}
          {isPublished ? (
            <>
              <RaisedButton
                type="button"
                variant="outline"
                size="sm"
                loading={busy === 'unpublish'}
                loadingText="Unpublishing…"
                onClick={() => void save('unpublish')}
              >
                <Undo2 aria-hidden="true" />
                Unpublish
              </RaisedButton>
              <RaisedButton
                type="submit"
                size="sm"
                loading={busy === 'publish'}
                loadingText="Saving…"
              >
                Update post
              </RaisedButton>
            </>
          ) : (
            <>
              <RaisedButton
                type="submit"
                variant="outline"
                size="sm"
                loading={busy === 'draft'}
                loadingText="Saving…"
              >
                Save draft
              </RaisedButton>
              <RaisedButton
                type="button"
                size="sm"
                loading={busy === 'publish'}
                loadingText="Publishing…"
                onClick={() => void save('publish')}
              >
                Publish
              </RaisedButton>
            </>
          )}
        </div>
      </div>

      {errors.form && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive ring-destructive/25 mb-6 rounded-lg px-4 py-3 text-sm ring-1"
        >
          {errors.form}
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-title" className="sr-only">
              Title
            </Label>
            <textarea
              id="post-title"
              rows={1}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value.replace(/\n/g, ' '))
                if (!slugTouched)
                  setSlug(
                    slugify(e.target.value.replace(/\n/g, ' ')).slice(
                      0,
                      POST_LIMITS.slug,
                    ),
                  )
              }}
              maxLength={POST_LIMITS.title}
              placeholder="Post title"
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              className="placeholder:text-muted-foreground/60 field-sizing-content w-full resize-none bg-transparent text-3xl leading-tight font-semibold tracking-[-0.035em] outline-none sm:text-5xl"
              {...aria('title')}
            />
            {fieldError('title')}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-content" className="sr-only">
              Content
            </Label>
            <RichTextEditor
              key={initial.id ?? 'new'}
              id="post-content"
              value={content}
              onChange={setContent}
              imagePurpose="post"
              placeholder="Write the post. Use headings to break it up, and code blocks for code."
              aria-invalid={Boolean(errors.content)}
              className="[&_.rich-text]:min-h-[28rem]"
            />
            {fieldError('content')}
          </div>
        </div>

        <aside className="flex flex-col gap-6" aria-label="Post settings">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-slug">URL slug</Label>
            <div className="border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex h-9 items-center overflow-hidden rounded-md border shadow-xs focus-within:ring-[3px] has-[input[aria-invalid]]:border-destructive">
              <span className="text-muted-foreground bg-muted/60 flex h-full items-center border-r px-2 font-mono text-xs">
                /blog/
              </span>
              <input
                id="post-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                  if (errors.slug) setErrors((x) => ({ ...x, slug: undefined }))
                }}
                maxLength={POST_LIMITS.slug}
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-sm outline-none"
                {...aria('slug')}
              />
            </div>
            {fieldError('slug')}
            {slugTouched && !initial.id && (
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(false)
                  setSlug(slugify(title).slice(0, POST_LIMITS.slug))
                }}
                className="text-muted-foreground hover:text-foreground self-start text-xs underline-offset-4 hover:underline"
              >
                Match the title again
              </button>
            )}
            {initial.id && isPublished && slug !== saved.current.slug && (
              <p className="text-muted-foreground text-xs">
                Changing a published slug breaks links people already shared.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="post-summary">Summary</Label>
              <span
                className={cn(
                  'font-mono text-xs',
                  summary.length > POST_LIMITS.summary
                    ? 'text-destructive'
                    : 'text-muted-foreground',
                )}
              >
                {summary.length}/{POST_LIMITS.summary}
              </span>
            </div>
            <Textarea
              id="post-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="One or two sentences for the blog list and link previews."
              {...aria('summary')}
            />
            {fieldError('summary')}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-tags">Tags</Label>
            <ChipInput
              id="post-tags"
              value={tags}
              onChange={setTags}
              max={POST_LIMITS.tags}
              maxLength={POST_LIMITS.tagLength}
              normalize={slugify}
              placeholder="hackathon, how-to"
              invalid={Boolean(errors.tags)}
              className="rounded-md"
            />
            <p className="text-muted-foreground text-xs">
              Lowercase, up to {POST_LIMITS.tags}. Readers filter the blog by these.
            </p>
            {fieldError('tags')}
          </div>

          {initial.id && (
            <div className="border-border border-t pt-6">
              <RaisedButton
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 aria-hidden="true" />
                Delete post
              </RaisedButton>
            </div>
          )}
        </aside>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete “{saved.current.title || 'this post'}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPublished ? 'It comes off the blog and the RSS feed right away. ' : ''}
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <RaisedButton
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              Keep it
            </RaisedButton>
            <RaisedButton
              type="button"
              variant="secondary"
              loading={busy === 'delete'}
              loadingText="Deleting…"
              onClick={() => void remove()}
            >
              Delete post
            </RaisedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={blocker.status === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes to this post haven&apos;t been saved yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <RaisedButton
              type="button"
              variant="outline"
              onClick={() => blocker.reset?.()}
            >
              Keep editing
            </RaisedButton>
            <RaisedButton
              type="button"
              variant="secondary"
              onClick={() => blocker.proceed?.()}
            >
              Discard changes
            </RaisedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
