import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'

// WebGL2 only ever loads in the browser (PageHero renders backgrounds client-only).
const Threads = lazy(() => import('#/components/bits/Threads'))

/**
 * React Bits Threads for the events pages: sky and frost strands glowing on
 * the dark ground, navy and sky ink on the pale light ground. The strands sit
 * to the right so the scrim keeps the title side readable. Threads freezes
 * itself for visitors who prefer reduced motion.
 */
export function ThreadsBackground({
  initialDark,
  seed = 0,
  angle = 18,
  intensity = 1,
}: {
  initialDark: boolean
  seed?: number
  angle?: number
  /** Scales line brightness and opacity; the projector view runs it quieter. */
  intensity?: number
}) {
  const dark = useIsDark(initialDark)
  return (
    // Quieter on phones, where the strands run behind the title and copy.
    <div className="h-full w-full opacity-50 sm:opacity-100">
      <Threads
        color={dark ? '#5fb2ee' : '#1f4f8a'}
        accentColor={dark ? '#e6edf5' : '#5fb2ee'}
        amplitude={1.5}
        distance={0.35}
        lineCount={dark ? 70 : 60}
        thickness={dark ? 0.6 : 0.8}
        softness={1.2}
        speed={0.45}
        waves={1}
        angle={angle}
        seed={seed}
        taper={0.85}
        brightness={(dark ? 1.3 : 1) * intensity}
        opacity={(dark ? 0.95 : 0.8) * intensity}
        fade={0.15}
      />
    </div>
  )
}
