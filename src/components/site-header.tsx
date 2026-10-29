import { forwardRef, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, ShieldCheck, UserCog } from 'lucide-react'
import CardNav from '#/components/bits/CardNav'
import TechText from '#/components/bits/TechText'
import type { CardNavItem } from '#/components/bits/CardNav'
import { signOut } from '#/lib/auth-client'
import type { SessionUser } from '#/server/auth'
import { hasRole } from '#/lib/roles'
import { initials } from '#/lib/format'
import { avatarUrl } from '#/lib/files'
import { Logo } from '#/components/logo'
import { RaisedButton } from '#/components/raised-button'
import { useIsDark } from '#/hooks/use-is-dark'
import type { Theme } from '#/server/theme'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

/**
 * Three cards, one per area of the site. Compete and Community are tinted in
 * the two brand blues; Club sits on the neutral tile.
 */
const ITEMS: CardNavItem[] = [
  {
    label: 'Compete',
    description: 'A new problem every week and a board that keeps score.',
    bgColor: '#1f4f8a',
    textColor: '#e6edf5',
    links: [
      { label: 'Challenges', href: '/challenges' },
      { label: 'Leaderboard', href: '/leaderboard' },
    ],
  },
  {
    label: 'Community',
    description: 'Meetings, hackathons, and what members have shipped.',
    bgColor: '#5fb2ee',
    textColor: '#0b0f15',
    links: [
      { label: 'Events', href: '/events' },
      { label: 'Projects', href: '/projects' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    label: 'Club',
    description: 'Who runs it, how to join, and where to start learning.',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Resources', href: '/resources' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

/** Guests also get "Sign in" in the menu, since the bar hides it on phones. */
const GUEST_ITEMS: CardNavItem[] = ITEMS.map((item) =>
  item.label === 'Club'
    ? { ...item, links: [...(item.links ?? []), { label: 'Sign in', href: '/login' }] }
    : item,
)

/** CardNav's palette mapped onto the site tokens, so both themes follow styles.css. */
const NAV_VARS = {
  '--cn-panel': 'var(--bits-glass)',
  '--cn-solid': 'var(--card)',
  '--cn-edge': 'var(--bits-edge)',
  '--cn-highlight': 'var(--bits-highlight)',
  '--cn-shadow': 'var(--bits-shadow)',
  '--cn-text': 'var(--foreground)',
  '--cn-muted': 'var(--muted-foreground)',
  '--cn-hover': 'color-mix(in oklab, var(--foreground) 7%, transparent)',
  '--cn-ring': 'var(--ring)',
  '--cn-tile': 'var(--bits-tile)',
  '--cn-tile-rim': 'var(--bits-tile-rim)',
  '--cn-max': '920px',
} as CSSProperties

/** CardNav renders `<LinkComponent href>`; route those through the router. */
const RouterLink = forwardRef<
  HTMLAnchorElement,
  { href: string } & Omit<React.ComponentProps<'a'>, 'href' | 'ref'>
>(({ href, ...rest }, ref) => <Link ref={ref} to={href} {...rest} />)
RouterLink.displayName = 'RouterLink'

/**
 * React Bits Card Nav, floating at the top of every page: menu toggle left,
 * club mark center, account actions right. The bar opens into three cards.
 */
export function SiteHeader({ user, theme }: { user: SessionUser | null; theme: Theme }) {
  const dark = useIsDark(theme === 'dark')
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 px-3 sm:top-4">
      <div className="pointer-events-auto">
        <CardNav
          items={user ? ITEMS : GUEST_ITEMS}
          logo={<NavMark dark={dark} />}
          logoAlt="RHS Coding Club home"
          logoHref="/"
          linkComponent={RouterLink}
          actions={user ? <AccountMenu user={user} /> : <GuestActions />}
          cardEffect="rise"
          cardHeight={196}
          bounce={0.25}
          style={NAV_VARS}
          className="[--cn-bar:68px]! [--cn-logo:68px]! sm:[--cn-bar:84px]! sm:[--cn-logo:84px]!"
        />
      </div>
    </header>
  )
}

/**
 * Club mark plus the name in React Bits Tech Text, on its "Vector" preset:
 * under the cursor each letter becomes dashed vector outlines with its
 * bounding box and measurements, and letters can be kicked or dragged. The
 * canvas fills the bar's full height and is wider than the word, and the
 * type is capped well below the box, so the measurement label above a
 * letter and the corner handles around it have room and never clip. White
 * on the dark bar, the site's ink on the light one.
 */
function NavMark({ dark }: { dark: boolean }) {
  const ink = dark ? '#ffffff' : '#101826'
  const wide = useMediaQuery('(min-width: 640px)')
  const press = useRef<{ x: number; y: number } | null>(null)

  return (
    <span
      className="flex h-full items-center gap-2"
      onPointerDown={(e) => {
        press.current = { x: e.clientX, y: e.clientY }
      }}
      // Dragging a letter ends in a click on the home link; only a real
      // click (no drag) should navigate.
      onClickCapture={(e) => {
        const start = press.current
        if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 4) {
          e.preventDefault()
        }
      }}
    >
      <Logo className="size-7! sm:size-8!" />
      <span className="sr-only min-[420px]:hidden">RHS Coding Club</span>
      <span
        aria-hidden="true"
        className="hidden h-full w-[160px] min-[420px]:block sm:w-[300px]"
      >
        <TechText
          text="RHS Coding Club"
          color={ink}
          accentColor={ink}
          intro="none"
          introDuration={2}
          reveal="letter"
          reach={200}
          softness={0.7}
          speed={1}
          bounce={0.4}
          align="center"
          fontWeight={600}
          fontSize={wide ? 28 : 17}
          letterSpacing={-0.05}
          lineStyle="dashed"
          dashLength={4}
          dashGap={2}
          strokeWidth={1.5}
          specks={15}
          clickKick
          draggable
          sweep
          selection
          labels
          guides={false}
        />
      </span>
    </span>
  )
}

function useMediaQuery(query: string) {
  const [match, setMatch] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const read = () => setMatch(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [query])
  return match
}

function GuestActions() {
  return (
    <>
      <RaisedButton asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
        <Link to="/login">Sign in</Link>
      </RaisedButton>
      <RaisedButton asChild className="h-10 px-5 sm:px-7">
        <Link to="/signup">Join</Link>
      </RaisedButton>
    </>
  )
}

function AccountMenu({ user }: { user: SessionUser }) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-visible:ring-ring mr-1 rounded-full outline-none focus-visible:ring-2"
          aria-label="Account menu"
        >
          <Avatar className="size-9">
            <AvatarImage src={avatarUrl(user)} alt="" />
            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={14} className="w-56 rounded-2xl">
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
        <DropdownMenuItem asChild>
          <Link to="/account">
            <UserCog className="size-4" />
            Account settings
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
  )
}
