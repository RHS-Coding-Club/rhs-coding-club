import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { ReactLenis, useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'

/**
 * Lenis smooth scrolling, the same inertia the template uses. Wheel input is
 * eased; keyboard, touch, and programmatic scrolls stay native. Nested
 * scroll areas (the challenge archive, dialogs, menus) scroll themselves
 * instead of the page. Off entirely for visitors who prefer reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>
  return (
    <ReactLenis
      root
      options={{
        duration: 1.6,
        smoothWheel: true,
        lerp: 0.1,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <NavigationGuard />
      {children}
    </ReactLenis>
  )
}

/**
 * Trackpad momentum arrives as a wheel event every frame. Once the new page
 * has rendered, input is let through after this long without one: the
 * leftover glide has ended, and a fresh scroll works normally.
 */
const QUIET_MS = 150
/** Never block the wheel longer than this, even if a navigation stalls. */
const MAX_PAUSE_MS = 4000

/**
 * Without this, a trackpad flick toward a footer link keeps gliding after the
 * click: Lenis carries the momentum (and its own scroll target) into the new
 * page, so it opens at the bottom. When a navigation to another page starts,
 * Lenis's glide is cancelled and wheel input is swallowed until the new page
 * has rendered and the momentum has died out; then Lenis resyncs to wherever
 * the router put the scroll (the top for a new page, the old spot on Back).
 * Same-page changes (filters, anchors) are left alone.
 *
 * `stop()` then `start()` is Lenis's public way to drop its animation and
 * target; doing both at once never leaves the page in the stopped state,
 * whose `overflow: clip` would block the router's own scroll reset.
 */
function NavigationGuard() {
  const lenis = useLenis()
  const router = useRouter()

  useEffect(() => {
    if (!lenis) return
    const resync = () => {
      lenis.stop()
      lenis.start()
    }
    let quiet = 0
    let safety = 0
    let blocking = false
    let rendered = false

    const release = () => {
      window.clearTimeout(quiet)
      window.clearTimeout(safety)
      if (!blocking) return
      blocking = false
      window.removeEventListener('wheel', swallow, { capture: true })
      resync()
    }
    const waitForQuiet = () => {
      window.clearTimeout(quiet)
      quiet = window.setTimeout(release, QUIET_MS)
    }
    // Runs before Lenis's own listener, so neither it nor the browser scrolls.
    function swallow(e: WheelEvent) {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (rendered) waitForQuiet()
    }

    const offBefore = router.subscribe('onBeforeNavigate', (e) => {
      if (!e.pathChanged) return
      resync()
      rendered = false
      if (!blocking) {
        blocking = true
        window.addEventListener('wheel', swallow, { capture: true, passive: false })
      }
      window.clearTimeout(quiet)
      window.clearTimeout(safety)
      safety = window.setTimeout(release, MAX_PAUSE_MS)
    })
    const offRendered = router.subscribe('onRendered', () => {
      if (!blocking) return
      rendered = true
      waitForQuiet()
    })
    return () => {
      offBefore()
      offRendered()
      release()
    }
  }, [lenis, router])

  return null
}
