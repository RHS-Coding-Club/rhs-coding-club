import { z } from 'zod'
import { richTextField } from '#/lib/rich-text'
import { slugify } from '#/lib/format'

// Shared between the admin post editor and the blog server functions.

export const POST_LIMITS = {
  title: 120,
  slug: 80,
  summary: 280,
  tags: 6,
  tagLength: 24,
} as const

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Lowercase, hyphenated tags; dupes and blanks dropped. */
export function normalizeTags(tags: string[]) {
  return [...new Set(tags.map((t) => slugify(t)).filter(Boolean))]
}

export const postInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Give the post a title.')
    .max(POST_LIMITS.title, `Keep the title under ${POST_LIMITS.title} characters.`),
  slug: z
    .string()
    .trim()
    .min(3, 'The slug needs at least 3 characters.')
    .max(POST_LIMITS.slug, `Keep the slug under ${POST_LIMITS.slug} characters.`)
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers, and single hyphens.'),
  summary: z
    .string()
    .trim()
    .min(10, 'Write a one-line summary for the blog list and link previews.')
    .max(
      POST_LIMITS.summary,
      `Keep the summary under ${POST_LIMITS.summary} characters.`,
    ),
  tags: z
    .array(z.string().trim().max(POST_LIMITS.tagLength))
    .max(POST_LIMITS.tags, `Up to ${POST_LIMITS.tags} tags.`)
    .transform(normalizeTags),
  content: richTextField({ required: true, message: 'The post is empty.' }),
})

export type PostInput = z.input<typeof postInputSchema>

/** What saving does to the published state. */
export const PUBLISH_ACTIONS = ['keep', 'publish', 'unpublish'] as const

export const savePostSchema = postInputSchema.extend({
  id: z.string().min(1).max(64).nullable(),
  publish: z.enum(PUBLISH_ACTIONS).default('keep'),
})

export const postIdSchema = z.object({ id: z.string().min(1).max(64) })
export const postSlugSchema = z.object({ slug: z.string().min(1).max(POST_LIMITS.slug) })

/** Field errors a save can return without throwing, so the form shows them inline. */
export type PostFieldErrors = Partial<Record<keyof PostInput, string>>

// ---------- RSS ----------

/** Escapes text for XML element content and attribute values. */
export function xmlEscape(s: string) {
  return (
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      // Control characters are not allowed in XML 1.0 at all.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  )
}

export interface FeedItem {
  title: string
  slug: string
  summary: string
  tags: string[]
  publishedAt: Date
  authorName: string | null
}

/** An RSS 2.0 document for the blog. `origin` is the site URL without a slash. */
export function rssXml(items: FeedItem[], origin: string, clubName = 'RHS Coding Club') {
  const base = origin.replace(/\/+$/, '')
  const entries = items
    .map((p) => {
      const link = `${base}/blog/${encodeURIComponent(p.slug)}`
      const categories = p.tags
        .map((t) => `<category>${xmlEscape(t)}</category>`)
        .join('')
      const author = p.authorName
        ? `<dc:creator>${xmlEscape(p.authorName)}</dc:creator>`
        : ''
      return `<item><title>${xmlEscape(p.title)}</title><link>${xmlEscape(link)}</link><guid isPermaLink="true">${xmlEscape(link)}</guid><pubDate>${p.publishedAt.toUTCString()}</pubDate><description>${xmlEscape(p.summary)}</description>${author}${categories}</item>`
    })
    .join('\n')
  const updated = items[0]?.publishedAt ?? new Date(0)
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${xmlEscape(`${clubName} blog`)}</title>
<link>${xmlEscape(`${base}/blog`)}</link>
<atom:link href="${xmlEscape(`${base}/blog/rss.xml`)}" rel="self" type="application/rss+xml"/>
<description>${xmlEscape(`Notes, recaps, and how-tos from ${clubName} at Ripon High School.`)}</description>
<language>en-us</language>
<lastBuildDate>${updated.toUTCString()}</lastBuildDate>
${entries}
</channel>
</rss>
`
}
