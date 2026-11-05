import { lazy, useState } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'
import { useCssColors } from '#/hooks/use-css-colors'

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
  const [line, accent, stage] = useCssColors('--art-line', '--art-accent', '--stage')

  if (failed) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(55%_75%_at_85%_40%,color-mix(in_srgb,var(--brand-sky)_35%,transparent)_0%,transparent_70%)] dark:bg-[radial-gradient(55%_75%_at_85%_40%,color-mix(in_srgb,var(--brand-navy)_60%,transparent)_0%,transparent_70%)]" />
    )
  }

  return (
    <AeroShards
      key={dark ? 'dark' : 'light'}
      shardColor={line}
      accentColor={accent}
      backgroundColor={stage}
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
