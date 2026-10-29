import { Suspense, lazy } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import { useIsDark } from '#/hooks/use-is-dark'

// WebGL2 and the glyph atlas only ever load in the browser.
const GradientASCII = lazy(() => import('#/components/bits/GradientASCII'))

/**
 * Ground under the glyphs: React Bits' demo stage color in dark mode, a pale
 * blue-white in light mode (where the shader draws the glyphs as ink).
 */
const GROUND = 'bg-[#f3f6fb] dark:bg-[#120f17]'

/** The component's default palette, as shown in the React Bits demo. */
const ASCII_COLORS = ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']

/**
 * Hero backdrop: React Bits Gradient ASCII in the colors of its demo on
 * reactbits.dev. Dark mode glows on the demo's #120f17 stage; light mode
 * switches the shader to `lightMode` on a pale ground. Renders a plain CSS
 * gradient on the server and while the WebGL chunk loads, so the fold always
 * has color. The component itself freezes its animation when the visitor
 * prefers reduced motion.
 */
export function AsciiBackground({ className }: { className?: string }) {
  const dark = useIsDark()
  return (
    <div aria-hidden="true" className={cn('absolute inset-0', GROUND, className)}>
      <ClientOnly fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <GradientASCII
            colors={ASCII_COLORS}
            lightMode={!dark}
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
    <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_100%,#a5d8ff_0%,#d7e8fb_45%,transparent_75%)] dark:bg-[radial-gradient(80%_55%_at_50%_100%,#38bdf8_0%,#1e3fd8_45%,transparent_75%)]" />
  )
}
