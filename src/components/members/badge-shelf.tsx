import { Award } from 'lucide-react'
import type { BadgeRarity } from '#/db/schema'
import StarBorder from '#/components/bits/StarBorder'
import { fileUrl } from '#/lib/files'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { RARITY } from './rarity'

export interface ShelfBadge {
  id: string
  name: string
  description: string
  rarity: BadgeRarity
  imageKey?: string | null
  awardedAt: Date
}

/**
 * A member's badges as tiles. Epic and legendary ones sit inside React Bits
 * Star Border, a light that laps the tile's edge in the rarity's color, so
 * the rare stuff reads at a glance. Every tile explains itself on hover or
 * focus: what it is for and when it was earned.
 */
export function BadgeShelf({ badges, dark }: { badges: ShelfBadge[]; dark: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {badges.map((b) => (
        <li key={b.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {b.rarity === 'epic' || b.rarity === 'legendary' ? (
                <StarBorder
                  as="div"
                  tabIndex={0}
                  theme={dark ? 'dark' : 'light'}
                  color={RARITY[b.rarity].color}
                  radius={24}
                  thickness={1.5}
                  stars={2}
                  duration={b.rarity === 'legendary' ? 4 : 6}
                  glow={1}
                  sparkle={b.rarity === 'legendary'}
                  hover="brighten"
                  clickPulse
                  className="flex! h-full w-full items-stretch! justify-start! p-0! font-normal!"
                  backgroundColor={`color-mix(in oklab, ${RARITY[b.rarity].color} 7%, var(--card))`}
                  textColor="var(--foreground)"
                  aria-label={`${b.name}, ${RARITY[b.rarity].label} badge`}
                >
                  <Tile badge={b} />
                </StarBorder>
              ) : (
                <div
                  tabIndex={0}
                  aria-label={`${b.name}, ${RARITY[b.rarity].label} badge`}
                  className="bg-card ring-border/70 focus-visible:ring-ring h-full rounded-3xl ring-1 outline-none focus-visible:ring-2"
                >
                  <Tile badge={b} />
                </div>
              )}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-60 text-left">
              <p className="font-medium">{b.description || b.name}</p>
              <p className="mt-0.5 opacity-70">Earned {fmtDate(b.awardedAt)}</p>
            </TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  )
}

function Tile({ badge: b }: { badge: ShelfBadge }) {
  const r = RARITY[b.rarity]
  return (
    <div className="flex h-36 w-full flex-col items-start justify-between p-4 text-left">
      <span
        className="grid size-11 place-items-center overflow-hidden rounded-2xl"
        style={{
          background: `color-mix(in oklab, ${r.color} 16%, transparent)`,
          color: r.color,
        }}
      >
        {b.imageKey ? (
          <img src={fileUrl(b.imageKey)} alt="" className="size-full object-cover" />
        ) : (
          <Award className="size-5" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium tracking-tight">{b.name}</span>
        <span
          className={cn(
            'mt-1.5 inline-flex rounded-full px-2 py-0.5 font-mono text-[10.5px] ring-1',
            r.chip,
          )}
        >
          {r.label}
        </span>
      </span>
    </div>
  )
}
