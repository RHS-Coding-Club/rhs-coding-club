import { useEffect, useState } from 'react'

/**
 * Tracks the <html> "dark" class so canvas and inline-styled components can
 * recolor when the theme toggle flips. `initial` is the server-rendered
 * theme, so the first client render matches the HTML.
 */
export function useIsDark(initial = true) {
  const [dark, setDark] = useState(initial)
  useEffect(() => {
    const root = document.documentElement
    const read = () => setDark(root.classList.contains('dark'))
    read()
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])
  return dark
}
