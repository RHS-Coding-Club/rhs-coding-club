import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, NotebookPen, Rss } from 'lucide-react'
import { z } from 'zod'
import GradientText from '#/components/bits/GradientText'
import { PageHero } from '#/components/page-hero'
import { AeroShardsBackground } from '#/components/blog/aero-shards-bg'
import { FadeUp } from '#/components/motion'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { PostByline } from '#/components/blog/post-byline'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import { useIsDark } from '#/hooks/use-is-dark'
import { listPosts } from '#/server/blog'
import type { PostListItem } from '#/services/blog'

const searchSchema = z.object({
  tag: z.string().max(40).optional().catch(undefined),
})

export const Route = createFileRoute('/blog/')({
  validateSearch: searchSchema,
  loader: () => listPosts(),
  head: () => ({
    meta: [
      { title: 'Blog · RHS Coding Club' },
      {
        name: 'description',
        content:
          'Hackathon recaps, how-tos, and club news from RHS Coding Club at Ripon High School.',
      },
      { property: 'og:title', content: 'Blog · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Hackathon recaps, how-tos, and club news from RHS Coding Club.',
      },
    ],
    links: [
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'RHS Coding Club blog',
        href: '/blog/rss.xml',
      },
    ],
  }),
  component: BlogPage,
})

function BlogPage() {
  const posts = Route.useLoaderData()
  const { tag } = Route.useSearch()
  const { theme } = Route.useRouteContext()
  const dark = useIsDark(theme === 'dark')

  const tags = useMemo(() => tagCounts(posts), [posts])
  const wanted = tag?.toLowerCase()
  const shown = wanted
    ? posts.filter((p) => p.tags.some((t) => t.toLowerCase() === wanted))
    : posts
  const lead = tag ? undefined : shown[0]
  const rest = tag ? shown : shown.slice(1)

  return (
    <>
      <PageHero
        background={<AeroShardsBackground initialDark={theme === 'dark'} />}
        title={
          <GradientText
            colors={
              dark
                ? ['#5fb2ee', '#a9d4f5', '#3f86c9', '#5fb2ee']
                : ['#1f4f8a', '#5fb2ee', '#174070', '#1f4f8a']
            }
            animationSpeed={10}
            direction="diagonal"
            // The gradient is clipped to the text box, so give the
            // descender on the "g" room below the line and take it back.
            className="-mb-[0.18em] [&>span>span]:pb-[0.18em]"
          >
            The blog
          </GradientText>
        }
        description="Hackathon recaps, how-tos for the weekly challenges, and news from lunch meetings in Mr. Derrick's room. Written by officers and members."
        actions={
          <RaisedButton asChild variant="secondary">
            <a href="/blog/rss.xml">
              <Rss aria-hidden="true" />
              RSS feed
            </a>
          </RaisedButton>
        }
      >
        {tags.length > 0 && <TagRow tags={tags} active={wanted} total={posts.length} />}
      </PageHero>

      {posts.length === 0 ? (
        <div className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24">
          <EmptyState icon={<NotebookPen />} title="No posts yet">
            The officers are writing the first one. Check back after the next meeting.
          </EmptyState>
        </div>
      ) : (
        <>
          {lead && (
            <section aria-label="Latest post" className="mx-2.5 mt-2.5">
              <FadeUp>
                <LeadPost post={lead} />
              </FadeUp>
            </section>
          )}

          <section
            aria-labelledby="posts-heading"
            className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24"
          >
            <FadeUp className="flex items-end justify-between gap-6">
              <h2
                id="posts-heading"
                className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
              >
                {tag ? `Tagged ${tag}` : 'Earlier posts'}
              </h2>
              {tag && (
                <Link
                  to="/blog"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Show all posts
                </Link>
              )}
            </FadeUp>
            {rest.length === 0 ? (
              <p className="text-muted-foreground mt-8 text-lg">
                That&apos;s everything so far.
              </p>
            ) : (
              <ol className="border-border mt-10 border-t">
                {rest.map((p, i) => (
                  <li key={p.id}>
                    <FadeUp delay={Math.min(i, 4) * 0.04}>
                      <PostRow post={p} />
                    </FadeUp>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </>
  )
}

/**
 * Tags across all posts, grouped case-insensitively (the old site has both
 * "Git" and "git"), shown in their most common spelling, most used first.
 */
function tagCounts(posts: PostListItem[]) {
  const groups = new Map<string, { n: number; spellings: Map<string, number> }>()
  for (const p of posts)
    for (const t of p.tags) {
      const key = t.toLowerCase()
      const g = groups.get(key) ?? { n: 0, spellings: new Map() }
      g.n++
      g.spellings.set(t, (g.spellings.get(t) ?? 0) + 1)
      groups.set(key, g)
    }
  return [...groups.entries()]
    .map(([key, g]) => ({
      key,
      label: [...g.spellings.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? key,
      n: g.n,
    }))
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label))
}

type TagCount = ReturnType<typeof tagCounts>[number]

const GAP = 8

/**
 * The tag filter, always one line: "All", the active tag, then the most
 * used tags, as many as fit the width (measured, so it works from phone to
 * desktop). The rest sit behind a "+N more" pill that opens a popover.
 */
function TagRow({
  tags,
  active,
  total,
}: {
  tags: TagCount[]
  active: string | undefined
  total: number
}) {
  // The active tag always gets a visible slot.
  const ordered = useMemo(
    () =>
      active
        ? [
            ...tags.filter((t) => t.key === active),
            ...tags.filter((t) => t.key !== active),
          ]
        : tags,
    [tags, active],
  )
  const rowRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(ordered.length)

  useLayoutEffect(() => {
    const row = rowRef.current
    const ruler = measureRef.current
    if (!row || !ruler) return
    const measure = () => {
      const widths = [...ruler.children].map((el) => (el as HTMLElement).offsetWidth)
      const [all = 0, ...rest] = widths
      const more = rest.pop() ?? 0 // the last ruler child is the "+N more" pill
      const room = row.clientWidth
      let used = all
      let n = 0
      for (const [i, w] of rest.entries()) {
        const needsMore = i < rest.length - 1
        const next = used + GAP + w + (needsMore ? GAP + more : 0)
        if (next > room) break
        used += GAP + w
        n++
      }
      setFit(n)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    return () => ro.disconnect()
  }, [ordered])

  const visible = ordered.slice(0, fit)
  const hidden = ordered.slice(fit)

  return (
    <nav aria-label="Filter by tag" className="relative">
      {/* Off-screen ruler: every pill at its natural width. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute flex gap-2 whitespace-nowrap"
      >
        <TagLink tag={undefined} active={false} count={total} tabIndex={-1} />
        {ordered.map((t) => (
          <TagLink key={t.key} tag={t.label} active={false} count={t.n} tabIndex={-1} />
        ))}
        <MorePill count={ordered.length} />
      </div>

      <div ref={rowRef} className="flex flex-nowrap gap-2 overflow-hidden">
        <TagLink tag={undefined} active={!active} count={total} />
        {visible.map((t) => (
          <TagLink key={t.key} tag={t.label} active={t.key === active} count={t.n} />
        ))}
        {hidden.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <MorePill count={hidden.length} />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="flex w-80 flex-wrap gap-2 rounded-3xl p-3"
            >
              {hidden.map((t) => (
                <TagLink
                  key={t.key}
                  tag={t.label}
                  active={t.key === active}
                  count={t.n}
                />
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </nav>
  )
}

const MorePill = forwardRef<
  HTMLButtonElement,
  { count: number } & React.ComponentProps<'button'>
>(({ count, className, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    {...rest}
    className={cn(
      'focus-visible:ring-ring/50 bg-card text-foreground/80 ring-border/80 hover:text-foreground hover:ring-foreground/30 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors outline-none focus-visible:ring-3',
      className,
    )}
  >
    +{count} more
  </button>
))
MorePill.displayName = 'MorePill'

function TagLink({
  tag,
  active,
  count,
  tabIndex,
}: {
  tag: string | undefined
  active: boolean
  count: number
  tabIndex?: number
}) {
  return (
    <Link
      to="/blog"
      search={tag ? { tag } : {}}
      aria-current={active ? 'page' : undefined}
      tabIndex={tabIndex}
      className={cn(
        'focus-visible:ring-ring/50 inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors outline-none focus-visible:ring-3',
        active
          ? 'bg-foreground text-background ring-foreground'
          : 'bg-card text-foreground/80 ring-border/80 hover:text-foreground hover:ring-foreground/30',
      )}
    >
      {tag ? `#${tag}` : 'All'}
      <span className={cn('font-mono text-xs', active ? 'opacity-70' : 'opacity-50')}>
        {count}
      </span>
    </Link>
  )
}

function LeadPost({ post }: { post: PostListItem }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group bg-brand-navy focus-visible:ring-brand-sky/60 relative block overflow-hidden rounded-4xl text-[#e6edf5] outline-none focus-visible:ring-4"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_0%,rgba(95,178,238,0.45)_0%,transparent_60%),radial-gradient(50%_60%_at_0%_100%,rgba(16,24,38,0.6)_0%,transparent_70%)] transition-opacity duration-700 group-hover:opacity-80"
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-(--gutter) py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
        <div>
          <p className="font-mono text-sm text-[#e6edf5]/65">
            Latest · {fmtDate(post.publishedAt)}
          </p>
          <h2 className="mt-5 max-w-4xl text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance">
            {post.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#e6edf5]/80 sm:text-xl">
            {post.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-xs ring-1 ring-white/15"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
          <PostByline
            author={post.author}
            minutes={post.minutes}
            size="sm"
            className="[&_p]:text-[#e6edf5]/70 [&_p>span]:text-[#e6edf5] [&_[data-slot=avatar-fallback]]:bg-white/15 [&_[data-slot=avatar-fallback]]:text-white"
          />
          <span className="inline-flex items-center gap-1.5 font-medium">
            Read it
            <ArrowUpRight
              className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  )
}

function PostRow({ post }: { post: PostListItem }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group border-border focus-visible:bg-muted/40 grid gap-4 border-b py-8 outline-none sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:gap-8"
    >
      <time
        dateTime={new Date(post.publishedAt).toISOString()}
        className="text-muted-foreground pt-1 font-mono text-sm"
      >
        {fmtDate(post.publishedAt)}
      </time>
      <div className="min-w-0">
        <h3 className="group-hover:text-brand-sky text-2xl font-semibold tracking-[-0.03em] transition-colors sm:text-3xl">
          {post.title}
        </h3>
        <p className="text-muted-foreground mt-2 max-w-2xl text-base leading-relaxed">
          {post.summary}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <PostByline author={post.author} minutes={post.minutes} size="sm" />
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span
                key={t}
                className="bg-muted/70 text-foreground/75 rounded-full px-2 py-0.5 font-mono text-[11px]"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ArrowUpRight
        className="text-muted-foreground group-hover:text-brand-sky hidden size-6 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block"
        aria-hidden="true"
      />
    </Link>
  )
}
