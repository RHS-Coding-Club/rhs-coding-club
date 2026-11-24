import { useCallback, useEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'

/** Where a section counts as "being read": this far down the viewport. */
const READ_LINE = 0.3

/**
 * Scrollspy plus reading progress for a long document. `active` is the last
 * section whose top has passed the read line (the first one before any has),
 * `progress` runs 0 to 1 across the article. Both update once per frame at
 * most. `goTo` glides with Lenis, or jumps when it isn't running (reduced
 * motion), and puts the anchor in the URL.
 */
export function useReading(ids: string[]) {
  const articleRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(ids[0] ?? '')
  const [progress, setProgress] = useState(0)
  const lenis = useLenis()

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const line = window.innerHeight * READ_LINE
      let current = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
      const article = articleRef.current
      if (article) {
        const r = article.getBoundingClientRect()
        const span = r.height - window.innerHeight * 0.6
        setProgress(Math.min(1, Math.max(0, (line - r.top) / Math.max(1, span))))
      }
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
  }, [ids])

  const goTo = useCallback(
    (id: string, offset = -132) => {
      const el = document.getElementById(id)
      if (!el) return
      history.replaceState(null, '', `#${id}`)
      if (lenis) lenis.scrollTo(el, { offset })
      else el.scrollIntoView({ block: 'start' })
      // Move focus to the heading so keyboard and screen-reader users land there too.
      el.focus({ preventScroll: true })
    },
    [lenis],
  )

  return { articleRef, active, progress, goTo }
}
