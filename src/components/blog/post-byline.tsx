import { Link } from '@tanstack/react-router'
import { UserAvatar } from '#/components/user-avatar'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'

/** Author avatar and name, date, and reading time on one line. */
export function PostByline({
  author,
  publishedAt,
  minutes,
  size = 'md',
  className,
}: {
  author: {
    id: string
    name: string
    image: string | null
    avatarKey: string | null
  } | null
  /** Omit to hide the date; null shows "Draft". */
  publishedAt?: Date | string | null
  minutes: number
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      {author && (
        <UserAvatar user={author} className={size === 'sm' ? 'size-7' : 'size-10'} />
      )}
      <div className={cn('min-w-0', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {author && size === 'md' && (
          <Link
            to="/members/$id"
            params={{ id: author.id }}
            className="hover:text-brand-sky block truncate font-medium transition-colors"
          >
            {author.name}
          </Link>
        )}
        <p className="text-muted-foreground truncate">
          {author && size === 'sm' && (
            <span className="text-foreground/85">{author.name} · </span>
          )}
          {publishedAt !== undefined && (
            <>
              {publishedAt ? (
                <time dateTime={new Date(publishedAt).toISOString()}>
                  {fmtDate(publishedAt)}
                </time>
              ) : (
                'Draft'
              )}
              <span aria-hidden="true"> · </span>
            </>
          )}
          {minutes} min read
        </p>
      </div>
    </div>
  )
}
