import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from '#/components/icons/arrow-up-right'
import { fileUrl } from '#/lib/files'
import CardSwap, { Card } from '#/components/bits/CardSwap'
import type { HomeData } from '#/services/home'
import { FadeUp } from '#/components/motion'
import { useIsDark } from '#/hooks/use-is-dark'
import type { Theme } from '#/server/theme'
import { CARD_SWAP_VARS } from '#/components/bits-theme'
import { projectCoverUrl } from '#/components/projects/cover'
import { initials } from '#/lib/format'

type Project = HomeData['featuredProjects'][number]

/**
 * Approved member projects on React Bits Card Swap: a 3D stack that sends
 * the front card to the back every few seconds, or when you fling it.
 */
export function FeaturedProjects({
  projects,
  theme,
}: {
  projects: HomeData['featuredProjects']
  theme: Theme
}) {
  const dark = useIsDark(theme === 'dark')

  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24"
      aria-labelledby="projects-heading"
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
        <FadeUp className="max-w-md">
          <h2
            id="projects-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            Built by members, shipped for real
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Every project here was reviewed by an officer and approved for the public
            showcase. Grab the stack and fling it to see the next one.
          </p>
          <Link
            to="/projects"
            className="text-foreground hover:text-brand-sky mt-8 inline-flex items-center gap-1.5 text-base font-medium transition-colors"
          >
            Browse every project
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </FadeUp>

        {projects.length === 0 ? (
          <FadeUp className="border-border text-muted-foreground rounded-3xl border border-dashed px-6 py-20 text-center text-sm">
            No approved projects yet. Members submit theirs from the dashboard.
          </FadeUp>
        ) : (
          <FadeUp className="h-[380px] sm:h-[440px]">
            <CardSwap
              width={420}
              height={300}
              cardDistance={46}
              verticalDistance={54}
              delay={4500}
              skewAmount={5}
              cardRadius={22}
              theme={dark ? 'dark' : 'light'}
            >
              {projects.map((p) => (
                <Card key={p.id} style={CARD_SWAP_VARS}>
                  <ProjectCard project={p} dark={dark} />
                </Card>
              ))}
            </CardSwap>
          </FadeUp>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project, dark }: { project: Project; dark: boolean }) {
  // A screenshot when there is one, otherwise the same generated cover the
  // showcase uses, so a project looks the same everywhere.
  const src =
    fileUrl(project.imageKeys[0], 960) ??
    projectCoverUrl({
      id: project.id,
      title: project.title,
      tech: project.tech,
      initials: [initials(project.authorName)],
      dark,
      width: 600,
      height: 400,
      captionSpace: true,
    })
  return (
    <div className="flex h-full flex-col p-2">
      <div className="bg-brand-navy relative min-h-0 flex-1 overflow-hidden rounded-[16px]">
        <img
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
        />
      </div>
      <div className="px-2.5 pt-3.5 pb-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
            {project.title}
          </h3>
          <span
            className="max-w-[45%] min-w-0 truncate text-xs opacity-60"
            title={project.authorName}
          >
            {project.authorName}
          </span>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-hidden">
          {project.tech.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full px-2 py-0.5 font-mono text-[11px] whitespace-nowrap"
              style={{ background: 'var(--swap-badge)' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
