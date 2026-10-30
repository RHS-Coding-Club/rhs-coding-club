import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { FadeUp } from '#/components/motion'
import { Logo } from '#/components/logo'
import { RaisedButton } from '#/components/raised-button'
import { fmtDate } from '#/lib/format'
import type { ClubPulse } from '#/services/home'
import { FloatingPaths } from './floating-paths'

/**
 * Sign-in and sign-up page, after Efferd UI's auth-5 block: full screen, no
 * site header or footer. On wide screens the left half is a navy card with
 * the club mark, Efferd's flowing lines in sky, and what's happening in the
 * club this week (live, where auth-5 has a testimonial). The right half
 * holds the form under a "Home" button. Phones get just the form, with the
 * mark above it.
 */
export function AuthLayout({
  title,
  subtitle,
  pulse,
  children,
}: {
  title: string
  subtitle: string
  pulse: ClubPulse
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-dvh lg:grid lg:grid-cols-2">
      <ClubPanel pulse={pulse} />

      <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-24 sm:px-8">
        {/* Top shades: a faint sky glow falling from the top right corner. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 isolate contain-strict">
          <div className="absolute top-0 right-0 h-[80rem] w-[35rem] -translate-y-[22rem] rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(95,178,238,0.14)_0,rgba(95,178,238,0.04)_50%,transparent_80%)]" />
          <div className="absolute top-0 right-0 h-[80rem] w-[15rem] [translate:5%_-50%] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(95,178,238,0.1)_0,rgba(95,178,238,0.02)_80%,transparent_100%)]" />
        </div>

        <RaisedButton asChild variant="ghost" className="absolute top-6 left-4 sm:left-6">
          <Link to="/">
            <ChevronLeft />
            Home
          </Link>
        </RaisedButton>

        <FadeUp className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
            <Logo className="size-9" />
            <span className="font-semibold tracking-[-0.02em]">RHS Coding Club</span>
          </Link>
          <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-base">{subtitle}</p>
          <div className="mt-7 flex flex-col gap-5">{children}</div>
        </FadeUp>
      </div>
    </div>
  )
}

function ClubPanel({ pulse }: { pulse: ClubPulse }) {
  const lines = [
    pulse.challenge
      ? `week ${pulse.challenge.weekNo} · ${pulse.challenge.title} · ${pulse.challenge.points} pts`
      : 'a new challenge every Monday',
    pulse.nextEvent
      ? `next up · ${pulse.nextEvent.title}, ${fmtDate(pulse.nextEvent.startsAt, 'short')}`
      : null,
    `${pulse.members} members and counting`,
  ].filter((l): l is string => Boolean(l))

  return (
    <div className="relative hidden p-2.5 lg:block">
      <aside className="bg-brand-navy sticky top-2.5 flex h-[calc(100dvh-1.25rem)] flex-col overflow-hidden rounded-4xl p-10 text-[#e6edf5]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b1a30]/90" />
        <div className="text-brand-sky absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        <Link to="/" className="relative z-10 mr-auto inline-flex items-center gap-2.5">
          <Logo className="size-9 ring-2 ring-white/15" />
          <span className="font-semibold tracking-[-0.02em]">RHS Coding Club</span>
        </Link>

        <div className="relative z-10 mt-auto">
          <blockquote className="max-w-lg">
            <p className="text-2xl leading-snug font-medium tracking-[-0.02em] text-balance">
              A new problem every week, lunch meetings in Mr. Derrick&apos;s room, and the
              H2O hackathon. Come build with us.
            </p>
            <footer className="mt-5 flex flex-col gap-1 font-mono text-sm text-[#e6edf5]/70">
              {lines.map((l) => (
                <span key={l} className="truncate">
                  ~ {l}
                </span>
              ))}
            </footer>
          </blockquote>
        </div>
      </aside>
    </div>
  )
}

/** "OR" between the social buttons and the email form. */
export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      <span className="border-border w-full border-t" />
      <span className="shrink-0 px-1">{children}</span>
      <span className="border-border w-full border-t" />
    </div>
  )
}
