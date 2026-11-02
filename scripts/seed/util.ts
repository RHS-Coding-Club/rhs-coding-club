// Shared helpers for the seed modules. Each module returns SQL statements;
// scripts/seed.ts runs them in order (users first, then each domain).

export const DAY = 24 * 60 * 60 * 1000

export interface SeedContext {
  now: number
}

export function q(value: string | number | null | boolean): string {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? '1' : '0'
  return `'${value.replace(/'/g, "''")}'`
}

type Block =
  | string
  | { h2: string }
  | { h3: string }
  | { code: string; language?: string }
  | { list: string[] }

/**
 * A rich-text document (see src/lib/rich-text.ts) from simple blocks: strings
 * are paragraphs. Inline `code` in backticks becomes a code mark.
 */
export function doc(...blocks: Block[]): string {
  const inline = (s: string) =>
    s
      .split(/(`[^`]+`)/)
      .filter(Boolean)
      .map((part) =>
        part.startsWith('`')
          ? { type: 'text', text: part.slice(1, -1), marks: [{ type: 'code' }] }
          : { type: 'text', text: part },
      )
  const content = blocks.map((b) => {
    if (typeof b === 'string') return { type: 'paragraph', content: inline(b) }
    if ('h2' in b) return { type: 'heading', attrs: { level: 2 }, content: inline(b.h2) }
    if ('h3' in b) return { type: 'heading', attrs: { level: 3 }, content: inline(b.h3) }
    if ('code' in b)
      return {
        type: 'codeBlock',
        attrs: { language: b.language ?? 'python' },
        content: [{ type: 'text', text: b.code }],
      }
    return {
      type: 'bulletList',
      content: b.list.map((item) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: inline(item) }],
      })),
    }
  })
  return JSON.stringify({ type: 'doc', content })
}
