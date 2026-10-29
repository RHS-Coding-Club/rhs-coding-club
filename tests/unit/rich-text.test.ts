import { describe, expect, it } from 'vitest'
import {
  EMPTY_DOC,
  excerpt,
  headingOutline,
  parseRichText,
  plainText,
  richTextField,
  richTextToEmailHtml,
  safeHref,
  safeSrc,
} from '#/lib/rich-text'

const doc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        {
          type: 'text',
          text: 'there',
          marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
        },
      ],
    },
  ],
}

describe('parseRichText', () => {
  it('falls back to an empty doc on bad input', () => {
    expect(parseRichText('not json')).toEqual(EMPTY_DOC)
    expect(parseRichText(JSON.stringify({ type: 'paragraph' }))).toEqual(EMPTY_DOC)
    expect(parseRichText(null)).toEqual(EMPTY_DOC)
  })
  it('round-trips a valid doc', () => {
    expect(parseRichText(JSON.stringify(doc))).toEqual(doc)
  })
})

describe('plainText and excerpt', () => {
  it('joins blocks with blank lines', () => {
    expect(plainText(doc)).toBe('Title\n\nHello there')
  })
  it('cuts on a word boundary', () => {
    expect(excerpt(doc, 10)).toBe('Title…')
  })
})

describe('url allow-lists', () => {
  it('keeps http(s), mailto, and site paths', () => {
    expect(safeHref('https://x.dev')).toBe('https://x.dev')
    expect(safeHref('mailto:a@b.c')).toBe('mailto:a@b.c')
    expect(safeHref('/blog')).toBe('/blog')
  })
  it('drops script and protocol-relative urls', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull()
    expect(safeHref('//evil.com')).toBeNull()
    expect(safeSrc('http://x.dev/a.png')).toBeNull()
    expect(safeSrc('/files/post/a.png')).toBe('/files/post/a.png')
  })
})

describe('richTextToEmailHtml', () => {
  it('escapes text and strips unsafe links', () => {
    const html = richTextToEmailHtml({
      type: 'doc',
      content: [
        ...doc.content,
        { type: 'paragraph', content: [{ type: 'text', text: '<script>x</script>' }] },
      ],
    })
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('richTextField', () => {
  it('rejects empty docs when required', () => {
    const field = richTextField({ required: true })
    expect(field.safeParse(JSON.stringify(EMPTY_DOC)).success).toBe(false)
    expect(field.safeParse(JSON.stringify(doc)).success).toBe(true)
    expect(field.safeParse('{"type":"nope"}').success).toBe(false)
  })
})

describe('headingOutline', () => {
  it('lists headings in order with unique slug ids', () => {
    const h = (level: number, text: string) => ({
      type: 'heading',
      attrs: { level },
      content: [{ type: 'text', text }],
    })
    const outline = headingOutline({
      type: 'doc',
      content: [
        h(2, 'What is new'),
        h(3, 'Found a bug?'),
        h(2, 'What is new'),
        h(2, '!!!'),
      ],
    })
    expect(outline).toEqual([
      { id: 'what-is-new', level: 2, text: 'What is new' },
      { id: 'found-a-bug', level: 3, text: 'Found a bug?' },
      { id: 'what-is-new-2', level: 2, text: 'What is new' },
      { id: 'section', level: 2, text: '!!!' },
    ])
  })
})
