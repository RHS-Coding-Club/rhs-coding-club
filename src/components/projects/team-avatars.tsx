import { Link } from '@tanstack/react-router'
import { UserAvatar } from '#/components/user-avatar'
import { cn } from '#/lib/utils'

export { teamNames } from './filter'

export interface TeamMemberLike {
  id: string
  name: string
  image?: string | null
  avatarKey?: string | null
}

/** Overlapping avatars for a project's team; optionally links each to the profile. */
export function TeamAvatars({
  team,
  max = 4,
  size = 'size-8',
  linked = false,
  className,
}: {
  team: TeamMemberLike[]
  max?: number
  size?: string
  linked?: boolean
  className?: string
}) {
  const shown = team.slice(0, max)
  const extra = team.length - shown.length
  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {shown.map((m) => {
        const avatar = <UserAvatar user={m} className={cn(size, 'ring-card ring-2')} />
        return linked ? (
          <Link
            key={m.id}
            to="/members/$id"
            params={{ id: m.id }}
            title={m.name}
            aria-label={m.name}
            className="focus-visible:ring-ring/60 relative rounded-full transition-transform hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:ring-3 focus-visible:outline-none"
          >
            {avatar}
          </Link>
        ) : (
          <span key={m.id} title={m.name} className="relative">
            {avatar}
          </span>
        )
      })}
      {extra > 0 && (
        <span
          className={cn(
            size,
            'bg-muted text-muted-foreground ring-card relative inline-flex items-center justify-center rounded-full font-mono text-[11px] ring-2',
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  )
}
