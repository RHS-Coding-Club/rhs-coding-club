import { useMemo } from 'react'
import { OutlineMenu, SectionNumber } from '#/components/outline-menu'
import { headingOutline, parseRichText } from '#/lib/rich-text'

/**
 * A post's table of contents: one branch per section (h2), from the anchor
 * ids the rich-text renderer gives headings. Posts with fewer than two
 * sections don't get one. The post page shows it open in the side rail on
 * wide screens and folded above the text on narrow ones.
 */
export function PostOutline({
  content,
  defaultOpen = true,
  className,
}: {
  content: string
  defaultOpen?: boolean
  className?: string
}) {
  const sections = useMemo(
    () =>
      headingOutline(parseRichText(content))
        .filter((h) => h.level === 2)
        .map((h, i) => ({
          id: h.id,
          // The menu numbers sections, so "2. Run the sample" reads "Run the sample".
          label: h.text.replace(/^\d+[.)]\s+/, ''),
          icon: <SectionNumber n={i + 1} />,
        })),
    [content],
  )
  if (sections.length < 2) return null
  return (
    <OutlineMenu sections={sections} defaultOpen={defaultOpen} className={className} />
  )
}
