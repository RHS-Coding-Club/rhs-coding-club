import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ArrowRight, Mail } from 'lucide-react'
import { subscribeNewsletter, newsletterSchema } from '#/server/newsletter'
import type { Theme } from '#/server/theme'
import { Logo } from '#/components/logo'
import { FadeUp } from '#/components/motion'
import { GrainientBackground } from '#/components/home/grainient-bg'

const COLUMNS: {
  title: string
  links: { label: string; to?: LinkProps['to']; href?: string }[]
}[] = [
  {
    title: 'Club',
    links: [
      { label: 'Challenges', to: '/challenges' },
      { label: 'Events', to: '/events' },
      { label: 'Projects', to: '/projects' },
      { label: 'Leaderboard', to: '/leaderboard' },
    ],
  },
  {
    title: 'More',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Resources', to: '/resources' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/rhs.codingclub/' },
      { label: 'GitHub', href: 'https://github.com/RHS-Coding-Club' },
    ],
  },
]

/**
 * Template footer: a navy rounded block with a floating surface card that
 * overlaps its top edge (newsletter signup), then logo + link columns.
 */
export function SiteFooter({ theme }: { theme: Theme }) {
  return (
    <footer className="mx-2.5 mt-32 pb-2.5">
      {/* Floating signup card. The negative bottom margin pulls the navy block up underneath it. */}
      <FadeUp className="relative z-10 mx-auto -mb-64 max-w-5xl">
        <NewsletterCard theme={theme} />
      </FadeUp>

      <div className="bg-brand-navy rounded-3xl px-6 pt-[22rem] pb-10 text-[#e6edf5] sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 self-start rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="RHS Coding Club home"
          >
            <Logo className="size-8" />
            <span className="text-lg font-semibold tracking-tight">RHS Coding Club</span>
          </Link>

          <nav
            className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4 sm:gap-x-14"
            aria-label="Footer"
          >
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[11px] tracking-[0.14em] text-[#e6edf5]/60 uppercase">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-[#e6edf5]/90 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#e6edf5]/90 transition-colors hover:text-white"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-20 text-center text-sm text-[#e6edf5]/70">
          © 2026 RHS Coding Club
        </p>
      </div>
    </footer>
  )
}

type Status =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string }

function NewsletterCard({ theme }: { theme: Theme }) {
  const subscribe = useServerFn(subscribeNewsletter)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const parsed = newsletterSchema.safeParse({
      email: String(new FormData(form).get('email')),
    })
    if (!parsed.success) {
      setStatus({ kind: 'error', message: 'Enter a valid email address.' })
      return
    }
    setStatus({ kind: 'pending' })
    try {
      await subscribe({ data: parsed.data })
      setStatus({ kind: 'ok' })
      form.reset()
    } catch {
      setStatus({
        kind: 'error',
        message: 'Something went wrong. Try again in a moment.',
      })
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="bg-card text-card-foreground relative overflow-hidden rounded-3xl px-6 pt-16 pb-16 text-center shadow-2xl shadow-black/25 sm:px-12"
    >
      {/* The hero's Grainient again, fading up into the card so the copy stays readable. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <GrainientBackground initialTheme={theme} />
        <div className="from-card via-card/85 absolute inset-0 bg-gradient-to-b to-transparent" />
      </div>

      <div className="relative">
        <h2
          id="newsletter-heading"
          className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl"
        >
          Stay in the loop with the club
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-md text-base">
          New challenges, event reminders, and hackathon dates. No spam, unsubscribe any
          time.
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-md" noValidate>
          <div className="bg-background/95 flex items-center gap-2 rounded-full p-1.5 pl-4 shadow-lg shadow-black/10 ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
            <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            <label htmlFor="newsletter-email" className="sr-only">
              Newsletter signup
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              disabled={status.kind === 'pending'}
              className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-[background-color,transform] outline-none focus-visible:ring-2 active:scale-[0.98] disabled:opacity-60"
            >
              Subscribe
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 min-h-5 text-sm" role="status" aria-live="polite">
            {status.kind === 'ok' && (
              <span className="text-success">
                You are on the list. See you in the next update.
              </span>
            )}
            {status.kind === 'error' && (
              <span className="text-destructive">{status.message}</span>
            )}
          </p>
        </form>
      </div>
    </section>
  )
}
