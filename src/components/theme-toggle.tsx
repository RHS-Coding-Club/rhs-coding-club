import { useServerFn } from '@tanstack/react-start'
import { Moon } from '#/components/icons/moon'
import { Sun } from '#/components/icons/sun'
import { setTheme } from '#/server/theme'
import { RaisedButton } from '#/components/raised-button'
import { useIsDark } from '#/hooks/use-is-dark'
import type { Theme } from '#/server/theme'
import { STATIC_GROUND } from '#/lib/static-palette'

/**
 * Returns a function that flips the theme: swaps the <html> class right away
 * and persists the choice in a cookie via a server function.
 */
export function useFlipTheme() {
  const persist = useServerFn(setTheme)
  return () => {
    const root = document.documentElement
    const next: Theme = root.classList.contains('dark') ? 'light' : 'dark'
    root.classList.toggle('dark', next === 'dark')
    root.classList.toggle('light', next === 'light')
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', STATIC_GROUND[next])
    void persist({ data: next })
    return next
  }
}

/**
 * Floating theme switch, bottom-right on every page. Admin pages hide it;
 * their dock has its own switch.
 */
export function ThemeToggle({ initial }: { initial: Theme }) {
  // Follows the <html> class, so it stays right when the admin dock flips it.
  const dark = useIsDark(initial === 'dark')
  const flip = useFlipTheme()

  const label = dark ? 'Switch to light theme' : 'Switch to dark theme'
  return (
    <RaisedButton
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={flip}
      aria-label={label}
      title={label}
      className="fixed right-[max(1.25rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 rounded-full print:hidden [body:has(#admin-dock)_&]:hidden"
    >
      {dark ? <Sun /> : <Moon />}
    </RaisedButton>
  )
}
