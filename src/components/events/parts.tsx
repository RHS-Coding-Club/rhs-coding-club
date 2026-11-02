import { dateTile, tagLabel } from '#/lib/events'
import { cn } from '#/lib/utils'
import { UserAvatar } from '#/components/user-avatar'

/**
 * Calendar-page tile: month on a navy band, the day large underneath. Used
 * on cards, the spotlight, and as the event page's cover when there's no image.
 */
export function DateTile({
  date,
  size = 'md',
  className,
}: {
  date: Date | number | string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const t = dateTile(date)
  return (
    <div
      className={cn(
        'bg-card ring-border/70 flex shrink-0 flex-col overflow-hidden text-center ring-1',
        size === 'sm' && 'w-12 rounded-xl',
        size === 'md' && 'w-16 rounded-2xl',
        size === 'lg' && 'w-24 rounded-3xl',
        size === 'xl' && 'h-full w-full rounded-[inherit] ring-0',
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          'bg-brand-navy font-mono font-medium tracking-[0.12em] text-[#e6edf5] uppercase',
          size === 'sm' && 'py-0.5 text-[10px]',
          size === 'md' && 'py-1 text-[11px]',
          size === 'lg' && 'py-1.5 text-xs',
          size === 'xl' && 'py-4 text-xl',
        )}
      >
        {t.month}
      </div>
      <div
        className={cn(
          'flex flex-1 flex-col items-center justify-center',
          size === 'sm' && 'py-1',
          size === 'md' && 'py-1.5',
          size === 'lg' && 'py-2.5',
          size === 'xl' && 'gap-2 py-6',
        )}
      >
        <span
          className={cn(
            'leading-none font-semibold tracking-[-0.04em] tabular-nums',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-4xl',
            size === 'xl' && 'text-[7.5rem]',
          )}
        >
          {t.day}
        </span>
        <span
          className={cn(
            'text-muted-foreground font-mono',
            size === 'sm' && 'hidden',
            size === 'md' && 'mt-1 text-[10px]',
            size === 'lg' && 'mt-1.5 text-xs',
            size === 'xl' && 'text-lg',
          )}
        >
          {size === 'xl' ? `${t.weekday} · ${t.year}` : t.weekday}
        </span>
      </div>
    </div>
  )
}

export function TagPill({ tag, className }: { tag: string; className?: string }) {
  return (
    <span
      className={cn(
        'bg-brand-sky/12 text-foreground/80 ring-brand-sky/25 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        className,
      )}
    >
      {tagLabel(tag)}
    </span>
  )
}

export function TagList({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Tags">
      {tags.map((t) => (
        <li key={t}>
          <TagPill tag={t} />
        </li>
      ))}
    </ul>
  )
}

export interface Face {
  id: string
  name: string
  image: string | null
  avatarKey: string | null
}

/** Overlapping avatars of who's going, with the count beside them. */
export function FaceStack({
  faces,
  count,
  max = 5,
  size = 'md',
  label = 'going',
  className,
}: {
  faces: Face[]
  count: number
  max?: number
  size?: 'sm' | 'md'
  label?: string
  className?: string
}) {
  const shown = faces.slice(0, max)
  const extra = Math.max(0, count - shown.length)
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {shown.length > 0 && (
        <ul
          className={cn('flex', size === 'sm' ? '-space-x-1.5' : '-space-x-2')}
          aria-hidden="true"
        >
          {shown.map((f) => (
            <li key={f.id}>
              <UserAvatar
                user={f}
                className={cn(
                  'ring-background ring-2',
                  size === 'sm' ? 'size-7 text-[11px]' : 'size-9 text-[13px]',
                )}
              />
            </li>
          ))}
          {extra > 0 && (
            <li
              className={cn(
                'bg-muted text-muted-foreground ring-background grid place-items-center rounded-full font-mono ring-2',
                size === 'sm' ? 'size-7 text-[10px]' : 'size-9 text-xs',
              )}
            >
              +{extra}
            </li>
          )}
        </ul>
      )}
      <p className={cn('text-sm', count === 0 && 'text-muted-foreground')}>
        {count === 0 ? (
          'Be the first to RSVP'
        ) : (
          <>
            <span className="font-semibold tabular-nums">{count}</span>{' '}
            <span className="text-muted-foreground">{label}</span>
          </>
        )}
      </p>
    </div>
  )
}
