import type { BadgeRarity } from '#/db/schema'
import { cn } from '#/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { RARITY } from './rarity'

/**
 * A few small rarity-colored dots for a leaderboard row, highest rarity
 * first, with "+N" when there are more. Each dot names its badge on hover
 * or focus. Wrap the page in a TooltipProvider.
 */
export function BadgePips({
  badges,
  max = 4,
  className,
}: {
  badges: { id: string; name: string; rarity: BadgeRarity }[]
  max?: number
  className?: string
}) {
  if (badges.length === 0) return null
  const shown = badges.slice(0, max)
  const more = badges.length - shown.length
  return (
    <ul
      className={cn('flex items-center gap-1', className)}
      aria-label={`${badges.length} badge${badges.length === 1 ? '' : 's'}`}
    >
      {shown.map((b) => (
        <li key={b.id} className="flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                aria-label={`${b.name}, ${RARITY[b.rarity].label.toLowerCase()} badge`}
                className={cn(
                  'focus-visible:ring-ring block size-2.5 rounded-full ring-2 ring-[var(--card)] outline-none focus-visible:ring-2',
                  RARITY[b.rarity].dot,
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              {b.name}
              <span className="opacity-60"> · {RARITY[b.rarity].label}</span>
            </TooltipContent>
          </Tooltip>
        </li>
      ))}
      {more > 0 && (
        <li className="text-muted-foreground font-mono text-[11px]">+{more}</li>
      )}
    </ul>
  )
}
