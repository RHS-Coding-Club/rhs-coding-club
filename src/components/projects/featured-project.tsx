import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Github, Globe } from 'lucide-react'
import SpotlightCard from '#/components/bits/SpotlightCard'
import { RaisedButton } from '#/components/raised-button'
import { useIsDark } from '#/hooks/use-is-dark'
import { cn } from '#/lib/utils'
import type { ProjectCard } from '#/services/projects'
import { ProjectCover } from './project-cover'
import { TeamAvatars } from './team-avatars'
import { TechChip } from './tech-chip'
import { teamNames } from './filter'
import { safeHref } from '#/lib/rich-text'

/** A wide spotlight card for an officer-featured project. */
export function FeaturedProject({
  project,
  initialDark,
  flip = false,
}: {
  project: ProjectCard
  initialDark: boolean
  flip?: boolean
}) {
  const dark = useIsDark(initialDark)
  return (
    <SpotlightCard
      theme={dark ? 'dark' : 'light'}
      spotlightColor="rgba(95, 178, 238, 0.9)"
      intensity={0.16}
      className="w-full min-w-0 rounded-4xl! p-2.5!"
      style={
        {
          '--spotlight-card-surface': 'var(--bits-surface)',
          '--spotlight-card-border': 'var(--bits-edge)',
        } as React.CSSProperties
      }
    >
      <article className="grid min-w-0 gap-2 md:grid-cols-2">
        <Link
          to="/projects/$id"
          params={{ id: project.id }}
          tabIndex={-1}
          aria-hidden="true"
          className={cn(
            'bg-brand-navy group relative block aspect-[4/3] overflow-hidden rounded-[1.6rem]',
            flip && 'md:order-2',
          )}
        >
          <ProjectCover
            project={project}
            initialDark={initialDark}
            height={450}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </Link>
        <div className="flex min-w-0 flex-col p-4 sm:p-7">
          <div className="flex items-center gap-3">
            <TeamAvatars team={project.team} linked />
            <p className="text-muted-foreground min-w-0 truncate text-sm">
              {teamNames(project.team)}
              {project.year ? ` · ${project.year}` : ''}
            </p>
          </div>
          <h3 className="mt-6 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            <Link
              to="/projects/$id"
              params={{ id: project.id }}
              className="hover:text-brand-sky focus-visible:text-brand-sky transition-colors outline-none"
            >
              {project.title}
            </Link>
          </h3>
          <p className="text-muted-foreground mt-3 line-clamp-4 text-base leading-relaxed">
            {project.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <TechChip key={t}>{t}</TechChip>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-8">
            <RaisedButton asChild variant="primary">
              <Link to="/projects/$id" params={{ id: project.id }}>
                View project
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </RaisedButton>
            {project.demoUrl && (
              <RaisedButton asChild variant="outline">
                <a
                  href={safeHref(project.demoUrl) ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe aria-hidden="true" />
                  Live demo
                </a>
              </RaisedButton>
            )}
            {project.repoUrl && (
              <RaisedButton asChild variant="ghost">
                <a
                  href={safeHref(project.repoUrl) ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github aria-hidden="true" />
                  Code
                </a>
              </RaisedButton>
            )}
          </div>
        </div>
      </article>
    </SpotlightCard>
  )
}
