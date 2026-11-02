import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'

// WebGL2 only ever loads in the browser (PageHero renders backgrounds client-only).
const DotGrid = lazy(() => import('#/components/bits/DotGrid'))

/**
 * Hero backdrop for the challenge pages: React Bits Dot Grid, a field of
 * dots that swell toward the cursor and ripple on click, like a grid of test
 * cases lighting up. Dark mode uses dim slate dots on the #121924
 * stage that light sky blue; light mode uses pale slate dots on #f3f6fb that
 * light navy, so the field never reads as a dark slab in light theme.
 */
export function DotGridBackground({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    <DotGrid
      dotSize={4}
      gap={22}
      baseColor={dark ? '#34435a' : '#b8c7da'}
      activeColor={dark ? '#5fb2ee' : '#1f4f8a'}
      proximity={150}
      swell={0.9}
      glow={dark ? 0.6 : 0.2}
      shockRadius={260}
      shockStrength={4}
      fade={0.25}
    />
  )
}
