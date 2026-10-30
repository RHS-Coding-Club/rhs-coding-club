import type { BadgeRarity } from '#/db/schema'

/** Badge rarity colors, readable on both themes. `ring` and `dot` are Tailwind classes. */
export const RARITY: Record<
  BadgeRarity,
  { label: string; color: string; dot: string; chip: string }
> = {
  common: {
    label: 'Common',
    color: '#94a3b8',
    dot: 'bg-slate-400',
    chip: 'text-slate-600 bg-slate-500/10 ring-slate-500/20 dark:text-slate-300',
  },
  rare: {
    label: 'Rare',
    color: '#5fb2ee',
    dot: 'bg-brand-sky',
    chip: 'text-sky-700 bg-sky-500/10 ring-sky-500/25 dark:text-sky-300',
  },
  epic: {
    label: 'Epic',
    color: '#a78bfa',
    dot: 'bg-violet-400',
    chip: 'text-violet-700 bg-violet-500/10 ring-violet-500/25 dark:text-violet-300',
  },
  legendary: {
    label: 'Legendary',
    color: '#f5b544',
    dot: 'bg-amber-400',
    chip: 'text-amber-700 bg-amber-500/10 ring-amber-500/30 dark:text-amber-300',
  },
}
