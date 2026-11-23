import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { safeRedirect } from '#/lib/format'
import { markdownToDoc } from '#/lib/markdown'
import { richTextField, richTextToEmailHtml, safeHref, safeSrc } from '#/lib/rich-text'
import type { RichNode } from '#/lib/rich-text'
import { present } from '#/mcp/present'

// Property tests: fast-check throws thousands of generated inputs at the code
// that stands between visitors and the site, then shrinks any failure to the
// smallest input that breaks it.

const SITE = 'https://club.example'

/** Where a browser on the site would go for this href, or null if nowhere. */
function destination(href: string): URL | null {
  try {
    return new URL(href, `${SITE}/blog/post`)
  } catch {
    return null
  }
}

const onSite = (href: string) => destination(href)?.origin === SITE

// The characters that matter to the URL parser, so the generator reaches
// tricks like "/\evil", "/<tab>/evil", and "java\nscript:" quickly.
const urlChar = fc.constantFrom(
  ...'/\\\t\n\r :.@%?#&=ajvscrpthmilodf2F5C'.split(''),
  '\u0000',
  ' ',
)
const prefix = fc.constantFrom(
  '',
  '/',
  '//',
  '/\\',
  '\\',
  ' /',
  '/files/',
  'http:',
  'https://',
  'mailto:',
  'javascript:',
  'JaVaScRiPt:',
  'data:',
  'vbscript:',
)
const urlish = fc.oneof(
  fc.string({ unit: 'binary', maxLength: 40 }),
  fc
    .tuple(prefix, fc.string({ unit: urlChar, maxLength: 20 }), fc.webUrl())
    .map(([a, b, c]) => a + b + c),
  fc.tuple(prefix, fc.string({ unit: urlChar, maxLength: 30 })).map(([a, b]) => a + b),
)

describe('safeHref', () => {
  it('only lets through links to this site, http(s), or mailto', () => {
    fc.assert(
      fc.property(urlish, (raw) => {
        const href = safeHref(raw)
        if (href === null) return
        const to = destination(href)
        if (to === null) return
        expect(
          to.origin === SITE || ['http:', 'https:', 'mailto:'].includes(to.protocol),
        ).toBe(true)
        // A path counts as internal (same tab, no rel) only if it stays here.
        if (href.startsWith('/')) expect(to.origin).toBe(SITE)
      }),
      { numRuns: 5000 },
    )
  })

  it('refuses paths a browser reads as another site', () => {
    for (const raw of ['/\\evil.example', '/\t/evil.example', '/\n\\evil.example']) {
      expect(safeHref(raw)).toBeNull()
    }
    expect(safeHref('/events')).toBe('/events')
  })
})

describe('safeSrc', () => {
  it('only lets through our uploads or https images', () => {
    fc.assert(
      fc.property(urlish, (raw) => {
        const src = safeSrc(raw)
        if (src === null) return
        const to = destination(src)
        if (to === null) return
        if (to.origin === SITE) expect(to.pathname.startsWith('/files/')).toBe(true)
        else expect(to.protocol).toBe('https:')
      }),
      { numRuns: 5000 },
    )
  })
})

describe('safeRedirect', () => {
  it('never sends someone to another site after they sign in', () => {
    fc.assert(
      fc.property(urlish, (raw) => {
        const next = safeRedirect(raw, '/dashboard')
        expect(onSite(next)).toBe(true)
      }),
      { numRuns: 5000 },
    )
  })

  it('refuses the backslash and whitespace tricks', () => {
    for (const raw of ['//evil.example', '/\\evil.example', '/\t/evil.example']) {
      expect(safeRedirect(raw)).toBe('/dashboard')
    }
    expect(safeRedirect('/events?x=1')).toBe('/events?x=1')
  })
})

// Any tree a malicious or buggy client could send, including node types,
// marks, and attributes the site doesn't allow.
const { node: anyNode } = fc.letrec<{ node: RichNode }>((tie) => ({
  node: fc.oneof(
    { depthSize: 'small', withCrossShrink: true },
    fc.record(
      {
        type: fc.constant('text'),
        text: fc.string({ unit: 'binary', maxLength: 30 }),
        marks: fc.array(
          fc.record({
            type: fc.constantFrom(
              'bold',
              'italic',
              'underline',
              'strike',
              'code',
              'link',
              'script',
            ),
            attrs: fc.record({ href: urlish, onclick: fc.string() }),
          }),
          { maxLength: 3 },
        ),
      },
      { requiredKeys: ['type', 'text'] },
    ) as fc.Arbitrary<RichNode>,
    fc.record(
      {
        type: fc.constantFrom(
          'doc',
          'paragraph',
          'heading',
          'bulletList',
          'orderedList',
          'listItem',
          'blockquote',
          'codeBlock',
          'horizontalRule',
          'hardBreak',
          'image',
          'iframe',
          'script',
        ),
        attrs: fc.record(
          {
            level: fc.oneof(fc.integer(), fc.string()),
            src: urlish,
            alt: fc.string({ unit: 'binary', maxLength: 20 }),
            style: fc.string(),
          },
          { requiredKeys: [] },
        ),
        content: fc.array(tie('node'), { maxLength: 4 }),
      },
      { requiredKeys: ['type'] },
    ) as fc.Arbitrary<RichNode>,
  ),
}))

const EMAIL_TAG =
  /<\/?(?:p|h[234]|ul|ol|li|blockquote|pre|code|hr|br|img|strong|em|u|s|a)(?:\s+(?:href|src|alt|style)="[^"<>]*")*\s*>/g

const unescape = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

describe('richTextToEmailHtml', () => {
  it('emits only allowed tags and attributes, whatever the document holds', () => {
    fc.assert(
      fc.property(anyNode, (doc) => {
        const html = richTextToEmailHtml(doc, SITE)
        // With every allowed tag removed, no markup can be left over.
        expect(html.replace(EMAIL_TAG, '')).not.toMatch(/[<>]/)
      }),
      { numRuns: 2000 },
    )
  })

  it('writes absolute, safe links and images', () => {
    fc.assert(
      fc.property(anyNode, (doc) => {
        const html = richTextToEmailHtml(doc, SITE)
        for (const [, attr, value] of html.matchAll(/(href|src)="([^"]*)"/g)) {
          const url = unescape(value)
          expect(url.startsWith('/'), `relative ${attr} in an email`).toBe(false)
          const to = destination(url)
          if (to === null) continue
          if (attr === 'src') expect(to.protocol).toBe('https:')
          else expect(['http:', 'https:', 'mailto:']).toContain(to.protocol)
        }
      }),
      { numRuns: 2000 },
    )
  })
})

describe('markdownToDoc', () => {
  it('turns any Markdown an AI sends into a document the site accepts', () => {
    const markdown = fc.oneof(
      fc.string({ unit: 'binary', maxLength: 200 }),
      fc
        .array(
          fc.oneof(
            fc.constantFrom('# ', '- ', '1. ', '> ', '```\n', '**', '*', '`', '\n\n'),
            urlish.map((u) => `[x](${u})`),
            urlish.map((u) => `![x](${u})`),
            fc.constantFrom('<script>alert(1)</script>', '<img src=x onerror=alert(1)>'),
            fc.string({ maxLength: 20 }),
          ),
          { maxLength: 20 },
        )
        .map((parts) => parts.join('')),
    )
    fc.assert(
      fc.property(markdown, (md) => {
        const json = JSON.stringify(markdownToDoc(md))
        expect(richTextField().safeParse(json).success).toBe(true)
      }),
      { numRuns: 1000 },
    )
  })
})

describe('present (MCP results)', () => {
  // Plain values, plus email addresses hidden anywhere in the tree.
  const { value: tree } = fc.letrec<{ value: unknown }>((tie) => ({
    value: fc.oneof(
      { depthSize: 'small' },
      fc.string({ maxLength: 20 }),
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
      fc.emailAddress(),
      fc.array(tie('value'), { maxLength: 4 }),
      fc.dictionary(
        fc.oneof(
          fc.string({ maxLength: 8 }),
          fc.constantFrom('email', 'to', 'userEmail'),
        ),
        tie('value'),
        { maxKeys: 4 },
      ),
    ),
  }))

  const strings = (v: unknown, out: string[] = []): string[] => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
    else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
    return out
  }

  it('never shows an AI app an email address unless the tool needs it', () => {
    fc.assert(
      fc.property(tree, (value) => {
        for (const s of strings(present(value, false))) {
          expect(s).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        }
      }),
      { numRuns: 2000 },
    )
  })

  it('passes plain data through untouched when emails are allowed', () => {
    fc.assert(
      fc.property(tree, (value) => {
        expect(present(value, true)).toEqual(value)
      }),
      { numRuns: 1000 },
    )
  })

  it('catches addresses outside an email-named field, and keeps masked ones', () => {
    expect(present({ to: 'a@b.example', list: ['c@d.example', 'ok'] }, false)).toEqual({
      list: ['ok'],
    })
    expect(present({ maskedAddress: 're•••@b.example' }, false)).toEqual({
      maskedAddress: 're•••@b.example',
    })
  })
})
