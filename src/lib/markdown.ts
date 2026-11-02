import { Lexer } from 'marked'
import type { Token, Tokens } from 'marked'
import { safeHref, safeSrc } from '#/lib/rich-text'
import type { RichMark, RichNode } from '#/lib/rich-text'

/**
 * Turns Markdown into the Tiptap JSON the site stores (see lib/rich-text),
 * emitting only node and mark types the renderer allows. Raw HTML is dropped
 * to plain text; images keep only https URLs and the site's own uploads. Used
 * by the old site's import and by the MCP tools, which read and write Markdown.
 */
export function markdownToDoc(markdown: string): RichNode {
  const tokens = new Lexer({ gfm: true, breaks: false }).lex(
    markdown.replace(/\r\n/g, '\n'),
  )
  const content = blocks(tokens)
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

function blocks(tokens: Token[]): RichNode[] {
  const out: RichNode[] = []
  for (const t of tokens) {
    switch (t.type) {
      case 'heading': {
        const tok = t as Tokens.Heading
        // h1 in a post body reads as a section title; the page owns the h1.
        const level = Math.min(4, Math.max(2, tok.depth))
        out.push({ type: 'heading', attrs: { level }, content: inline(tok.tokens) })
        break
      }
      case 'paragraph': {
        const tok = t as Tokens.Paragraph
        // A paragraph that is only an image becomes a block image.
        const only = tok.tokens.length === 1 ? tok.tokens[0] : null
        if (only?.type === 'image') {
          const img = image(only as Tokens.Image)
          if (img) out.push(img)
          break
        }
        const kids = inline(tok.tokens)
        out.push(
          kids.length ? { type: 'paragraph', content: kids } : { type: 'paragraph' },
        )
        break
      }
      case 'list': {
        const tok = t as Tokens.List
        out.push({
          type: tok.ordered ? 'orderedList' : 'bulletList',
          ...(tok.ordered && tok.start && tok.start !== 1
            ? { attrs: { start: tok.start } }
            : {}),
          content: tok.items.map((item) => ({
            type: 'listItem',
            content: listItemBody(item),
          })),
        })
        break
      }
      case 'blockquote':
        out.push({ type: 'blockquote', content: blocks((t as Tokens.Blockquote).tokens) })
        break
      case 'code': {
        const tok = t as Tokens.Code
        out.push({
          type: 'codeBlock',
          attrs: { language: tok.lang?.trim().split(/\s/)[0] || null },
          ...(tok.text ? { content: [{ type: 'text', text: tok.text }] } : {}),
        })
        break
      }
      case 'hr':
        out.push({ type: 'horizontalRule' })
        break
      case 'table': {
        // No table node on the site: keep the content as one row per line.
        const tok = t as Tokens.Table
        const rows = [tok.header, ...tok.rows].map((cells) =>
          cells.map((c) => c.text).join(' · '),
        )
        for (const r of rows)
          out.push({ type: 'paragraph', content: [{ type: 'text', text: r }] })
        break
      }
      case 'html': {
        const text = (t as Tokens.HTML).text.replace(/<[^>]+>/g, '').trim()
        if (text) out.push({ type: 'paragraph', content: [{ type: 'text', text }] })
        break
      }
      case 'space':
        break
      default: {
        const raw = 'text' in t && typeof t.text === 'string' ? t.text : ''
        if (raw.trim())
          out.push({ type: 'paragraph', content: [{ type: 'text', text: raw }] })
      }
    }
  }
  return out
}

function listItemBody(item: Tokens.ListItem): RichNode[] {
  // Tight list items hold inline "text" tokens; loose ones hold paragraphs.
  const body: RichNode[] = []
  let inlineRun: Token[] = []
  const flush = () => {
    if (!inlineRun.length) return
    const kids = inline(inlineRun)
    body.push(kids.length ? { type: 'paragraph', content: kids } : { type: 'paragraph' })
    inlineRun = []
  }
  for (const t of item.tokens) {
    if (t.type === 'text') {
      const tok = t as Tokens.Text
      inlineRun.push(...(tok.tokens ?? [{ type: 'text', raw: tok.raw, text: tok.text }]))
    } else {
      flush()
      body.push(...blocks([t]))
    }
  }
  flush()
  return body.length ? body : [{ type: 'paragraph' }]
}

function inline(tokens: Token[] | undefined, marks: RichMark[] = []): RichNode[] {
  const out: RichNode[] = []
  const text = (value: string, m = marks) => {
    if (!value) return
    out.push({ type: 'text', text: value, ...(m.length ? { marks: m } : {}) })
  }
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'text':
      case 'escape': {
        const tok = t as Tokens.Text
        if (tok.tokens?.length) out.push(...inline(tok.tokens, marks))
        else text(decode(tok.text))
        break
      }
      case 'strong':
        out.push(...inline((t as Tokens.Strong).tokens, [...marks, { type: 'bold' }]))
        break
      case 'em':
        out.push(...inline((t as Tokens.Em).tokens, [...marks, { type: 'italic' }]))
        break
      case 'del':
        out.push(...inline((t as Tokens.Del).tokens, [...marks, { type: 'strike' }]))
        break
      case 'codespan':
        text(decode((t as Tokens.Codespan).text), [...marks, { type: 'code' }])
        break
      case 'link': {
        const tok = t as Tokens.Link
        out.push(
          ...inline(tok.tokens, [...marks, { type: 'link', attrs: { href: tok.href } }]),
        )
        break
      }
      case 'br':
        out.push({ type: 'hardBreak' })
        break
      case 'image': {
        // Inline images have no inline node here; keep the alt text.
        text((t as Tokens.Image).text)
        break
      }
      case 'html':
        text((t as Tokens.HTML).text.replace(/<[^>]+>/g, ''))
        break
      default:
        if ('text' in t && typeof t.text === 'string') text(decode(t.text))
    }
  }
  return out
}

function image(tok: Tokens.Image): RichNode | null {
  const src = safeSrc(tok.href)
  return src ? { type: 'image', attrs: { src, alt: tok.text || '' } } : null
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
}
const decode = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m] ?? m)

/** The reverse, for showing stored documents to an AI client as Markdown. */
export function docToMarkdown(doc: RichNode): string {
  return blocksToMarkdown(doc.content ?? []).trim()
}

function blocksToMarkdown(nodes: RichNode[]): string {
  return nodes
    .map(blockToMarkdown)
    .filter((b) => b !== null)
    .join('\n\n')
}

const indent = (text: string, by: string) => text.split('\n').join(`\n${by}`)

function blockToMarkdown(node: RichNode): string | null {
  switch (node.type) {
    case 'paragraph':
      return inlineToMarkdown(node.content)
    case 'heading':
      return `${'#'.repeat(Number(node.attrs?.level) || 2)} ${inlineToMarkdown(node.content)}`
    case 'bulletList':
      return (node.content ?? [])
        .map((item) => `- ${indent(blocksToMarkdown(item.content ?? []), '  ')}`)
        .join('\n')
    case 'orderedList': {
      const start = Number(node.attrs?.start) || 1
      return (node.content ?? [])
        .map((item, i) => {
          const marker = `${start + i}. `
          return (
            marker +
            indent(blocksToMarkdown(item.content ?? []), ' '.repeat(marker.length))
          )
        })
        .join('\n')
    }
    case 'blockquote':
      return blocksToMarkdown(node.content ?? [])
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n')
    case 'codeBlock': {
      const language = typeof node.attrs?.language === 'string' ? node.attrs.language : ''
      const code = (node.content ?? []).map((t) => t.text ?? '').join('')
      return `\`\`\`${language}\n${code}\n\`\`\``
    }
    case 'horizontalRule':
      return '---'
    case 'image': {
      const src = safeSrc(node.attrs?.src)
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
      return src ? `![${alt}](${src})` : null
    }
    default:
      return node.content ? blocksToMarkdown(node.content) : (node.text ?? null)
  }
}

function inlineToMarkdown(nodes: RichNode[] | undefined): string {
  return (nodes ?? [])
    .map((node) => {
      if (node.type === 'hardBreak') return '  \n'
      let out = node.text ?? ''
      for (const mark of node.marks ?? []) {
        if (mark.type === 'code') out = `\`${out}\``
        else if (mark.type === 'bold') out = `**${out}**`
        else if (mark.type === 'italic') out = `*${out}*`
        else if (mark.type === 'strike') out = `~~${out}~~`
        else if (mark.type === 'link') {
          const href = safeHref(mark.attrs?.href)
          if (href) out = `[${out}](${href})`
        }
      }
      return out
    })
    .join('')
}
