import { lazy } from 'react'
import { useReducedMotion } from 'motion/react'
import { useIsDark } from '#/hooks/use-is-dark'
import { useCssColors } from '#/hooks/use-css-colors'

// ogl and the shader only ever load in the browser (PageHero renders the
// background client-only, inside Suspense).
const Grainient = lazy(() => import('#/components/bits/Grainient'))

/**
 * /resources hero: React Bits Grainient as a slow, grainy wash that settles
 * into the page ground on the left (where the copy sits). Dark mode melts
 * from the stage color into navy and sky; light mode runs the shader's
 * light mode on pale blues so the title stays ink on paper.
 */
export function ResourcesHeroBackground({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  const reduced = useReducedMotion()
  const [stage, wash, sky] = useCssColors('--stage', '--art-wash', '--brand-sky')
  return (
    <Grainient
      key={dark ? 'dark' : 'light'}
      color1={stage}
      color2={wash}
      color3={sky}
      lightMode={!dark}
      timeSpeed={reduced ? 0 : 0.12}
      colorBalance={dark ? -0.15 : 0}
      warpStrength={1}
      warpFrequency={3.2}
      warpSpeed={1.1}
      warpAmplitude={70}
      blendAngle={-20}
      blendSoftness={0.12}
      noiseScale={1.8}
      grainAmount={dark ? 0.1 : 0.06}
      grainScale={2}
      contrast={dark ? 1.25 : 1.05}
      saturation={dark ? 1.05 : 0.95}
      centerX={0.25}
      centerY={-0.1}
      zoom={0.85}
    />
  )
}
