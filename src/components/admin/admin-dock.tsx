import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { Ellipsis, Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Dock from '#/components/bits/Dock'
import type { DockItemData } from '#/components/bits/Dock'
import { ADMIN_NAV, AdminNav } from '#/components/admin/admin-nav'
import type { AdminQueueKey } from '#/components/admin/admin-nav'
import { useFlipTheme } from '#/components/theme-toggle'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'
import { useIsDark } from '#/hooks/use-is-dark'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'

type Counts = Record<AdminQueueKey, number>
type NavItem = (typeof ADMIN_NAV)[number]

/** Groups on the wide dock, split by separators. */
const GROUPS: NavItem['to'][][] = [
  ['/admin'],
  [
    '/admin/applications',
    '/admin/submissions',
    '/admin/projects',
    '/admin/github',
    '/admin/messages',
  ],
  [
    '/admin/challenges',
    '/admin/events',
    '/admin/blog',
    '/admin/resources',
    '/admin/badges',
    '/admin/newsletter',
  ],
  ['/admin/users', '/admin/officers', '/admin/settings', '/admin/reset'],
]

/** Phones get the busiest pages plus "More", which opens the full list. */
const COMPACT: NavItem['to'][] = [
  '/admin',
  '/admin/applications',
  '/admin/submissions',
  '/admin/events',
  '/admin/messages',
]

/**
 * Dock's own palette is a purple gray; these map it onto the site's glass
 * and tile tokens (the same surfaces as the header card), so it matches and
 * follows the theme class without a re-render.
 */
const DOCK_VARS = {
  '--dock-panel': 'var(--bits-glass)',
  '--dock-panel-edge': 'var(--bits-edge)',
  '--dock-panel-highlight': 'var(--bits-highlight)',
  '--dock-panel-shadow': 'var(--bits-shadow)',
  '--dock-tile': 'var(--bits-tile)',
  '--dock-tile-edge': 'var(--bits-edge)',
  '--dock-tile-highlight': 'var(--bits-highlight)',
  '--dock-ink': 'var(--foreground)',
  '--dock-label': 'var(--popover)',
  '--dock-label-ink': 'var(--popover-foreground)',
  '--dock-dot': '#5fb2ee',
  '--dock-separator': 'var(--border)',
} as CSSProperties

/** The current page's tile: the brand navy-to-sky, white icon. */
const ACTIVE_TILE =
  '[--dock-tile:linear-gradient(180deg,#2a7fc4_0%,#1f4f8a_100%)] [--dock-tile-edge:rgba(95,178,238,0.5)] [--dock-ink:#ffffff]'

const icon = (Icon: LucideIcon) => <Icon className="size-[45%]" strokeWidth={1.8} />

/**
 * The admin panel's navigation: React Bits Dock, pinned to the bottom of
 * the screen. Icons magnify under the cursor and name themselves on hover,
 * queues wear a count badge, and the current page gets the dot. Arrow keys
 * move along it. Wide screens show every page in four groups; phones show
 * five plus "More", which opens the full list in a sheet. The theme switch
 * lives here too (the floating one hides on admin pages).
 */
export function AdminDock({
  role,
  counts,
  initialDark,
}: {
  role: Role
  counts: Counts
  initialDark: boolean
}) {
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const dark = useIsDark(initialDark)
  const flipTheme = useFlipTheme()
  const [moreOpen, setMoreOpen] = useState(false)

  const allowed = ADMIN_NAV.filter(
    (item) => !('minRole' in item) || hasRole(role, item.minRole),
  )
  const isActive = (item: NavItem) =>
    'exact' in item
      ? pathname === item.to || pathname === `${item.to}/`
      : pathname === item.to || pathname.startsWith(`${item.to}/`)

  const toItem = (item: NavItem): DockItemData => {
    const n = 'queue' in item ? counts[item.queue] : 0
    return {
      label: n > 0 ? `${item.label} (${n} waiting)` : item.label,
      icon: icon(item.icon),
      active: isActive(item),
      className: isActive(item) ? ACTIVE_TILE : undefined,
      badge: n > 0 ? (n > 99 ? '99+' : n) : undefined,
      onClick: () => void router.navigate({ to: item.to }),
    }
  }
  const byPath = (to: NavItem['to']) => allowed.find((i) => i.to === to)

  const themeItem: DockItemData = {
    label: dark ? 'Light theme' : 'Dark theme',
    icon: icon(dark ? Sun : Moon),
    onClick: () => void flipTheme(),
  }

  const wide: DockItemData[] = GROUPS.flatMap((group, g) => {
    const items = group.flatMap((to) => {
      const item = byPath(to)
      return item ? [toItem(item)] : []
    })
    return g === 0 ? items : [{ separator: true }, ...items]
  }).concat([{ separator: true }, themeItem])

  const elsewhere = allowed
    .filter((i) => !COMPACT.includes(i.to))
    .reduce((n, i) => n + ('queue' in i ? counts[i.queue] : 0), 0)
  const compact: DockItemData[] = [
    ...COMPACT.flatMap((to) => {
      const item = byPath(to)
      return item ? [toItem(item)] : []
    }),
    {
      label: 'More admin pages',
      icon: icon(Ellipsis),
      active: !allowed.some((i) => COMPACT.includes(i.to) && isActive(i)),
      className: allowed.some((i) => COMPACT.includes(i.to) && isActive(i))
        ? undefined
        : ACTIVE_TILE,
      badge: elsewhere > 0 ? true : undefined,
      onClick: () => setMoreOpen(true),
    },
    { separator: true },
    themeItem,
  ]

  const shared = {
    theme: dark ? ('dark' as const) : ('light' as const),
    position: 'bottom' as const,
    accentColor: '#5fb2ee',
    badgeColor: '#e5484d',
    baseItemSize: 46,
    magnification: 66,
    panelHeight: 62,
    distance: 150,
    gap: 8,
    style: DOCK_VARS,
  }

  return (
    <>
      <nav
        id="admin-dock"
        aria-label="Admin pages"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-28"
      >
        <div className="pointer-events-auto hidden xl:contents">
          <Dock items={wide} {...shared} className="bottom-4!" />
        </div>
        <div className="pointer-events-auto contents xl:hidden">
          <Dock items={compact} {...shared} className="bottom-3!" />
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[80dvh] rounded-t-3xl p-4 pb-8">
          <SheetTitle className="px-2.5 pt-1 pb-3 text-base font-semibold">
            Admin pages
          </SheetTitle>
          <AdminNav
            role={role}
            counts={counts}
            onNavigate={() => setMoreOpen(false)}
            className="grid grid-cols-2 gap-1"
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
