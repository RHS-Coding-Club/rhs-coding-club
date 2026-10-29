import { lazy, useState } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'

// WebGPU (vgpu) only loads in the browser; PageHero renders the background
// client-only, inside Suspense.
const AeroShards = lazy(() => import('#/components/bits/AeroShards'))

/**
 * /blog hero: React Bits Aero Shards, ribbons of glass shards streaming
 * across the right of the card like pages being shuffled. Sky shards with a
 * navy edge in dark mode, navy on paper in light mode. AeroShards needs
 * WebGPU; where it isn't available (older Safari, Firefox without the flag)
 * the card falls back to a soft sky glow instead of an empty panel.
 */
export function AeroShardsBackground({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(55%_75%_at_85%_40%,rgba(95,178,238,0.35)_0%,transparent_70%)] dark:bg-[radial-gradient(55%_75%_at_85%_40%,rgba(31,79,138,0.6)_0%,transparent_70%)]" />
    )
  }

  return (
    <AeroShards
      key={dark ? 'dark' : 'light'}
      shardColor={dark ? '#5fb2ee' : '#1f4f8a'}
      accentColor={dark ? '#a9d4f5' : '#2a7fc4'}
      backgroundColor={dark ? '#120f17' : '#f3f6fb'}
      lightMode={!dark}
      placement="right"
      count={1100}
      glow={dark ? 0.4 : 0.15}
      grain={0.04}
      vignette={dark ? 0.3 : 0.1}
      markers="plus"
      parallax={0.4}
      onError={() => setFailed(true)}
    />
  )
}
