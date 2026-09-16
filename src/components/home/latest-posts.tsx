import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { HomeData } from '#/services/home'
import { fmtDate } from '#/lib/format'
import { FadeUp } from '#/components/motion'

/** The three newest blog posts, from the previous site's "Latest Posts". */
export function LatestPosts({ posts }: { posts: HomeData['latestPosts'] }) {
  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) pb-24 sm:pb-28"
      aria-labelledby="posts-heading"
    >
      <FadeUp className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-xl">
          <h2
            id="posts-heading"
            className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
          >
            Latest posts
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Recaps, announcements, and write-ups from officers and members.
          </p>
        </div>
        <Link
          to="/blog"
          className="text-foreground/80 hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          All posts
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </FadeUp>

      {posts.length === 0 ? (
        <FadeUp className="border-border text-muted-foreground mt-10 rounded-2xl border border-dashed px-6 py-14 text-center text-sm">
          No posts yet.
        </FadeUp>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {posts.map((p, i) => (
            <FadeUp key={p.id} delay={i * 0.08}>
              <Link
                to="/blog"
                className="group bg-card text-card-foreground border-border flex h-full flex-col rounded-2xl border p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
              >
                <p className="text-muted-foreground font-mono text-xs">
                  {p.publishedAt ? fmtDate(p.publishedAt) : 'Draft'}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                  {p.title}
                </h3>
                <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
                  {p.summary}
                </p>
                <span className="text-foreground/80 mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium">
                  Read post
                  <ArrowUpRight
                    className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </FadeUp>
          ))}
        </ul>
      )}
    </section>
  )
}
