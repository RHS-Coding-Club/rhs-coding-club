import { Suspense, lazy } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import { useIsDark } from '#/hooks/use-is-dark'
import { useCssColors } from '#/hooks/use-css-colors'

// WebGL2 and the glyph atlas only ever load in the browser.
const GradientASCII = lazy(() => import('#/components/bits/GradientASCII'))

/**
 * Ground under the glyphs: the site's dark surface in dark mode, a pale
 * blue-white in light mode (where the shader draws the glyphs as ink).
 */
const GROUND = 'bg-stage'

/**
 * Hero backdrop: React Bits Gradient ASCII in the club's blues (`--art-ramp-*`
 * in src/styles.css). Dark mode glows on the site's stage color; light mode
 * switches the shader to `lightMode` on a pale ground. Renders a plain CSS
 * gradient on the server and while the WebGL chunk loads, so the fold always
 * has color. The component itself freezes its animation when the visitor
 * prefers reduced motion.
 */
export function AsciiBackground({ className }: { className?: string }) {
  const dark = useIsDark()
  const colors = useCssColors(
    '--art-ramp-1',
    '--art-ramp-2',
    '--art-ramp-3',
    '--art-ramp-4',
  )
  return (
    <div aria-hidden="true" className={cn('absolute inset-0', GROUND, className)}>
      <ClientOnly fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <GradientASCII
            colors={colors}
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
    <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_100%,var(--art-ramp-3)_0%,var(--art-ramp-1)_45%,transparent_75%)]" />
  )
}
