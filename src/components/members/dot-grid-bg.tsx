import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'

const DotGrid = lazy(() => import('#/components/bits/DotGrid'))

/**
 * React Bits Dot Grid behind a profile: quiet dots that swell toward the
 * cursor in sky blue. Navy-on-pale in light mode.
 */
export function DotGridBackground({ initialDark = true }: { initialDark?: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    <DotGrid
      key={dark ? 'dark' : 'light'}
      dotSize={4}
      gap={22}
      baseColor={dark ? '#363c4d' : '#c3d1e3'}
      activeColor={dark ? '#5fb2ee' : '#1f4f8a'}
      proximity={150}
      shockRadius={260}
      shockStrength={4}
      glow={dark ? 0.6 : 0.2}
      fade={0.4}
    />
  )
}
