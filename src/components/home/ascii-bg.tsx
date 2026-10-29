import { Suspense, lazy } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { cn } from '#/lib/utils'

// WebGL2 and the glyph atlas only ever load in the browser.
const GradientASCII = lazy(() => import('#/components/bits/GradientASCII'))

/** The deep navy the ASCII glows are drawn over, in both themes. */
export const ASCII_GROUND = '#0c1f3d'

/**
 * Hero backdrop: React Bits Gradient ASCII in the club's navy/sky palette on
 * a deep navy ground. Renders a plain CSS gradient on the server and while
 * the WebGL chunk loads, so the fold always has color. The component itself
 * freezes its animation when the visitor prefers reduced motion.
 */
export function AsciiBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0', className)}
      style={{ backgroundColor: ASCII_GROUND }}
    >
      <ClientOnly fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <GradientASCII
            colors={['#1f4f8a', '#5fb2ee', '#a9d4f5', '#e6edf5']}
            shape="horizon"
            cellSize={16}
            density={0.8}
            glyphOpacity={0.85}
            glow={0.25}
            flicker={0.2}
            softness={0.5}
            flow={0.5}
            speed={0.8}
            gradientOpacity={0.85}
            grain={0.06}
            scrambleRadius={0.1}
            clickEffect="wave"
            fontFamily="'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace"
          />
        </Suspense>
      </ClientOnly>
    </div>
  )
}

function Fallback() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_100%,#5fb2ee_0%,#1f4f8a_45%,transparent_75%)]" />
  )
}
