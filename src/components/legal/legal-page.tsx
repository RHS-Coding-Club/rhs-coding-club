import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { PageHero } from '#/components/page-hero'
import { OutlineMenu, SectionNumber } from '#/components/outline-menu'
import { cn } from '#/lib/utils'

export interface LegalSection {
  id: string
  title: string
  body: ReactNode
}

/**
 * Privacy and terms layout: a quiet hero (no shader), the numbered table of
 * contents in Branched Menu (open and sticky beside the text on wide
 * screens, folded above it on phones), and the sections as prose with
 * anchor links on every heading.
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
  const outline = useMemo(
    () =>
      sections.map((s, i) => ({
        id: s.id,
        label: s.title,
        icon: <SectionNumber n={i + 1} />,
      })),
    [sections],
  )
  return (
    <>
      <PageHero
        size="sm"
        eyebrow={<>Last updated {updated}</>}
        title={title}
        description={description}
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-(--gutter) py-14 sm:py-20 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <OutlineMenu sections={outline} startActive className="hidden lg:block" />
          <OutlineMenu
            sections={outline}
            startActive
            defaultOpen={false}
            className="border-border border-b pb-6 lg:hidden"
          />
          <p className="text-muted-foreground mt-6 hidden text-sm lg:block">
            See also{' '}
            <Link to={other.to} className="text-foreground underline underline-offset-4">
              {other.label}
            </Link>
            .
          </p>
        </aside>

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
