import { z } from 'zod'

// Rich text (blog posts, challenge prompts, newsletter issues) is stored as
// a Tiptap/ProseMirror JSON document in a text column. It is never stored or
// injected as HTML: the renderers below walk the JSON and emit only the node
// and mark types listed here, so there is nothing to sanitize. Unknown nodes
// render their children; unsafe link and image URLs are dropped.

export interface RichMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface RichNode {
  type: string
  attrs?: Record<string, unknown>
  content?: RichNode[]
  marks?: RichMark[]
  text?: string
}

export const EMPTY_DOC: RichNode = { type: 'doc', content: [{ type: 'paragraph' }] }
export const EMPTY_DOC_JSON = JSON.stringify(EMPTY_DOC)

const MAX_JSON = 200_000

const nodeSchema: z.ZodType<RichNode> = z.lazy(() =>
  z.object({
    type: z.string().max(40),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(nodeSchema).optional(),
    marks: z
      .array(
        z.object({
          type: z.string().max(40),
          attrs: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
    text: z.string().optional(),
  }),
)

/** Parses stored JSON into a document; bad input yields an empty doc. */
export function parseRichText(json: string | null | undefined): RichNode {
  if (!json) return EMPTY_DOC
  try {
    const parsed = nodeSchema.safeParse(JSON.parse(json))
    return parsed.success && parsed.data.type === 'doc' ? parsed.data : EMPTY_DOC
  } catch {
    return EMPTY_DOC
  }
}

/** Zod field for a rich-text JSON string. `required` rejects an empty doc. */
export function richTextField(opts: { required?: boolean; message?: string } = {}) {
  return z
    .string()
    .max(MAX_JSON, 'That is too long.')
    .refine(
      (s) => {
        try {
          const parsed = nodeSchema.safeParse(JSON.parse(s))
          return parsed.success && parsed.data.type === 'doc'
        } catch {
          return false
        }
      },
      { message: 'Invalid document.' },
    )
    .refine((s) => !opts.required || plainText(parseRichText(s)).trim().length > 0, {
      message: opts.message ?? 'Write something first.',
    })
}

/** Text content of a document, blocks separated by blank lines. */
export function plainText(node: RichNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  const inner = (node.content ?? []).map(plainText)
  const isBlockParent = ['doc', 'bulletList', 'orderedList', 'blockquote'].includes(
    node.type,
  )
  return inner.join(isBlockParent ? '\n\n' : '')
}

/** Reading time at 220 wpm, at least one minute. */
export function readingMinutes(node: RichNode) {
  const words = plainText(node).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

/** First `max` characters of the text, cut on a word boundary. */
export function excerpt(node: RichNode, max = 180) {
  const text = plainText(node).replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max)).trimEnd()}…`
}

/** Only http(s), mailto, and site-relative links survive rendering. */
export function safeHref(href: unknown): string | null {
  if (typeof href !== 'string') return null
  const v = href.trim()
  if (v.startsWith('/') && !v.startsWith('//')) return v
  return /^(https?:|mailto:)/i.test(v) ? v : null
}

/** Images must be our own uploads or https. */
export function safeSrc(src: unknown): string | null {
  if (typeof src !== 'string') return null
  const v = src.trim()
  if (v.startsWith('/files/')) return v
  return /^https:\/\//i.test(v) ? v : null
}

export function headingLevel(attrs: RichNode['attrs']): 2 | 3 | 4 {
  const level = Number(attrs?.level)
  return level <= 2 ? 2 : level >= 4 ? 4 : 3
}

const ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c] ?? c)

/**
 * HTML for emails (inline styles, no highlighting). Same allow-list as the
 * React renderer. `origin` makes uploaded image paths absolute.
 */
export function richTextToEmailHtml(node: RichNode, origin = ''): string {
  const kids = () =>
    (node.content ?? []).map((child) => richTextToEmailHtml(child, origin)).join('')
  const p = 'margin:0 0 16px;font-size:16px;line-height:1.6;color:#101826'
  switch (node.type) {
    case 'doc':
      return kids()
    case 'paragraph':
      return `<p style="${p}">${kids() || '&nbsp;'}</p>`
    case 'heading': {
      const l = headingLevel(node.attrs)
      const size = l === 2 ? 20 : l === 3 ? 18 : 16
      return `<h${l} style="margin:24px 0 12px;font-size:${size}px;color:#101826">${kids()}</h${l}>`
    }
    case 'bulletList':
      return `<ul style="margin:0 0 16px;padding-left:22px">${kids()}</ul>`
    case 'orderedList':
      return `<ol style="margin:0 0 16px;padding-left:22px">${kids()}</ol>`
    case 'listItem':
      return `<li style="margin:0 0 6px">${kids()}</li>`
    case 'blockquote':
      return `<blockquote style="margin:0 0 16px;padding-left:14px;border-left:3px solid #5fb2ee;color:#3a4556">${kids()}</blockquote>`
    case 'codeBlock':
      return `<pre style="margin:0 0 16px;padding:14px;background:#0b0f15;color:#e6edf5;border-radius:10px;font-size:13px;overflow:auto"><code>${esc(plainText(node))}</code></pre>`
    case 'horizontalRule':
      return '<hr style="border:0;border-top:1px solid #dbe2ea;margin:24px 0">'
    case 'hardBreak':
      return '<br>'
    case 'image': {
      const src = safeSrc(node.attrs?.src)
      if (!src) return ''
      const abs = src.startsWith('/') ? `${origin}${src}` : src
      return `<img src="${esc(abs)}" alt="${esc(String(node.attrs?.alt ?? ''))}" style="max-width:100%;border-radius:12px;margin:0 0 16px">`
    }
    case 'text': {
      let out = esc(node.text ?? '')
      for (const m of node.marks ?? []) {
        if (m.type === 'bold') out = `<strong>${out}</strong>`
        else if (m.type === 'italic') out = `<em>${out}</em>`
        else if (m.type === 'underline') out = `<u>${out}</u>`
        else if (m.type === 'strike') out = `<s>${out}</s>`
        else if (m.type === 'code')
          out = `<code style="background:#eef2f7;padding:1px 5px;border-radius:5px;font-size:14px">${out}</code>`
        else if (m.type === 'link') {
          const href = safeHref(m.attrs?.href)
          if (href) out = `<a href="${esc(href)}" style="color:#1f4f8a">${out}</a>`
        }
      }
      return out
    }
    default:
      return kids()
  }
}
