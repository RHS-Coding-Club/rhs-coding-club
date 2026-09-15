import { Link, useRouter } from '@tanstack/react-router'
import { signOut } from '#/lib/auth-client'
import type { SessionUser } from '#/server/auth'
import { hasRole } from '#/lib/roles'
import { Button } from '#/components/ui/button'
import { Logo } from '#/components/logo'

const NAV = [
  { to: '/challenges', label: 'Challenges' },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/resources', label: 'Resources' },
] as const

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <header className="border-border/60 sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="RHS Coding Club home"
        >
          <Logo className="size-7" />
          <span className="font-display text-xl leading-none">RHS Coding Club</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
              activeProps={{ className: 'text-foreground' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              {hasRole(user.role, 'officer') && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Join</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
