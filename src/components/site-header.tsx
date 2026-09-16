import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, Menu, ShieldCheck } from 'lucide-react'
import { signOut } from '#/lib/auth-client'
import type { SessionUser } from '#/server/auth'
import type { Theme } from '#/server/theme'
import { hasRole } from '#/lib/roles'
import { initials } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Logo } from '#/components/logo'
import { ThemeToggle } from '#/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '#/components/ui/sheet'

const NAV = [
  { to: '/challenges', label: 'Challenges' },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/blog', label: 'Blog' },
  { to: '/resources', label: 'Resources' },
  { to: '/about', label: 'About' },
] as const

export function SiteHeader({ user, theme }: { user: SessionUser | null; theme: Theme }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <header className="border-border/60 bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-(--gutter) lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link
          to="/"
          className="flex items-center gap-2.5 justify-self-start"
          aria-label="RHS Coding Club home"
        >
          <Logo className="size-8" />
          <span className="font-display text-xl leading-none font-semibold tracking-tight">
            RHS Coding Club
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors xl:px-3 xl:text-sm"
              activeProps={{ className: 'text-foreground' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:justify-self-end">
          <ThemeToggle initial={theme} />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2"
                  aria-label="Account menu"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.image ?? undefined} alt="" />
                    <AvatarFallback className="text-xs">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="truncate">{user.name}</span>
                  <span className="text-muted-foreground truncate font-mono text-xs font-normal">
                    {user.role}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {hasRole(user.role, 'officer') && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <ShieldCheck className="size-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden rounded-full sm:inline-flex"
              >
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full px-4 transition-transform active:scale-[0.98]"
              >
                <Link to="/signup">Join</Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display px-4 pt-4 text-2xl">Menu</SheetTitle>
              <nav className="mt-4 flex flex-col px-2" aria-label="Mobile">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground rounded-md px-2 py-2.5 text-base"
                    activeProps={{ className: 'text-foreground' }}
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground rounded-md px-2 py-2.5 text-base"
                  >
                    Sign in
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
