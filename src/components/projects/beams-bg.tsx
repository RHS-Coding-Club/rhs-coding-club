import { lazy } from 'react'
import { useReducedMotion } from 'motion/react'
import { useIsDark } from '#/hooks/use-is-dark'

// WebGL only ever loads in the browser (PageHero renders backgrounds client-only).
const Beams = lazy(() => import('#/components/bits/Beams'))

/**
 * The projects hero: React Bits Beams, sky light raking across the card.
 * Light mode draws navy-tinted beams on the pale ground instead of glowing
 * ones on dark; reduced motion freezes them.
 */
export function BeamsBackground({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  const reduced = useReducedMotion()

  return (
    <div className="absolute inset-0">
      <Beams
        key={dark ? 'dark' : 'light'}
        color={dark ? '#5fb2ee' : '#3f86c9'}
        lightMode={!dark}
        beamWidth={dark ? 120 : 110}
        rotation={28}
        speed={0.6}
        brightness={dark ? 1.5 : 1.9}
        glow={dark ? 0.7 : 0.45}
        grain={dark ? 0.35 : 0.2}
        fillLight={0.35}
        fade={0.15}
        mouseStrength={0.6}
        paused={Boolean(reduced)}
        intro={!reduced}
      />
    </div>
  )
}
