import { Award } from '#/components/icons/award'
import { Lock } from '#/components/icons/lock'
import type { BadgeRarity } from '#/db/schema'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import type { CollectionBadge } from '#/services/members'
import { Meter, toGo } from './progress'
import { RARITY } from './rarity'

export const RARITY_ORDER: BadgeRarity[] = ['legendary', 'epic', 'rare', 'common']

/** Every badge as a slot. Collected ones are lit cards; the rest show what fills them. */
export function BadgeBinder({ collection }: { collection: CollectionBadge[] }) {
  const sorted = [...collection].sort(
    (a, b) =>
      Number(!!b.awardedAt) - Number(!!a.awardedAt) ||
      RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity),
  )
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {sorted.map((b) => {
        const r = RARITY[b.rarity]
        if (!b.awardedAt) {
          const remaining = toGo(b)
          return (
            <li
              key={b.id}
              className="badge-slot border-border flex aspect-[3/4] flex-col rounded-3xl border border-dashed p-4"
            >
              <span className="text-muted-foreground flex items-center justify-between text-[11px]">
                <span className="font-mono">{r.label}</span>
                <Lock className="size-3.5" aria-hidden="true" />
              </span>
              <span className="mt-auto">
                <span className="text-foreground/75 block font-medium">{b.name}</span>
                <span className="text-muted-foreground mt-1 block text-xs text-pretty">
                  {remaining ?? 'Handed out by officers'}
                </span>
                {remaining && b.threshold ? (
                  <Meter
                    value={(b.current ?? 0) / b.threshold}
                    color={r.color}
                    className="mt-3"
                    label={`${b.name} progress`}
                  />
                ) : null}
              </span>
            </li>
          )
        }
        const shiny = b.rarity === 'epic' || b.rarity === 'legendary'
        return (
          <li key={b.id}>
            <div
              tabIndex={0}
              className={cn(
                'ring-border/70 focus-visible:ring-ring flex aspect-[3/4] flex-col rounded-3xl p-4 ring-1 outline-none focus-visible:ring-2',
                shiny && 'badge-foil',
              )}
              style={{
                background: `linear-gradient(165deg, color-mix(in oklab, ${r.color} 22%, var(--card)) 0%, var(--card) 70%)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${r.color} 30%, transparent)`,
              }}
            >
              <span className="flex items-center justify-between text-[11px]">
                <span className="font-mono" style={{ color: r.color }}>
                  {r.label}
                </span>
                <span className="text-muted-foreground font-mono">
                  {fmtDate(b.awardedAt, 'short')}
                </span>
              </span>
              <span
                className="mx-auto my-auto grid size-20 place-items-center rounded-full"
                style={{
                  color: r.color,
                  background: `radial-gradient(circle at 32% 25%, color-mix(in oklab, ${r.color} 50%, transparent), color-mix(in oklab, ${r.color} 12%, transparent) 72%)`,
                  boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${r.color} 60%, transparent), 0 14px 30px -14px ${r.color}`,
                }}
              >
                <Award className="size-9" aria-hidden="true" />
              </span>
              <span className="block font-semibold">{b.name}</span>
              <span className="text-muted-foreground mt-1 line-clamp-2 block text-xs text-pretty">
                {b.description}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
