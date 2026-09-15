import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { getSessionUser } from '#/server/auth'
import type { SessionUser } from '#/server/auth'
import { getTheme } from '#/server/theme'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { Toaster } from '#/components/ui/sonner'
import appCss from '#/styles.css?url'

export interface RouterContext {
  queryClient: QueryClient
  user: SessionUser | null
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap'

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
      { rel: 'icon', href: '/favicon.ico' },
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

function RootLayout() {
  const { user, theme } = Route.useRouteContext()
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} theme={theme} />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
