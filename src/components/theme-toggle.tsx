import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Moon, Sun } from 'lucide-react'
import { setTheme } from '#/server/theme'
import type { Theme } from '#/server/theme'
import { Button } from '#/components/ui/button'

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
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
