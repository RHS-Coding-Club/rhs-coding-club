import { Suspense } from 'react'
import { ClientOnly, Link, useLocation, useRouter } from '@tanstack/react-router'
import type { IconComponent } from '#/components/icons/create-icon'
import { ArrowLeft } from '#/components/icons/arrow-left'
import { ArrowUpRight } from '#/components/icons/arrow-up-right'
import { BookOpen } from '#/components/icons/book-open'
import { Calendar } from '#/components/icons/calendar'
import { Code } from '#/components/icons/code'
import { FolderGit2 } from '#/components/icons/folder-git-2'
import { Library } from '#/components/icons/library'
import { Trophy } from '#/components/icons/trophy'
import { RaisedButton } from '#/components/raised-button'
import { riseIn } from '#/components/motion'
import { suggestPage } from '#/lib/suggest-page'
import { FaultyBackground } from '#/components/faulty-terminal-bg'

interface Destination {
  to: '/challenges' | '/events' | '/projects' | '/leaderboard' | '/blog' | '/resources'
  label: string
  blurb: string
}

const DESTINATIONS: Destination[] = [
  { to: '/challenges', label: 'Challenges', blurb: 'Weekly problems, old and new' },
  { to: '/events', label: 'Events', blurb: 'Meetings, RAP, the hackathon' },
  { to: '/projects', label: 'Projects', blurb: 'What members have shipped' },
  { to: '/leaderboard', label: 'Leaderboard', blurb: 'This semester and all time' },
  { to: '/blog', label: 'Blog', blurb: 'Recaps, how-tos, and news' },
  { to: '/resources', label: 'Resources', blurb: 'The links we actually use' },
]

const ICONS: Record<Destination['to'], IconComponent> = {
  '/challenges': Code,
  '/events': Calendar,
  '/projects': FolderGit2,
  '/leaderboard': Trophy,
  '/blog': BookOpen,
  '/resources': Library,
}

/**
 * The 404 page, for unknown routes and for notFound() from loaders (a
 * missing post, project, or member). "Lost signal": a full-bleed React Bits Faulty Terminal
 * runs under the header with a huge 404 fading into it (after Efferd's
 * not-found-2 mask). Below, the way out as a ruled grid of six destinations
 * (after Efferd's full-width dividers), on the solid ground so it reads.
 */
export function NotFound() {
  const path = useLocation({ select: (l) => l.pathname })
  const router = useRouter()
  const guess = suggestPage(path)

  return (
    <>
      <section className="relative -mt-(--header-offset) overflow-hidden bg-stage">
        <div aria-hidden="true" className="absolute inset-0">
          <ClientOnly>
            <Suspense>
              <FaultyBackground />
            </Suspense>
          </ClientOnly>
        </div>
        {/* Scrim: keeps the copy readable in the middle, lets the CRT show at the edges. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_58%,color-mix(in_srgb,var(--stage)_88%,transparent)_0%,color-mix(in_srgb,var(--stage)_55%,transparent)_55%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background"
        />

        <div className="pointer-events-none relative mx-auto flex min-h-[calc(30rem+var(--header-offset))] max-w-3xl flex-col items-center justify-end px-(--gutter) pt-[calc(var(--header-offset)+2rem)] pb-16 text-center sm:min-h-[calc(36rem+var(--header-offset))] sm:pb-20">
          <p
            aria-hidden="true"
            style={riseIn(0.05, 24, 1)}
            className="rise-in font-mono text-[clamp(7rem,26vw,15rem)] leading-[0.85] font-semibold tracking-[-0.06em] text-ink mask-b-from-30% mask-b-to-95%"
          >
            404
          </p>
          <h1
            style={riseIn(0.15)}
            className="rise-in -mt-2 text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em] text-balance text-ink sm:-mt-4"
          >
            We lost the signal on this one.
          </h1>
          <p
            style={riseIn(0.25)}
            className="rise-in mt-4 max-w-md text-lg text-pretty text-ink/75"
          >
            Nothing lives at{' '}
            <code
              title={path.length > 80 ? path : undefined}
              className="rounded-md bg-ink/10 px-1.5 py-0.5 font-mono text-[0.9em] break-all text-ink"
            >
              {middleTruncate(path, 80)}
            </code>
            .{' '}
            {guess ? (
              <>
                Did you mean{' '}
                <Link
                  to={guess.to}
                  className="pointer-events-auto font-medium text-ink underline decoration-brand-sky decoration-2 underline-offset-4"
                >
                  {guess.label}
                </Link>
                ?
              </>
            ) : (
              'Check the link, or pick up below.'
            )}
          </p>
          <div
            style={riseIn(0.35)}
            className="rise-in pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <RaisedButton asChild size="lg">
              <Link to="/">Back home</Link>
            </RaisedButton>
            <RaisedButton
              variant="secondary"
              size="lg"
              onClick={() => router.history.back()}
            >
              <ArrowLeft />
              Go back
            </RaisedButton>
          </div>
        </div>
      </section>

      <nav
        aria-labelledby="nf-b-jump"
        className="relative mx-auto mt-2 max-w-6xl px-(--gutter) pb-24 sm:mt-6"
      >
        <h2 id="nf-b-jump" className="sr-only">
          Popular pages
        </h2>
        <ul className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d) => {
            const Icon = ICONS[d.to]
            return (
              <li key={d.to} className="-mt-px -ml-px border-t border-l border-border">
                <Link
                  to={d.to}
                  className="group relative flex h-full items-center gap-4 px-5 py-4 outline-none transition-colors duration-150 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:flex-col sm:items-stretch sm:gap-6 sm:p-8"
                >
                  <span className="flex shrink-0 items-start justify-between sm:shrink">
                    <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                      <Icon className="size-[18px]" />
                    </span>
                    <ArrowUpRight className="hidden size-4 text-muted-foreground sm:block transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold tracking-[-0.01em]">
                      {d.label}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {d.blurb}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

/** Keeps the start and end of a long path ("/blog/2019/…/old-post") so the actions stay in view. */
function middleTruncate(text: string, max: number): string {
  if (text.length <= max) return text
  const keep = max - 1
  return `${text.slice(0, Math.ceil(keep / 2))}…${text.slice(-Math.floor(keep / 2))}`
}
