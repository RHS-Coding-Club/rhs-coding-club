import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouteContext } from '@tanstack/react-router'
import { useLenis } from 'lenis/react'
import BranchedMenu from '#/components/bits/BranchedMenu'
import { useIsDark } from '#/hooks/use-is-dark'

export interface OutlineSection {
  /** The element id to scroll to. */
  id: string
  label: string
  icon?: ReactNode
}

/** Where a section counts as "being read": this far down the viewport. */
const READ_LINE = 0.35

/**
 * "On this page" in React Bits Branched Menu, for long pages (blog posts,
 * privacy, terms, account settings). The title is the trunk, each section
 * branches off it, and the line traces to the section you're reading as you
 * scroll. Clicking a branch glides there (Lenis) or jumps (reduced motion)
 * and puts the anchor in the URL.
 *
 * `defaultOpen={false}` starts it folded, for phones where it sits above the
 * text. `startActive` marks the first section before any has scrolled past
 * the read line, for pages whose first section starts near the top.
 */
export function OutlineMenu({
  sections,
  title = 'On this page',
  defaultOpen = true,
  startActive = false,
  className,
}: {
  sections: OutlineSection[]
  title?: string
  defaultOpen?: boolean
  startActive?: boolean
  className?: string
}) {
  const { theme } = useRouteContext({ from: '__root__' })
  const dark = useIsDark(theme === 'dark')
  const lenis = useLenis()
  const [active, setActive] = useState(startActive ? (sections[0]?.id ?? '') : '')

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const line = window.innerHeight * READ_LINE
      let current = startActive ? (sections[0]?.id ?? '') : ''
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) current = s.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [sections, startActive])

  return (
    <div className={className}>
      <BranchedMenu
        items={[
          {
            label: title,
            children: sections.map((s) => ({
              value: s.id,
              label: s.label,
              icon: s.icon,
            })),
          },
        ]}
        label={title}
        active={active}
        defaultOpen={defaultOpen ? 0 : -1}
        onSelect={(id) => {
          const el = document.getElementById(id)
          if (!el) return
          history.replaceState(null, '', `#${id}`)
          if (lenis) lenis.scrollTo(el, { offset: -112 })
          else el.scrollIntoView({ block: 'start' })
        }}
        color="var(--foreground)"
        accentColor={dark ? '#5fb2ee' : '#1f4f8a'}
        lineColor="var(--border)"
        width={260}
        fontSize={14}
        rowHeight={34}
      />
    </div>
  )
}

/** A section number, as a Branched Menu icon. */
export function SectionNumber({ n }: { n: number }) {
  return <span className="tabular w-4 text-center font-mono text-xs opacity-70">{n}</span>
}
