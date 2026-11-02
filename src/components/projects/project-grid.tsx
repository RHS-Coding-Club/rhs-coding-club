import { useMemo } from 'react'
import type { MouseEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import Masonry from '#/components/bits/Masonry'
import type { MasonryItem } from '#/components/bits/Masonry'
import { fileUrl } from '#/lib/files'
import { initials } from '#/lib/format'
import { useIsDark } from '#/hooks/use-is-dark'
import type { ProjectCard } from '#/services/projects'
import { coverHeight, projectCoverUrl } from './cover'
import { teamNames } from './filter'

/**
 * The showcase wall on React Bits Masonry: each tile is the project's first
 * screenshot (or its generated cover) with the title, team, and stack in the
 * caption. Tiles spring into place as filters change. Clicking goes to the
 * project page; modifier-clicks open it in a new tab like any link.
 */
export function ProjectGrid({
  projects,
  initialDark,
}: {
  projects: ProjectCard[]
  initialDark: boolean
}) {
  const router = useRouter()
  const dark = useIsDark(initialDark)

  const items = useMemo<MasonryItem[]>(
    () =>
      projects.map((p) => {
        const shot = fileUrl(p.imageKeys[0])
        const caption = [p.tech.slice(0, 3).join(' · '), teamNames(p.team)]
          .filter(Boolean)
          .join('  ·  by ')
        return {
          id: p.id,
          img:
            shot ??
            projectCoverUrl({
              id: p.id,
              title: p.title,
              tech: p.tech,
              initials: p.team.map((m) => initials(m.name)),
              year: p.year,
              featured: p.featured,
              dark,
              captionSpace: true,
            }),
          // Covers have a known size; screenshots are measured by Masonry.
          ...(shot ? {} : { width: 600, height: coverHeight(p.id) }),
          title: p.featured ? `${p.title}  ·  Featured` : p.title,
          description: caption,
          alt: shot ? `Screenshot of ${p.title}` : '',
          url: `/projects/${p.id}`,
        }
      }),
    [projects, dark],
  )

  const open = (item: MasonryItem, _index: number, event: MouseEvent<HTMLElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    void router.navigate({ to: '/projects/$id', params: { id: String(item.id) } })
  }

  return (
    <Masonry
      items={items}
      columnWidth={320}
      gap={16}
      radius={24}
      animateFrom="bottom"
      stagger={0.04}
      duration={0.7}
      bounce={0.12}
      hoverEffect="lift"
      captions="always"
      lightbox={false}
      draggable={false}
      onItemClick={open}
      className="[&_[data-card]]:focus-visible:outline-brand-sky [&_[data-media]]:ring-border/60 [&_[data-media]]:ring-1"
    />
  )
}
