import type { BadgeRarity } from '#/db/schema'

/**
 * Badge rarity colors from src/styles.css, readable on both themes. `token` is
 * for canvas components via useCssColors; `color` is for CSS; `dot` and `chip`
 * are Tailwind classes.
 */
export const RARITY: Record<
  BadgeRarity,
  { label: string; token: string; color: string; dot: string; chip: string }
> = {
  common: {
    label: 'Common',
    token: '--rarity-common',
    color: 'var(--rarity-common)',
    dot: 'bg-rarity-common',
    chip: 'text-rarity-common bg-rarity-common/10 ring-rarity-common/20',
  },
  rare: {
    label: 'Rare',
    token: '--rarity-rare',
    color: 'var(--rarity-rare)',
    dot: 'bg-rarity-rare',
    chip: 'text-rarity-rare bg-rarity-rare/10 ring-rarity-rare/25',
  },
  epic: {
    label: 'Epic',
    token: '--rarity-epic',
    color: 'var(--rarity-epic)',
    dot: 'bg-rarity-epic',
    chip: 'text-rarity-epic bg-rarity-epic/10 ring-rarity-epic/25',
  },
  legendary: {
    label: 'Legendary',
    token: '--rarity-legendary',
    color: 'var(--rarity-legendary)',
    dot: 'bg-rarity-legendary',
    chip: 'text-rarity-legendary bg-rarity-legendary/10 ring-rarity-legendary/30',
  },
}
