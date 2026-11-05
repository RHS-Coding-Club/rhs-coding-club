import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'
import { useCssColors } from '#/hooks/use-css-colors'

const Threads = lazy(() => import('#/components/bits/Threads'))

/** React Bits Threads: a loose bundle of lines that parts around the cursor. */
export function ThreadsBackground({ initialDark = true }: { initialDark?: boolean }) {
  const dark = useIsDark(initialDark)
  const [line, accent] = useCssColors('--art-line', '--art-accent')
  return (
    <Threads
      key={dark ? 'dark' : 'light'}
      color={line}
      accentColor={accent}
      amplitude={1}
      distance={0.2}
      lineCount={28}
      enableMouseInteraction
      opacity={dark ? 0.9 : 0.75}
    />
  )
}
