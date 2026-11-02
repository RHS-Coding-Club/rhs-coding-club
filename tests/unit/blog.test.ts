import { describe, expect, it } from 'vitest'
import { normalizeTags, postInputSchema, rssXml, xmlEscape } from '#/lib/schemas/blog'

const doc = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }],
})

describe('post schema', () => {
  const base = {
    title: 'Hello',
    slug: 'hello-world',
    summary: 'A short summary.',
    tags: [],
    content: doc,
  }

  it('accepts clean slugs only', () => {
    expect(postInputSchema.safeParse(base).success).toBe(true)
    for (const slug of ['Hello', 'hello--world', '-hello', 'hello world', 'héllo'])
      expect(postInputSchema.safeParse({ ...base, slug }).success).toBe(false)
  })

  it('rejects an empty document', () => {
    const empty = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] })
    expect(postInputSchema.safeParse({ ...base, content: empty }).success).toBe(false)
  })

  it('normalizes tags', () => {
    expect(normalizeTags(['How To', 'how-to', '', 'H2O!'])).toEqual(['how-to', 'h2o'])
  })
})

describe('rss', () => {
  it('escapes markup and builds absolute links', () => {
    expect(xmlEscape(`<a href="x">Tom & Jerry's</a>\u0001`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;',
    )
    const xml = rssXml(
      [
        {
          title: 'Ship <it> & go',
          slug: 'ship-it',
          summary: '"Quotes"',
          tags: ['news'],
          publishedAt: new Date('2026-10-01T12:00:00Z'),
          authorName: 'Olive',
        },
      ],
      'https://rhs.club/',
    )
    expect(xml).toContain('<title>Ship &lt;it&gt; &amp; go</title>')
    expect(xml).toContain('<link>https://rhs.club/blog/ship-it</link>')
    expect(xml).toContain('<pubDate>Thu, 01 Oct 2026 12:00:00 GMT</pubDate>')
    expect(xml).toContain('<description>&quot;Quotes&quot;</description>')
    expect(xml).not.toContain('Ship <it>')
  })
})
