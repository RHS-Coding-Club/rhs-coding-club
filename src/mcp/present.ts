import { docToMarkdown } from '#/lib/markdown'
import { parseRichText } from '#/lib/rich-text'

// A bare address, wherever it sits: under `to`, in a list, or under a key
// a future tool names differently. Requiring a dot after the @ leaves
// handles like "@club" and versions like "pkg@1" alone.
const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// maskEmail's "ad•••@example.com" is safe to show, so it stays.
const isAddress = (v: unknown) =>
  typeof v === 'string' && !v.includes('•') && ADDRESS.test(v.trim())

/**
 * What an AI app sees of a tool result. Rich-text documents become Markdown,
 * and email addresses are left out unless the tool needs them.
 */
export function present(value: unknown, revealEmails: boolean): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((v) => revealEmails || !isAddress(v))
      .map((v) => present(v, revealEmails))
  }
  if (value instanceof Date) return value.toISOString()
  if (value === null || typeof value !== 'object') {
    return !revealEmails && isAddress(value) ? null : value
  }
  const out: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(value)) {
    if (!revealEmails) {
      if (isAddress(v)) continue
      if (/email/i.test(key) && typeof v === 'string' && v.includes('@')) continue
    }
    if (typeof v === 'string' && v.startsWith('{"type":"doc"')) {
      out[key] = docToMarkdown(parseRichText(v))
      continue
    }
    out[key] = present(v, revealEmails)
  }
  return out
}
