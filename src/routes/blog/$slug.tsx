import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Eye, Pencil } from 'lucide-react'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { RichText } from '#/components/rich-text/rich-text'
import { PostByline } from '#/components/blog/post-byline'
import { PostOutline } from '#/components/blog/post-outline'
import { ReadingProgress } from '#/components/blog/reading-progress'
import { ShareButton } from '#/components/blog/share-button'
import { hasRole } from '#/lib/roles'
import { getPost } from '#/server/blog'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const view = await getPost({ data: { slug: params.slug } })
    if (!view) throw notFound()
    return view
  },
  head: ({ loaderData }) => {
    const v = loaderData
    if (!v) return { meta: [{ title: 'Post · RHS Coding Club' }] }
    const title = `${v.post.title} · RHS Coding Club`
    return {
      meta: [
        { title },
        { name: 'description', content: v.post.summary },
        { property: 'og:title', content: v.post.title },
        { property: 'og:description', content: v.post.summary },
        { property: 'og:type', content: 'article' },
        ...(v.post.publishedAt
          ? [
              {
                property: 'article:published_time',
                content: new Date(v.post.publishedAt).toISOString(),
              },
            ]
          : [{ name: 'robots', content: 'noindex' }]),
        ...(v.author ? [{ property: 'article:author', content: v.author.name }] : []),
        ...v.post.tags.map((t) => ({ property: 'article:tag', content: t })),
      ],
    }
  },
  component: PostPage,
})

function PostPage() {
  const { post, author, isDraft, prev, next } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const isOfficer = hasRole(user?.role, 'officer')

  return (
    <article>
      <ReadingProgress />

      {isDraft && (
        <div className="mx-auto mb-2 max-w-3xl px-(--gutter)">
          <div
            role="status"
            className="bg-brand-sky/12 ring-brand-sky/30 flex flex-wrap items-center gap-3 rounded-3xl px-5 py-3.5 ring-1"
          >
            <Eye className="text-brand-sky size-5 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm font-medium">
              Draft preview. Only officers can see this until it&apos;s published.
            </p>
            <RaisedButton asChild size="sm" variant="outline">
              <Link to="/admin/blog/$id" params={{ id: post.id }}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
            </RaisedButton>
          </div>
        </div>
      )}

      <header className="mx-auto max-w-3xl px-(--gutter) pt-12 sm:pt-20">
        <FadeUp>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/blog"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All posts
            </Link>
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t}>
                    <Link
                      to="/blog"
                      search={{ tag: t }}
                      className="bg-muted/70 text-foreground/75 hover:text-foreground rounded-full px-2.5 py-0.5 font-mono text-xs transition-colors"
                    >
                      #{t}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <h1 className="mt-8 text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.03] font-semibold tracking-[-0.045em] text-balance">
            {post.title}
          </h1>
          <p className="text-muted-foreground mt-6 text-xl leading-relaxed text-pretty">
            {post.summary}
          </p>
          <div className="border-border mt-10 flex flex-wrap items-center justify-between gap-4 border-y py-5">
            <PostByline
              author={author}
              publishedAt={post.publishedAt}
              minutes={post.minutes}
            />
            <div className="flex gap-2">
              {isOfficer && !isDraft && (
                <RaisedButton asChild variant="ghost">
                  <Link to="/admin/blog/$id" params={{ id: post.id }}>
                    <Pencil aria-hidden="true" />
                    Edit
                  </Link>
                </RaisedButton>
              )}
              <ShareButton title={post.title} summary={post.summary} />
            </div>
          </div>
        </FadeUp>
      </header>

      {/* The text stays centered; on wide screens the table of contents
          sits in the left rail beside it and follows you down the page. */}
      <div className="mx-auto grid max-w-3xl px-(--gutter) py-12 sm:py-16 xl:max-w-none xl:grid-cols-[minmax(0,1fr)_minmax(0,calc(48rem-2*var(--gutter)))_minmax(0,1fr)] xl:gap-10 xl:px-(--gutter)">
        <aside className="hidden xl:block xl:justify-self-end">
          <PostOutline content={post.content} className="sticky top-32" />
        </aside>
        <FadeUp delay={0.1} className="min-w-0">
          <PostOutline
            content={post.content}
            defaultOpen={false}
            className="border-border mb-10 border-b pb-6 xl:hidden"
          />
          <RichText value={post.content} className="text-lg [&_p]:text-pretty" />
        </FadeUp>
      </div>

      {(prev || next) && (
        <nav
          aria-label="More posts"
          className="mx-auto grid max-w-3xl gap-3 px-(--gutter) pb-16 sm:grid-cols-2"
        >
          {prev ? (
            <Neighbour dir="prev" title={prev.title} slug={prev.slug} />
          ) : (
            <span className="hidden sm:block" />
          )}
          {next && <Neighbour dir="next" title={next.title} slug={next.slug} />}
        </nav>
      )}

      <section className="mx-auto max-w-3xl px-(--gutter) pb-8">
        <div className="border-border flex flex-wrap items-center justify-between gap-6 border-t pt-12">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.03em]">
              Come build with us
            </p>
            <p className="text-muted-foreground mt-1">
              Lunch meetings in Mr. Derrick&apos;s room. No experience required.
            </p>
          </div>
          <RaisedButton asChild variant="secondary" size="lg">
            <Link to={user ? '/dashboard' : '/signup'}>
              {user ? 'Go to your dashboard' : 'Join the club'}
            </Link>
          </RaisedButton>
        </div>
      </section>
    </article>
  )
}

function Neighbour({
  dir,
  title,
  slug,
}: {
  dir: 'prev' | 'next'
  title: string
  slug: string
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug }}
      className="group bg-card ring-border/70 hover:ring-brand-sky/50 focus-visible:ring-brand-sky flex flex-col gap-2 rounded-3xl p-5 ring-1 transition-shadow outline-none focus-visible:ring-2 data-[dir=next]:text-right sm:p-6"
      data-dir={dir}
    >
      <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm group-data-[dir=next]:justify-end">
        {dir === 'prev' ? (
          <>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Older
          </>
        ) : (
          <>
            Newer
            <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </span>
      <span className="group-hover:text-brand-sky text-lg leading-snug font-semibold tracking-tight transition-colors">
        {title}
      </span>
    </Link>
  )
}
