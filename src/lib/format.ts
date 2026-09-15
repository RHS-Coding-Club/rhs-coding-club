/** "Ada Lovelace" -> "AL", "ada" -> "A". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

/** Lowercase, hyphenated, ASCII-only slug. Empty input yields "". */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** The club's timezone. All human-readable dates render in it on server and client alike. */
export const CLUB_TIMEZONE = 'America/Los_Angeles'

const DATE_STYLES = {
  /** Sep 15, 2026 */
  date: { month: 'short', day: 'numeric', year: 'numeric' },
  /** Sep 15 */
  short: { month: 'short', day: 'numeric' },
  /** Tue, Sep 15 · 12:30 PM */
  datetime: {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
  /** 12:30 PM */
  time: { hour: 'numeric', minute: '2-digit' },
  /** Tuesday */
  weekday: { weekday: 'long' },
} satisfies Record<string, Intl.DateTimeFormatOptions>

export type DateStyle = keyof typeof DATE_STYLES

/**
 * Deterministic date formatting: the same string on the Worker and in the
 * browser, so server-rendered dates never cause hydration mismatches.
 */
export function fmtDate(
  value: Date | number | string,
  style: DateStyle = 'date',
): string {
  const d = value instanceof Date ? value : new Date(value)
  const text = new Intl.DateTimeFormat('en-US', {
    ...DATE_STYLES[style],
    timeZone: CLUB_TIMEZONE,
  }).format(d)
  return style === 'datetime' ? text.replace(/, (\d+:\d+ [AP]M)$/, ' · $1') : text
}
