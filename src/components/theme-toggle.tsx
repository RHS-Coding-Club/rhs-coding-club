import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Moon, Sun } from 'lucide-react'
import { setTheme } from '#/server/theme'
import { RaisedButton } from '#/components/raised-button'
import type { Theme } from '#/server/theme'

/**
 * Floating theme switch, bottom-right on every page. Flips the <html> class
 * immediately and persists the choice in a cookie via a server function.
 */
export function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setLocal] = useState<Theme>(initial)
  const persist = useServerFn(setTheme)

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setLocal(next)
    const root = document.documentElement
    root.classList.toggle('dark', next === 'dark')
    root.classList.toggle('light', next === 'light')
    void persist({ data: next })
  }

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  return (
    <RaisedButton
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="fixed right-5 bottom-5 z-50 rounded-full"
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </RaisedButton>
  )
}
