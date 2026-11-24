import { Link, useRouter } from '@tanstack/react-router'
import { ArrowUpRight } from '#/components/icons/arrow-up-right'
import FlowingMenu from '#/components/bits/FlowingMenu'
import type { HomeData } from '#/services/home'
import { fmtDate } from '#/lib/format'
import { FadeUp } from '#/components/motion'

/**
 * The newest blog posts on React Bits Flowing Menu: full-width rows where a
 * band glides between titles and a marquee of the summary runs inside it.
 */
export function LatestPosts({ posts }: { posts: HomeData['latestPosts'] }) {
  const router = useRouter()

  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24"
      aria-labelledby="posts-heading"
    >
      <FadeUp className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h2
          id="posts-heading"
          className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
        >
          From the blog
        </h2>
        <Link
          to="/blog"
          className="text-foreground hover:text-brand-sky inline-flex items-center gap-1.5 text-base font-medium transition-colors"
        >
          All posts
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </FadeUp>

      {posts.length === 0 ? (
        <FadeUp className="border-border text-muted-foreground rounded-3xl border border-dashed px-6 py-14 text-center text-sm">
          No posts yet.
        </FadeUp>
      ) : (
        <>
          {/* Phones: a plain list. The flowing band is a pointer effect, and
              its 45px titles don't fit a narrow column. */}
          <FadeUp className="sm:hidden">
            <ul className="divide-border border-border divide-y border-y">
              {posts.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="active:bg-muted/60 flex items-baseline gap-4 py-5 transition-colors"
                  >
                    <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xl font-medium tracking-[-0.02em] text-pretty">
                        {p.title}
                      </span>
                      {p.publishedAt && (
                        <span className="text-muted-foreground mt-1 block text-sm">
                          {fmtDate(p.publishedAt, 'short')}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight
                      className="text-muted-foreground size-4 shrink-0 self-center"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </FadeUp>
          <FadeUp className="hidden sm:block" style={{ height: posts.length * 112 }}>
            <FlowingMenu
              items={posts.map((p) => ({
                text: p.title,
                link: `/blog/${p.slug}`,
                meta: p.publishedAt ? fmtDate(p.publishedAt, 'short') : undefined,
                marquee: p.summary,
              }))}
              align="left"
              showIndex
              showArrow
              dividers
              bandInset={6}
              bandRadius={18}
              textColor="var(--foreground)"
              bgColor="transparent"
              marqueeBgColor="var(--brand-sky)"
              marqueeTextColor="var(--on-sky)"
              borderColor="var(--border)"
              ariaLabel="Latest posts"
              onItemClick={(item, _index, event) => {
                event.preventDefault()
                if (item.link) void router.navigate({ to: item.link })
              }}
            />
          </FadeUp>
        </>
      )}
    </section>
  )
}
