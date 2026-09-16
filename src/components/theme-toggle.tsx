import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Moon, Sun } from 'lucide-react'
import { setTheme } from '#/server/theme'
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
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="bg-card text-foreground border-border/60 shadow-black/20 hover:bg-muted focus-visible:ring-ring fixed right-5 bottom-5 z-50 inline-flex size-11 items-center justify-center rounded-full border shadow-lg transition-[background-color,transform] outline-none focus-visible:ring-2 active:scale-[0.96]"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
