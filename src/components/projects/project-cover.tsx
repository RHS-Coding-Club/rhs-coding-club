import { fileUrl } from '#/lib/files'
import { initials } from '#/lib/format'
import { cn } from '#/lib/utils'
import { useIsDark } from '#/hooks/use-is-dark'
import { projectCoverUrl } from './cover'

/**
 * A project's first screenshot, or its generated cover when it has none.
 * Fills its (positioned) parent.
 */
export function ProjectCover({
  project,
  initialDark,
  width,
  height,
  className,
}: {
  project: {
    id: string
    title: string
    tech: string[]
    imageKeys: string[]
    year: number | null
    featured?: boolean
    team: { name: string }[]
  }
  initialDark: boolean
  /** Generated-cover size (600 wide by default); match the frame's aspect ratio. */
  width?: number
  height?: number
  className?: string
}) {
  const dark = useIsDark(initialDark)
  const shot = fileUrl(project.imageKeys[0])
  return (
    <img
      src={
        shot ??
        projectCoverUrl({
          id: project.id,
          title: project.title,
          tech: project.tech,
          initials: project.team.map((m) => initials(m.name)),
          year: project.year,
          featured: project.featured,
          dark,
          width,
          height,
        })
      }
      alt={shot ? `Screenshot of ${project.title}` : ''}
      draggable={false}
      className={cn('absolute inset-0 size-full object-cover select-none', className)}
    />
  )
}
