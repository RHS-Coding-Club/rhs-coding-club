import { Award } from 'lucide-react'
import { fileUrl } from '#/lib/files'
import { RARITY_COLOR, RARITY_LABEL, criteriaSummary } from '#/lib/schemas/badges'
import type { Criteria, Rarity } from '#/lib/schemas/badges'
import { cn } from '#/lib/utils'

/** The badge medallion: image (or an award glyph) in a ring tinted by rarity. */
export function BadgeMedal({
  imageKey,
  rarity,
  size = 'md',
  muted,
}: {
  imageKey: string | null
  rarity: Rarity
  size?: 'sm' | 'md' | 'lg'
  muted?: boolean
}) {
  const color = RARITY_COLOR[rarity]
  const px = size === 'lg' ? 112 : size === 'md' ? 56 : 36
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full',
        muted && 'opacity-50 grayscale',
      )}
      style={{
        width: px,
        height: px,
        background: `radial-gradient(circle at 30% 25%, ${color}55, ${color}14 70%)`,
        boxShadow: `inset 0 0 0 ${size === 'sm' ? 2 : 3}px ${color}, 0 ${px / 6}px ${px / 2.5}px -${px / 6}px ${color}88`,
      }}
    >
      {imageKey ? (
        <img
          src={fileUrl(imageKey)}
          alt=""
          className="size-full object-cover p-[12%]"
          style={{ borderRadius: '9999px' }}
        />
      ) : (
        <Award
          style={{ width: px * 0.46, height: px * 0.46, color }}
          strokeWidth={1.75}
        />
      )}
    </span>
  )
}

/** Live preview card for the badge editor: how the badge reads on a profile. */
export function BadgePreview({
  name,
  description,
  imageKey,
  rarity,
  criteriaType,
  threshold,
  autoAward,
  isActive,
}: {
  name: string
  description: string
  imageKey: string | null
  rarity: Rarity
  criteriaType: Criteria
  threshold: number | null
  autoAward: boolean
  isActive: boolean
}) {
  return (
    <div
      className="bg-card ring-border/70 relative overflow-hidden rounded-3xl p-6 text-center ring-1"
      aria-label="Badge preview"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28 opacity-60"
        style={{
          background: `radial-gradient(60% 100% at 50% 0%, ${RARITY_COLOR[rarity]}33, transparent)`,
        }}
      />
      <div className="relative flex flex-col items-center">
        <BadgeMedal imageKey={imageKey} rarity={rarity} size="lg" muted={!isActive} />
        <p className="mt-4 text-lg font-semibold tracking-tight">
          {name || 'Badge name'}
        </p>
        <p
          className="mt-1 text-xs font-medium tracking-wide uppercase"
          style={{ color: RARITY_COLOR[rarity] }}
        >
          {RARITY_LABEL[rarity]}
        </p>
        <p className="text-muted-foreground mt-3 text-sm">
          {description || 'How members earn it.'}
        </p>
        <p className="bg-muted text-muted-foreground mt-4 rounded-full px-3 py-1 font-mono text-xs">
          {criteriaSummary({ criteriaType, threshold, autoAward })}
        </p>
        {!isActive && (
          <p className="text-muted-foreground mt-3 text-xs">
            Hidden: inactive badges don’t show anywhere.
          </p>
        )}
      </div>
    </div>
  )
}
