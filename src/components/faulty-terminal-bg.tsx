import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'
import { useCssColors } from '#/hooks/use-css-colors'

// WebGL only ever loads in the browser (rendered inside ClientOnly).
const FaultyTerminal = lazy(() => import('#/components/bits/FaultyTerminal'))

/**
 * React Bits Faulty Terminal behind the 404 page: a dim sky CRT of block glyphs
 * that flickers and glitches like a lost signal, navy on pale in light mode.
 * It pauses itself offscreen and for visitors who prefer reduced motion.
 */
export function FaultyBackground() {
  // Client-only, so <html> already carries the theme on the first render.
  const dark = useIsDark(document.documentElement.classList.contains('dark'))
  const [accent, line] = useCssColors('--art-accent', '--art-line')
  return (
    <FaultyTerminal
      key={dark ? 'dark' : 'light'}
      tint={dark ? accent : line}
      lightMode={!dark}
      scale={1.4}
      gridMul={[2, 1]}
      digitSize={1.3}
      timeScale={0.35}
      scanlineIntensity={0.35}
      glitchAmount={0.8}
      flickerAmount={0.6}
      noiseAmp={0.8}
      curvature={0.12}
      mouseReact
      mouseStrength={0.25}
      brightness={dark ? 0.55 : 0.45}
      glow={0.4}
      vignette={0.5}
      clickEffect="glitch"
    />
  )
}
