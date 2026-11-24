import { Link } from '@tanstack/react-router'
import { FolderGit2 } from '#/components/icons/folder-git-2'
import { fileUrl } from '#/lib/files'
import type { MemberProfile } from '#/services/members'

/** A member's approved projects as a row that scrolls and snaps sideways. */
export function ProjectRail({ rows }: { rows: MemberProfile['projects'] }) {
  return (
    <ul className="-mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-3 overflow-x-auto px-(--gutter) pb-2 [scrollbar-width:none]">
      {rows.map((pr) => (
        <li key={pr.id} className="w-[17rem] shrink-0 snap-start sm:w-[20rem]">
          <Link
            to="/projects/$id"
            params={{ id: pr.id }}
            className="group bg-card ring-border/70 focus-visible:ring-ring block overflow-hidden rounded-3xl ring-1 outline-none focus-visible:ring-2"
          >
            <span className="bg-muted relative block aspect-[16/10] overflow-hidden">
              {pr.imageKeys[0] ? (
                <img
                  src={fileUrl(pr.imageKeys[0], 640)}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <span className="brand-gradient absolute inset-0 grid place-items-center">
                  <FolderGit2 className="size-7 text-white/80" aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="block p-4">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate font-semibold tracking-tight">{pr.title}</span>
                {pr.year && (
                  <span className="text-muted-foreground font-mono text-xs">
                    {pr.year}
                  </span>
                )}
              </span>
              <span className="text-muted-foreground mt-1 block truncate font-mono text-[11px]">
                {pr.tech.slice(0, 3).join(' · ')}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
