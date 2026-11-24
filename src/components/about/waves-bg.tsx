import { lazy } from 'react'
import { useCssColors } from '#/hooks/use-css-colors'
import { useIsDark } from '#/hooks/use-is-dark'

const Waves = lazy(() => import('#/components/bits/Waves'))

/** React Bits Waves: a field of lines that bends away from the cursor. */
export function WavesBackground({ initialDark = true }: { initialDark?: boolean }) {
  const dark = useIsDark(initialDark)
  const [line, accent] = useCssColors('--art-line', '--art-accent')
  return (
    <Waves
      key={dark ? 'dark' : 'light'}
      lineColor={line}
      accentColor={accent}
      lightMode={!dark}
      spacing={16}
      amplitude={26}
      rotation={-12}
      speed={0.6}
      fade={0.35}
      opacity={dark ? 0.55 : 0.45}
      clickRipple={false}
      dpr={1}
    />
  )
}
