import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Printer } from '#/components/icons/printer'
import { RaisedButton } from '#/components/raised-button'
import { riseIn } from '#/components/motion'
import { cn } from '#/lib/utils'
import { DocTabs } from './doc-tabs'
import type { LegalDoc } from './types'
import { useReading } from './use-reading'

const num = (i: number) => String(i + 1).padStart(2, '0')

type Mode = 'full' | 'short'

/**
 * Privacy and terms layout, "annotated". Every section is a row: the number, the
 * title and a one-line "in short" on the left (sticky while you read), the
 * exact wording on the right. A Full text / In short switch collapses the
 * page to just the summaries, the way a parent skims it. A sticky chip rail
 * tracks the section you're in and a hairline under it fills as you read.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const ids = useMemo(() => doc.sections.map((s) => s.id), [doc])
  const { articleRef, active, progress, goTo } = useReading(ids)
  const [mode, setMode] = useState<Mode>('full')
  const short = mode === 'short'

  return (
    <div data-legal-doc className="pb-24">
      <header className="mx-auto grid grid-cols-1 max-w-6xl gap-8 px-(--gutter) pt-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div style={riseIn(0.02)} className="rise-in">
            <DocTabs kind={doc.kind} />
          </div>
          <h1
            style={riseIn(0.08)}
            className="rise-in mt-8 text-[clamp(3rem,8vw,6rem)] leading-[0.98] font-semibold tracking-[-0.05em]"
          >
            {doc.title}
          </h1>
          <p
            style={riseIn(0.16)}
            className="rise-in mt-5 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl"
          >
            {doc.description}
          </p>
        </div>
        <div style={riseIn(0.24)} className="rise-in flex flex-col gap-3 lg:items-end">
          <div data-print-hide>
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>
          <p className="text-sm text-muted-foreground">
            Updated <time dateTime={doc.updatedIso}>{doc.updated}</time> · {doc.minutes}{' '}
            min read
          </p>
        </div>
      </header>

      <ChipRail
        doc={doc}
        active={active}
        progress={progress}
        onPick={(id) => goTo(id, -180)}
      />

      <article ref={articleRef} className="mx-auto mt-4 max-w-6xl px-(--gutter)">
        <p
          aria-live="polite"
          className={cn(
            'mb-2 text-sm text-muted-foreground print:hidden',
            short ? 'block' : 'sr-only',
          )}
        >
          {short
            ? 'Showing the short version. The full text is the one that counts; switch back to read it.'
            : 'Showing the full text.'}
        </p>
        {doc.sections.map((s, i) => (
          <section
            key={s.id}
            aria-labelledby={s.id}
            className={cn(
              'grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-[17rem_minmax(0,1fr)]',
              i > 0 && 'border-t border-border',
              short ? 'py-7' : 'py-12 sm:py-14',
            )}
          >
            <div className={cn(!short && 'md:sticky md:top-48 md:self-start')}>
              <p
                aria-hidden="true"
                className="font-mono text-sm text-primary tabular-nums"
              >
                {num(i)}
              </p>
              <h2
                id={s.id}
                tabIndex={-1}
                className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.025em] text-balance outline-none"
              >
                {s.title}
              </h2>
              {!short && (
                <p className="mt-3 text-[0.95rem] text-pretty text-muted-foreground">
                  <span className="font-medium text-foreground">In short: </span>
                  {s.short}
                </p>
              )}
            </div>
            {short && (
              <p className="max-w-[60ch] text-lg text-pretty md:pt-7 print:hidden">
                {s.short}
              </p>
            )}
            {/* Paper always gets the full text, whichever view is on screen. */}
            <div className={cn('rich-text max-w-[64ch]', short && 'hidden print:block')}>
              {s.body}
            </div>
          </section>
        ))}

        <div
          data-print-hide
          className="mt-4 grid grid-cols-1 gap-6 border-t border-border pt-12 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-x-12"
        >
          <p className="font-mono text-sm text-muted-foreground">Questions</p>
          <div className="flex flex-col items-start gap-5">
            <p className="max-w-[52ch] text-lg text-pretty">
              Something here unclear, or want your data removed? The officers read every
              message.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <RaisedButton asChild>
                <Link to="/contact">Message the officers</Link>
              </RaisedButton>
              <RaisedButton variant="ghost" onClick={() => window.print()}>
                <Printer />
                Print this page
              </RaisedButton>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

/** Full text / In short, a two-way segmented switch. */
function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const options: { value: Mode; label: string }[] = [
    { value: 'full', label: 'Full text' },
    { value: 'short', label: 'In short' },
  ]
  return (
    <div
      role="group"
      aria-label="How much to show"
      className="relative inline-grid grid-cols-2 rounded-full bg-muted p-1 ring-1 ring-border"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-card shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_1px_var(--border)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: mode === 'short' ? 'translateX(100%)' : 'none' }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={mode === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring',
            mode === o.value
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Sections as a sticky, horizontally scrolling rail of chips. The active
 * chip fills and scrolls itself into view inside the rail (never the page);
 * a hairline under the rail fills with reading progress.
 */
function ChipRail({
  doc,
  active,
  progress,
  onPick,
}: {
  doc: LegalDoc
  active: string
  progress: number
  onPick: (id: string) => void
}) {
  const railRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const rail = railRef.current
    const chip = rail?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (!rail || !chip) return
    const left = chip.offsetLeft - rail.clientWidth / 2 + chip.offsetWidth / 2
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollTo({ left, behavior: still ? 'auto' : 'smooth' })
  }, [active])

  return (
    <nav
      aria-label="Sections"
      data-print-hide
      className="sticky top-[5.25rem] z-30 mt-12 border-y border-border bg-background/80 backdrop-blur-xl sm:top-[6.5rem]"
    >
      <div className="mx-auto max-w-6xl">
        <ol
          ref={railRef}
          className="flex snap-x scroll-px-(--gutter) gap-1.5 overflow-x-auto overscroll-x-contain px-(--gutter) py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {doc.sections.map((s, i) => {
            const current = s.id === active
            return (
              <li key={s.id} className="snap-start">
                <a
                  href={`#${s.id}`}
                  data-id={s.id}
                  aria-current={current ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    onPick(s.id)
                  }}
                  className={cn(
                    'flex h-9 items-center gap-2 rounded-full px-3.5 text-sm whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    current
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="font-mono text-xs tabular-nums opacity-70">
                    {num(i)}
                  </span>
                  {s.title}
                </a>
              </li>
            )
          })}
        </ol>
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-px origin-left bg-primary"
        style={{ transform: `scaleX(${progress})` }}
      />
    </nav>
  )
}
