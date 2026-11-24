import { useEffect, useRef } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Moon } from '#/components/icons/moon'
import { Sun } from '#/components/icons/sun'
import { setTheme } from '#/server/theme'
import { RaisedButton } from '#/components/raised-button'
import { useIsDark } from '#/hooks/use-is-dark'
import type { Theme } from '#/server/theme'
import { STATIC_GROUND } from '#/lib/static-palette'

/**
 * Returns a function that flips the theme: swaps the <html> class right away
 * and persists the choice in a cookie via a server function. Where the browser
 * has view transitions, the whole page crossfades once (canvases and WebGL
 * included) instead of some colors fading while others snap. Reduced motion
 * skips the crossfade.
 */
export function useFlipTheme() {
  const persist = useServerFn(setTheme)
  return () => {
    const root = document.documentElement
    const next: Theme = root.classList.contains('dark') ? 'light' : 'dark'
    const apply = () => {
      root.classList.toggle('dark', next === 'dark')
      root.classList.toggle('light', next === 'light')
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', STATIC_GROUND[next])
    }
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!calm && typeof document.startViewTransition === 'function') {
      document.startViewTransition(apply)
    } else apply()
    void persist({ data: next })
    return next
  }
}

/**
 * Floating theme switch, bottom-right on every page. Admin pages hide it;
 * their dock has its own switch. On phones it steps aside while the page
 * scrolls down (it would sit on top of buttons near the bottom edge) and comes
 * back on any scroll up, the way Safari's toolbar does.
 */
export function ThemeToggle({ initial }: { initial: Theme }) {
  // Follows the <html> class, so it stays right when the admin dock flips it.
  const dark = useIsDark(initial === 'dark')
  const flip = useFlipTheme()
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 639px)')
    let last = window.scrollY
    let frame = 0
    const show = () => {
      const el = wrap.current
      if (!el) return
      el.removeAttribute('data-away')
      el.inert = false
    }
    const onScroll = () => {
      // Wider screens keep it in place; nothing to do per scroll.
      if (!narrow.matches || frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY
        const el = wrap.current
        if (!el) return
        // Ignore tiny moves (momentum jitter) and keep it visible near the top.
        if (Math.abs(y - last) < 8) return
        const hide = y > last && y > 120
        el.toggleAttribute('data-away', hide)
        // A hidden control can't keep focus or take taps.
        el.inert = hide
        last = y
      })
    }
    const onWidth = () => {
      last = window.scrollY
      if (!narrow.matches) show()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    narrow.addEventListener('change', onWidth)
    return () => {
      window.removeEventListener('scroll', onScroll)
      narrow.removeEventListener('change', onWidth)
      cancelAnimationFrame(frame)
    }
  }, [])

  const label = dark ? 'Switch to light theme' : 'Switch to dark theme'
  return (
    <div
      ref={wrap}
      className="theme-toggle fixed right-[max(1.25rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 print:hidden [body:has(#admin-dock)_&]:hidden"
    >
      <RaisedButton
        type="button"
        variant="outline"
        size="icon-lg"
        onClick={flip}
        aria-label={label}
        title={label}
        className="rounded-full"
      >
        {dark ? <Sun /> : <Moon />}
      </RaisedButton>
    </div>
  )
}
