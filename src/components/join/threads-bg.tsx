import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'

const Threads = lazy(() => import('#/components/bits/Threads'))

/** React Bits Threads: a loose bundle of lines that parts around the cursor. */
export function ThreadsBackground({ initialDark = true }: { initialDark?: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    <Threads
      key={dark ? 'dark' : 'light'}
      color={dark ? '#5fb2ee' : '#1f4f8a'}
      accentColor={dark ? '#a9d4f5' : '#5fb2ee'}
      amplitude={1}
      distance={0.2}
      lineCount={28}
      enableMouseInteraction
      opacity={dark ? 0.9 : 0.75}
    />
  )
}
