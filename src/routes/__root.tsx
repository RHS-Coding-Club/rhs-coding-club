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
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'

export interface RouterContext {
  queryClient: QueryClient
  user: SessionUser | null
}

const DESCRIPTION =
  'The most active club at RHS. Coding challenges, community service, hackathons, and projects.'
// Link previews need an absolute URL, and this also runs in the browser, where env isn't readable.
const OG_IMAGE = 'https://rhs.riponhighcodingclub.workers.dev/og.png'

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
      { name: 'description', content: DESCRIPTION },
      { name: 'theme-color', content: '#0b0f15' },
      // Defaults for link previews; a page's own og: tags replace these one by one, so
      // nothing here may describe this particular image (cover images override it).
      { property: 'og:site_name', content: 'RHS Coding Club' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'RHS Coding Club' },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:image', content: OG_IMAGE },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      // Body text's font, fetched alongside the stylesheet rather than after it.
      {
        rel: 'preload',
        href: geistLatin,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/icon-64.png', type: 'image/png', sizes: '64x64' },
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
const AUTH_PAGES = new Set([
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
])

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
            {!bare && <SiteHeader user={user} />}
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
