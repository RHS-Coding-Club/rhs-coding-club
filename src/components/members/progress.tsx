import { cn } from '#/lib/utils'
import type { CollectionBadge } from '#/services/members'

// Progress readouts shared by the dashboard and the public profile: what a
// badge threshold counts, how close each unearned badge is, and the meter
// that shows it.

/** What a badge threshold counts, as a noun for "3 more ___". */
export const UNIT: Record<string, [one: string, many: string]> = {
  points: ['point', 'points'],
  challenges: ['solve', 'solves'],
  events: ['check-in', 'check-ins'],
  projects: ['project', 'projects'],
}

export function plural(n: number, [one, many]: [string, string]) {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`
}

/** "3 solves to go" for an auto-awarded badge; null for officer-only ones. */
export function toGo(b: CollectionBadge) {
  if (b.current === null || !b.threshold) return null
  return `${plural(Math.max(0, b.threshold - b.current), UNIT[b.criteriaType] ?? ['more', 'more'])} to go`
}

/** Unheld auto-award badges, closest to unlocking first. */
export function nextBadges(badges: CollectionBadge[], take = 3) {
  return badges
    .filter((b) => !b.awardedAt && b.current !== null && b.threshold)
    .map((b) => ({
      ...b,
      ratio: Math.min(1, (b.current ?? 0) / (b.threshold ?? 1)),
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, take)
}

/**
 * Weeks in a row with points, counting back from this week. A quiet week so
 * far doesn't break it: the streak runs through last week until Monday ends.
 */
export function streakWeeks(weeks: { points: number }[]) {
  let i = weeks.length - 1
  if (i >= 0 && (weeks[i]?.points ?? 0) <= 0) i -= 1
  let n = 0
  for (; i >= 0 && (weeks[i]?.points ?? 0) > 0; i -= 1) n += 1
  return n
}

/** A thin progress track. Fills from the start edge with a transform, not width. */
export function Meter({
  value,
  color = 'var(--primary)',
  className,
  label,
}: {
  value: number
  color?: string
  className?: string
  label: string
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn('bg-foreground/8 h-1.5 overflow-hidden rounded-full', className)}
    >
      <div
        className="h-full origin-left rounded-full"
        style={{ background: color, transform: `scaleX(${pct / 100})` }}
      />
    </div>
  )
}
