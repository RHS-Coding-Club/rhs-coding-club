import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { PageHero } from '#/components/page-hero'
import { cn } from '#/lib/utils'

export interface LegalSection {
  id: string
  title: string
  body: ReactNode
}

/** The last section whose heading has scrolled past the header, for the table of contents. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 180) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [ids])
  return active
}

/**
 * Privacy and terms layout: a quiet hero (no shader), a sticky table of
 * contents on wide screens (a plain list on phones), and the sections as
 * prose with anchor links on every heading.
 */
export function LegalPage({
  title,
  description,
  updated,
  sections,
  other,
}: {
  title: string
  description: string
  updated: string
  sections: LegalSection[]
  other: { to: '/privacy' | '/terms'; label: string }
}) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections])
  const active = useActiveSection(ids)
  return (
    <>
      <PageHero
        size="sm"
        eyebrow={<>Last updated {updated}</>}
        title={title}
        description={description}
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-(--gutter) py-14 sm:py-20 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-muted-foreground mb-3 text-sm font-medium">On this page</p>
          <ol className="border-border flex flex-col border-l">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? 'location' : undefined}
                  className={cn(
                    'focus-visible:ring-ring/50 -ml-px flex gap-2.5 border-l-2 py-1.5 pl-4 text-sm transition-colors outline-none focus-visible:ring-3',
                    active === s.id
                      ? 'border-brand-sky text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground border-transparent',
                  )}
                >
                  <span className="tabular w-4 shrink-0 font-mono text-xs leading-5 opacity-60">
                    {i + 1}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          <p className="text-muted-foreground mt-6 hidden text-sm lg:block">
            See also{' '}
            <Link to={other.to} className="text-foreground underline underline-offset-4">
              {other.label}
            </Link>
            .
          </p>
        </nav>

        <article className="rich-text max-w-[68ch]">
          {sections.map((s, i) => (
            <section key={s.id} aria-labelledby={s.id} className="[&>*+*]:mt-[1.1em]">
              <h2 id={s.id} className={cn('group scroll-mt-32', i === 0 && 'mt-0!')}>
                <a href={`#${s.id}`} className="no-underline! hover:no-underline">
                  {s.title}
                </a>
                <a
                  href={`#${s.id}`}
                  aria-label={`Link to ${s.title}`}
                  className="text-muted-foreground ml-2 font-normal no-underline! opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  #
                </a>
              </h2>
              {s.body}
            </section>
          ))}
          <hr />
          <p className="text-muted-foreground text-base">
            Questions about this page?{' '}
            <Link to="/contact">Send the officers a message</Link>. See also{' '}
            <Link to={other.to}>{other.label}</Link>.
          </p>
        </article>
      </div>
    </>
  )
}
