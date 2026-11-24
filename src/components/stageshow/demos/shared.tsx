import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { useIsDark } from '#/hooks/use-is-dark'
import { cn } from '#/lib/utils'
import './club-look.css'

export type Size = { width: number; height: number }

/**
 * A picture slot that fills its parent and hands its measured size to a
 * Stage, so the stage draws at 1:1 and the tile, not the stage, owns the crop
 * (stageshow bento rule 12). Client-only: the stage measures and plays in the
 * browser. On the server, and until the first measure, the slot is an empty
 * box of the same size, so nothing shifts when the picture arrives.
 */
export function StageSlot({
  className,
  children,
}: {
  className?: string
  children: (size: Size) => ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size | null>(null)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    // Layout size, not getBoundingClientRect: a parent mid-entrance (a scaled
    // bento cell) would otherwise hand the stage a shrunken size.
    const measure = () => {
      const next = { width: node.clientWidth, height: node.clientHeight }
      setSize((prev) =>
        prev && prev.width === next.width && prev.height === next.height ? prev : next,
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} aria-hidden="true" className={cn('club-look relative', className)}>
      <ClientOnly>
        {size && size.width > 0 && size.height > 0 ? children(size) : null}
      </ClientOnly>
    </div>
  )
}

/** The kit theme that matches the site's current theme (it follows the toggle). */
export function useStageTheme(initialDark = true) {
  return useIsDark(initialDark) ? ('dark' as const) : ('light' as const)
}
