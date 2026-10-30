import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHero } from '#/components/page-hero'
import { BeamsBackground } from './beams-bg'

/** The header and column every project form page sits in. */
export function ProjectFormShell({
  title,
  description,
  back,
  initialDark,
  children,
}: {
  title: string
  description: string
  back: { label: string; to: '/projects' | '/projects/$id'; id?: string }
  initialDark: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <PageHero
        size="sm"
        background={<BeamsBackground initialDark={initialDark} />}
        eyebrow={
          <Link
            to={back.to}
            params={back.id ? { id: back.id } : undefined}
            className="pointer-events-auto inline-flex items-center gap-1.5 transition-colors hover:text-[#101826] dark:hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {back.label}
          </Link>
        }
        title={title}
        description={description}
      />
      <div className="mx-auto max-w-6xl px-(--gutter) py-14 sm:py-20">{children}</div>
    </>
  )
}
