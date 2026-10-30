import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { getSessionUser } from '#/server/auth'
import type { SessionUser } from '#/server/auth'
import { getTheme } from '#/server/theme'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { ThemeToggle } from '#/components/theme-toggle'
import { SmoothScroll } from '#/components/smooth-scroll'
import { SparkRoot } from '#/components/spark'
import { Toaster } from '#/components/ui/sonner'
import appCss from '#/styles.css?url'

export interface RouterContext {
  queryClient: QueryClient
  user: SessionUser | null
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap'

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const [user, theme] = await Promise.all([getSessionUser(), getTheme()])
    return { user, theme }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'RHS Coding Club' },
      {
        name: 'description',
        content:
          'The most active club at RHS. Coding challenges, community service, hackathons, and projects.',
      },
      { name: 'theme-color', content: '#0b0f15' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: FONTS },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/logo.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = Route.useRouteContext()
  return (
    <html lang="en" className={theme}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

/** Full-screen auth pages: no site header or footer. */
const AUTH_PAGES = new Set(['/login', '/signup', '/forgot-password', '/reset-password'])

function RootLayout() {
  const { user, theme } = Route.useRouteContext()
  // The header floats over the page. The home hero runs underneath it (like
  // the template); every other page pads for it. The auth pages are full
  // screen with their own "Home" button, so they drop the header and footer.
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === '/'
  const bare = AUTH_PAGES.has(pathname)
  return (
    // reducedMotion="user": with the OS setting on, motion skips transforms and
    // layout animation site-wide and keeps fades, without changing markup.
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <SparkRoot>
          <div className="flex min-h-dvh flex-col">
            {!bare && <SiteHeader user={user} theme={theme} />}
            <main className={isHome || bare ? 'flex-1' : 'flex-1 pt-(--header-offset)'}>
              <Outlet />
            </main>
            {!bare && <SiteFooter theme={theme} />}
            <ThemeToggle initial={theme} />
          </div>
        </SparkRoot>
      </SmoothScroll>
    </MotionConfig>
  )
}
