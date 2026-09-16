import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'

/**
 * Lenis smooth scrolling, the same inertia the template uses. Wheel input is
 * eased; keyboard, touch, and programmatic scrolls stay native. Off entirely
 * for visitors who prefer reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>
  return (
    <ReactLenis root options={{ duration: 1.6, smoothWheel: true, lerp: 0.1 }}>
      {children}
    </ReactLenis>
  )
}
