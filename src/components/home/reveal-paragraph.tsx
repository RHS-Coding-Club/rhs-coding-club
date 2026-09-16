import { useEffect, useRef, useState } from 'react'

const COPY =
  'RHS Coding Club is where Ripon High students learn to code together: a new challenge every week, points for solving it, events and a hackathon each year, and afternoons teaching kids at the Ripon Afterschool Program.'

const WORDS = COPY.split(' ')

/**
 * The template's scroll-reveal paragraph: words brighten from muted to full
 * as the block scrolls up the viewport. Server-rendered fully visible;
 * JavaScript dims it on mount and drives the reveal from scroll position.
 */
export function RevealParagraph() {
  const ref = useRef<HTMLParagraphElement>(null)
  // -1 = static (no JS or reduced motion): every word rendered at full color.
  const [lit, setLit] = useState(-1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // Progress runs from the block entering the lower third of the
      // viewport to its bottom edge reaching the upper third.
      const start = vh * 0.75
      const end = vh * 0.3
      const progress = (start - rect.top) / (rect.height + (start - end))
      const clamped = Math.min(1, Math.max(0, progress))
      setLit(Math.round(clamped * WORDS.length))
    }
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-(--gutter) py-28 sm:py-36">
      <p
        ref={ref}
        className="text-3xl leading-snug font-medium tracking-[-0.02em] text-balance sm:text-4xl sm:leading-snug"
      >
        {WORDS.map((word, i) => (
          <span
            // Static copy, positions are stable.
            key={i}
            className={
              lit === -1 || i < lit
                ? 'text-foreground transition-colors duration-300'
                : 'text-foreground/25 transition-colors duration-300'
            }
          >
            {word}
            {i < WORDS.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
    </section>
  )
}
