import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'

// WebGL only ever loads in the browser; PageHero renders this client-only.
const LightRays = lazy(() => import('#/components/bits/LightRays'))

/**
 * React Bits Light Rays falling from the top of the hero: sky blue on the
 * dark ground; on the pale one the shader's light mode inks them in blue.
 */
export function LightRaysBackground({ initialDark = true }: { initialDark?: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    <LightRays
      key={dark ? 'dark' : 'light'}
      raysOrigin="top-right"
      raysColor="#5fb2ee"
      lightMode={!dark}
      raysSpeed={0.6}
      lightSpread={0.9}
      rayLength={2.4}
      rayDensity={1.1}
      tilt={-12}
      glow={dark ? 0.6 : 0.9}
      haze={dark ? 0.3 : 0.45}
      intensity={dark ? 1 : 1.5}
      fadeDistance={1.1}
      followMouse
      mouseInfluence={0.08}
      cursorShadow={false}
      clickPulse
      intro
    />
  )
}
