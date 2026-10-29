import { Link } from '@tanstack/react-router'
import { ArrowUpRight, FolderGit2 } from 'lucide-react'
import CardSwap, { Card } from '#/components/bits/CardSwap'
import type { HomeData } from '#/services/home'
import { FadeUp } from '#/components/motion'
import { useIsDark } from '#/hooks/use-is-dark'
import type { Theme } from '#/server/theme'

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
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
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
          <FadeUp delay={0.1} className="h-[380px] sm:h-[440px]">
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
                <Card
                  key={p.id}
                  style={{ background: 'var(--bits-tile)', color: 'var(--foreground)' }}
                >
                  <ProjectCard project={p} />
                </Card>
              ))}
            </CardSwap>
          </FadeUp>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex h-full flex-col p-2">
      <div className="bg-brand-navy relative min-h-0 flex-1 overflow-hidden rounded-[16px]">
        {project.imageKeys[0] ? (
          <img
            src={`/files/${project.imageKeys[0]}`}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_20%,#5fb2ee_0%,transparent_60%),radial-gradient(60%_70%_at_85%_90%,#1f4f8a_0%,transparent_65%)]">
            <FolderGit2
              className="absolute right-4 bottom-4 size-7 text-white/70"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      <div className="px-2.5 pt-3.5 pb-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {project.title}
          </h3>
          <span className="shrink-0 text-xs opacity-60">{project.authorName}</span>
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
