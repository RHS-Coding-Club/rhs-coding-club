import { Fragment } from 'react'
import type { ReactNode } from 'react'
import {
  headingLevel,
  headingOutline,
  parseRichText,
  plainText,
  safeHref,
  safeSrc,
} from '#/lib/rich-text'
import type { RichNode } from '#/lib/rich-text'
import { cn } from '#/lib/utils'
import { lowlight } from './lowlight'

type Hast =
  | { type: 'text'; value: string }
  | {
      type: 'element'
      tagName: string
      properties?: { className?: string[] }
      children: Hast[]
    }
  | { type: 'root'; children: Hast[] }

function renderHast(node: Hast, key: number): ReactNode {
  if (node.type === 'text') return node.value
  const children = node.children.map(renderHast)
  if (node.type === 'root') return children
  return (
    <span key={key} className={node.properties?.className?.join(' ')}>
      {children}
    </span>
  )
}

function CodeBlock({ node }: { node: RichNode }) {
  const code = plainText(node)
  const language = typeof node.attrs?.language === 'string' ? node.attrs.language : null
  let highlighted: ReactNode = code
  try {
    const tree =
      language && lowlight.registered(language)
        ? lowlight.highlight(language, code)
        : lowlight.highlightAuto(code)
    highlighted = renderHast(tree as Hast, 0)
  } catch {
    // Fall back to plain text.
  }
  return (
    <pre data-language={language ?? undefined}>
      <code className="hljs">{highlighted}</code>
    </pre>
  )
}

/** Heading ids from `headingOutline`, handed out in document order. */
interface Ctx {
  ids: string[]
  next: number
}

function renderNode(node: RichNode, key: number, ctx: Ctx): ReactNode {
  const kids = () => (node.content ?? []).map((child, i) => renderNode(child, i, ctx))
  switch (node.type) {
    case 'doc':
      return <Fragment key={key}>{kids()}</Fragment>
    case 'paragraph':
      return <p key={key}>{kids()}</p>
    case 'heading': {
      const Tag = `h${headingLevel(node.attrs)}` as const
      const id = ctx.ids[ctx.next++]
      return (
        <Tag key={key} id={id}>
          {kids()}
        </Tag>
      )
    }
    case 'bulletList':
      return <ul key={key}>{kids()}</ul>
    case 'orderedList':
      return (
        <ol key={key} start={Number(node.attrs?.start) || undefined}>
          {kids()}
        </ol>
      )
    case 'listItem':
      return <li key={key}>{kids()}</li>
    case 'blockquote':
      return <blockquote key={key}>{kids()}</blockquote>
    case 'codeBlock':
      return <CodeBlock key={key} node={node} />
    case 'horizontalRule':
      return <hr key={key} />
    case 'hardBreak':
      return <br key={key} />
    case 'image': {
      const src = safeSrc(node.attrs?.src)
      if (!src) return null
      return (
        <img
          key={key}
          src={src}
          alt={typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''}
          loading="lazy"
        />
      )
    }
    case 'text': {
      let out: ReactNode = node.text ?? ''
      for (const m of node.marks ?? []) {
        if (m.type === 'bold') out = <strong>{out}</strong>
        else if (m.type === 'italic') out = <em>{out}</em>
        else if (m.type === 'underline') out = <u>{out}</u>
        else if (m.type === 'strike') out = <s>{out}</s>
        else if (m.type === 'code') out = <code>{out}</code>
        else if (m.type === 'link') {
          const href = safeHref(m.attrs?.href)
          if (href) {
            const external = !href.startsWith('/')
            out = (
              <a
                href={href}
                {...(external
                  ? { target: '_blank', rel: 'noopener noreferrer nofollow' }
                  : {})}
              >
                {out}
              </a>
            )
          }
        }
      }
      return <Fragment key={key}>{out}</Fragment>
    }
    default:
      return <Fragment key={key}>{kids()}</Fragment>
  }
}

/**
 * Renders a stored rich-text document (JSON string or parsed) as prose. Safe
 * by construction: only allow-listed nodes and marks become elements.
 * Headings get anchor ids from `headingOutline`.
 */
export function RichText({
  value,
  className,
}: {
  value: string | RichNode | null | undefined
  className?: string
}) {
  const doc = typeof value === 'string' || value == null ? parseRichText(value) : value
  const ctx: Ctx = { ids: headingOutline(doc).map((h) => h.id), next: 0 }
  return <div className={cn('rich-text', className)}>{renderNode(doc, 0, ctx)}</div>
}
