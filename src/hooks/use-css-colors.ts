import { useMemo, useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
let observer: MutationObserver | null = null

function subscribe(listener: () => void) {
  if (!observer) {
    observer = new MutationObserver(() => {
      for (const notify of listeners) notify()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const SEPARATOR = '|'

/**
 * Colors from src/styles.css for code that can't use `var()`: canvas and WebGL
 * components parse the string themselves, so they need the real value.
 *
 * `useCssColors('--brand-sky', '--art-line')` returns those values in order and
 * re-renders when the theme class flips. During SSR and hydration each one is
 * `var(--token)`, which still works in markup and matches the server's HTML;
 * the real values arrive straight after. DOM styles don't need this hook: pass
 * `var(--token)` directly.
 */
export function useCssColors(...tokens: string[]): string[] {
  const key = tokens.join(SEPARATOR)
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const computed = getComputedStyle(document.documentElement)
      return tokens
        .map((token) => computed.getPropertyValue(token).trim() || `var(${token})`)
        .join(SEPARATOR)
    },
    () => tokens.map((token) => `var(${token})`).join(SEPARATOR),
  )
  return useMemo(() => snapshot.split(SEPARATOR), [snapshot, key])
}
