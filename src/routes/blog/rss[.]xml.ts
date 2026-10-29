import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { getDb } from '#/db'
import { rssXml } from '#/lib/schemas/blog'
import { listPublishedPosts } from '#/services/blog'
import { getSetting } from '#/services/settings'

/** RSS 2.0 feed of the 30 newest published posts. */
export const Route = createFileRoute('/blog/rss.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const db = getDb()
        const [posts, club] = await Promise.all([
          listPublishedPosts(db, 30),
          getSetting(db, 'club-info'),
        ])
        const origin = env.APP_URL || new URL(request.url).origin
        const xml = rssXml(
          posts.map((p) => ({
            title: p.title,
            slug: p.slug,
            summary: p.summary,
            tags: p.tags,
            publishedAt: new Date(p.publishedAt),
            authorName: p.author?.name ?? null,
          })),
          origin,
          club.clubName,
        )
        return new Response(xml, {
          headers: {
            'content-type': 'application/rss+xml; charset=utf-8',
            'cache-control': 'public, max-age=900',
          },
        })
      },
    },
  },
})
