import { RichText } from '#/components/rich-text/rich-text'
import { cn } from '#/lib/utils'

/**
 * Highlighted code with exactly the look of a rich-text code block: it is
 * rendered as a one-block document through <RichText>, so lowlight and the
 * shared `.rich-text pre` frame do the work.
 */
export function CodeView({
  code,
  language,
  className,
}: {
  code: string
  /** lowlight grammar; null auto-detects. */
  language: string | null
  className?: string
}) {
  return (
    <RichText
      className={cn('[&_pre]:max-h-[32rem]', className)}
      value={{
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: language ? { language } : {},
            content: [{ type: 'text', text: code }],
          },
        ],
      }}
    />
  )
}

/** A plain mono panel for sample input/output (no highlighting; it is data). */
export function SamplePanel({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <figure
      className={cn(
        'overflow-hidden rounded-2xl bg-code-bg text-code-fg shadow-[inset_0_0_0_1px_var(--code-edge)]',
        className,
      )}
    >
      <figcaption className="flex items-center gap-2 border-b border-code-edge px-4 py-2.5 font-mono text-xs text-code-muted">
        <span aria-hidden="true" className="bg-brand-sky size-1.5 rounded-full" />
        {label}
      </figcaption>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[0.85rem] leading-relaxed whitespace-pre">
        {value}
      </pre>
    </figure>
  )
}
