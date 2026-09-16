import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { EASE } from '#/components/motion'
import { Link, useRouter } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { ChevronDown, LayoutDashboard, LogOut, Menu, ShieldCheck } from 'lucide-react'
import { signOut } from '#/lib/auth-client'
import type { SessionUser } from '#/server/auth'
import { hasRole } from '#/lib/roles'
import { initials } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Logo } from '#/components/logo'
import { SplitButton } from '#/components/split-button'
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

type NavLink = { to: LinkProps['to']; label: string; hint?: string }
type NavGroup = { label: string; items: NavLink[] }
type NavEntry = NavLink | NavGroup

const NAV: NavEntry[] = [
  {
    label: 'Compete',
    items: [
      { to: '/challenges', label: 'Challenges', hint: 'A new problem every week' },
      { to: '/leaderboard', label: 'Leaderboard', hint: 'Semester points, live' },
      { to: '/hall-of-fame', label: 'Hall of Fame', hint: 'Badges and past winners' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/events', label: 'Events', hint: 'Meetings, hackathons, service' },
      { to: '/projects', label: 'Projects', hint: 'What members have shipped' },
      { to: '/blog', label: 'Blog', hint: 'Recaps and announcements' },
    ],
  },
  { to: '/resources', label: 'Resources' },
  { to: '/about', label: 'About' },
]

const isGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry

const NAV_ITEM =
  'text-foreground/80 hover:text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2'

/**
 * Floating pill navbar, fixed to the top of every page. Mirrors the template:
 * logo left, dropdown nav center, "Sign in" + split "Join" button right.
 * Signed-in visitors get their avatar menu instead of the auth buttons.
 */
export function SiteHeader({ user }: { user: SessionUser | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <FloatingBar>
      <div className="flex h-16 items-center gap-3 pr-3 pl-5 min-[850px]:grid min-[850px]:grid-cols-[1fr_auto_1fr] min-[850px]:pr-4 min-[850px]:pl-6">
        <Link
          to="/"
          className="focus-visible:ring-ring flex items-center gap-2.5 justify-self-start rounded-full outline-none focus-visible:ring-2"
          aria-label="RHS Coding Club home"
        >
          <Logo className="size-8" />
          <span className="text-[17px] leading-none font-semibold tracking-tight">
            RHS Coding Club
          </span>
        </Link>

        <nav className="hidden items-center gap-1 min-[850px]:flex" aria-label="Primary">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <DropdownMenu key={entry.label} modal={false}>
                <DropdownMenuTrigger className={`${NAV_ITEM} data-[state=open]:bg-muted`}>
                  {entry.label}
                  <ChevronDown className="size-3.5 opacity-70" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={10}
                  className="w-64 rounded-2xl p-1.5 shadow-xl"
                >
                  {entry.items.map((item) => (
                    <DropdownMenuItem
                      key={item.to}
                      asChild
                      className="rounded-xl px-3 py-2.5"
                    >
                      <Link to={item.to} className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.hint && (
                          <span className="text-muted-foreground text-xs">
                            {item.hint}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={entry.to}
                to={entry.to}
                className={NAV_ITEM}
                activeProps={{ className: 'text-foreground' }}
              >
                {entry.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 min-[850px]:justify-self-end">
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2"
                  aria-label="Account menu"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={user.image ?? undefined} alt="" />
                    <AvatarFallback className="text-xs">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-56 rounded-2xl"
              >
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
              <Link
                to="/login"
                className="text-foreground/80 hover:text-foreground focus-visible:ring-ring hidden h-10 items-center rounded-full px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 sm:inline-flex"
              >
                Sign in
              </Link>
              <SplitButton to="/signup">Join</SplitButton>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full min-[850px]:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="px-5 pt-5 text-2xl font-semibold tracking-tight">
                Menu
              </SheetTitle>
              <nav className="mt-2 flex flex-col px-3" aria-label="Mobile">
                {NAV.map((entry) =>
                  isGroup(entry) ? (
                    <div key={entry.label} className="mt-3">
                      <p className="text-muted-foreground px-2 font-mono text-[11px] tracking-[0.14em] uppercase">
                        {entry.label}
                      </p>
                      {entry.items.map((item) => (
                        <MobileLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </MobileLink>
                      ))}
                    </div>
                  ) : (
                    <MobileLink
                      key={entry.to}
                      to={entry.to}
                      onClick={() => setOpen(false)}
                    >
                      {entry.label}
                    </MobileLink>
                  ),
                )}
                {!user && (
                  <div className="mt-3">
                    <MobileLink to="/login" onClick={() => setOpen(false)}>
                      Sign in
                    </MobileLink>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </FloatingBar>
  )
}

/**
 * The notch. At the top of the page it sits 10px down, flush with the hero
 * card's top edge; as soon as the page scrolls it slides up and sticks to
 * the viewport edge. Slides in from above on first paint.
 */
function FloatingBar({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const [stuck, setStuck] = useState(false)
  const [narrow, setNarrow] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => setStuck(y > 8))
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 849px)')
    const read = () => setNarrow(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])

  const top = stuck || narrow ? 0 : 10
  return (
    <motion.header
      initial={reduced ? false : { y: -96, opacity: 0 }}
      animate={{ y: 0, opacity: 1, top }}
      transition={{
        y: { duration: 0.8, ease: EASE, delay: 0.1 },
        opacity: { duration: 0.6, delay: 0.1 },
        top: { duration: 0.35, ease: EASE },
      }}
      style={{ top }}
      className="bg-card text-card-foreground fixed left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 rounded-b-4xl shadow-2xl shadow-black/20"
    >
      {children}
    </motion.header>
  )
}

function MobileLink({
  to,
  onClick,
  children,
}: {
  to: LinkProps['to']
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-foreground/80 hover:text-foreground hover:bg-muted block rounded-xl px-2 py-2.5 text-base"
      activeProps={{ className: 'text-foreground' }}
    >
      {children}
    </Link>
  )
}
