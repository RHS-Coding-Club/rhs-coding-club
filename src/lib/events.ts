import { CLUB_TIMEZONE, fmtDate } from '#/lib/format'

// Pure event helpers shared by the server (check-in rules, .ics feeds, cron)
// and the browser (date tiles, countdowns, calendar links). Nothing here
// touches the database or Cloudflare bindings.

// ---------- Tags ----------

/** Tags officers can pick from. Older events may carry others; those still render. */
export const EVENT_TAGS = [
  'meeting',
  'workshop',
  'volunteering',
  'rap',
  'hackathon',
  'competition',
  'social',
] as const

const TAG_LABELS: Record<string, string> = {
  meeting: 'Meeting',
  workshop: 'Workshop',
  volunteering: 'Volunteering',
  rap: 'RAP',
  hackathon: 'Hackathon',
  competition: 'Competition',
  social: 'Social',
}

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1)
}

// ---------- Check-in codes ----------

/** 32 characters with no look-alikes: no 0/O, no 1/I. */
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const CODE_LENGTH = 6

/** A fresh 6-character code. 32 symbols, so `byte & 31` is unbiased. */
export function generateCheckInCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CODE_ALPHABET[b & 31]).join('')
}

/** What a member typed, made comparable: uppercase, no spaces or dashes. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '')
}

/** Case-insensitive match against the event's stored code. */
export function codesMatch(stored: string | null | undefined, input: string): boolean {
  if (!stored) return false
  return normalizeCode(stored) === normalizeCode(input)
}

// ---------- Time windows ----------

const HOUR = 60 * 60 * 1000

/** Check-in opens an hour before the start... */
export const CHECK_IN_LEAD_MS = 1 * HOUR
/** ...and stays open until three hours after the end. */
export const CHECK_IN_GRACE_MS = 3 * HOUR

interface Timed {
  startsAt: Date | number | string
  endsAt: Date | number | string
}

const ms = (v: Date | number | string) => new Date(v).getTime()

export function checkInWindow(ev: Timed) {
  return {
    opensAt: new Date(ms(ev.startsAt) - CHECK_IN_LEAD_MS),
    closesAt: new Date(ms(ev.endsAt) + CHECK_IN_GRACE_MS),
  }
}

/** Where `now` falls relative to the event's check-in window. */
export function checkInTiming(ev: Timed, now: Date | number): 'early' | 'open' | 'late' {
  const t = ms(now)
  const { opensAt, closesAt } = checkInWindow(ev)
  if (t < opensAt.getTime()) return 'early'
  if (t > closesAt.getTime()) return 'late'
  return 'open'
}

/** Before it starts, while it runs, or after it ends. */
export function eventPhase(ev: Timed, now: Date | number): 'upcoming' | 'live' | 'past' {
  const t = ms(now)
  if (t < ms(ev.startsAt)) return 'upcoming'
  if (t < ms(ev.endsAt)) return 'live'
  return 'past'
}

/** Whole days, hours, minutes, and seconds left (all zero once it passes). */
export function countdownParts(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000))
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

// ---------- Club-timezone formatting and parsing ----------

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CLUB_TIMEZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function zonedParts(d: Date) {
  const parts = partsFormatter.formatToParts(d)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  }
}

/** The club timezone's offset from UTC at `d`, in ms (negative for Pacific). */
function offsetAt(d: Date) {
  const p = zonedParts(d)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - (d.getTime() - d.getMilliseconds())
}

const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

/** True for a `datetime-local` value like "2026-11-03T12:30". */
export function isLocalDateTime(value: string): boolean {
  return LOCAL_INPUT.test(value)
}

/**
 * Reads a `datetime-local` value as wall-clock time in the club's timezone
 * (America/Los_Angeles), whatever timezone the browser or Worker runs in.
 */
export function clubLocalToDate(value: string): Date {
  const m = LOCAL_INPUT.exec(value)
  if (!m) throw new Error(`Not a local date-time: ${value}`)
  const [, y, mo, d, h, mi] = m.map(Number) as [
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  const wall = Date.UTC(y, mo - 1, d, h, mi)
  // Two passes settle the offset across a daylight-saving change.
  let ts = wall - offsetAt(new Date(wall))
  ts = wall - offsetAt(new Date(ts))
  return new Date(ts)
}

/** The inverse: a Date as a `datetime-local` value in the club's timezone. */
export function toClubLocalInput(value: Date | number | string): string {
  const p = zonedParts(new Date(value))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}

const tileFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CLUB_TIMEZONE,
  month: 'short',
  day: 'numeric',
  weekday: 'short',
  year: 'numeric',
})

/** Pieces for a calendar-style date tile: { month: "Nov", day: "3", weekday: "Tue" }. */
export function dateTile(value: Date | number | string) {
  const parts = tileFormatter.formatToParts(new Date(value))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''
  return {
    month: get('month'),
    day: get('day'),
    weekday: get('weekday'),
    year: get('year'),
  }
}

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CLUB_TIMEZONE,
  month: 'long',
  year: 'numeric',
})

/** "October 2026", for grouping past events. */
export function monthLabel(value: Date | number | string): string {
  return monthFormatter.format(new Date(value))
}

/**
 * "Tue, Nov 3 · 12:30 PM – 1:15 PM", or both full date-times when the event
 * runs past midnight (a hackathon weekend).
 */
export function fmtEventWhen(
  startsAt: Date | number | string,
  endsAt: Date | number | string,
): string {
  const sameDay = fmtDate(startsAt, 'date') === fmtDate(endsAt, 'date')
  return sameDay
    ? `${fmtDate(startsAt, 'datetime')} – ${fmtDate(endsAt, 'time')}`
    : `${fmtDate(startsAt, 'datetime')} – ${fmtDate(endsAt, 'datetime')}`
}

/** "12:30 PM – 1:15 PM" (or the end's date too when it's another day). */
export function fmtTimeRange(
  startsAt: Date | number | string,
  endsAt: Date | number | string,
): string {
  const sameDay = fmtDate(startsAt, 'date') === fmtDate(endsAt, 'date')
  return sameDay
    ? `${fmtDate(startsAt, 'time')} – ${fmtDate(endsAt, 'time')}`
    : `${fmtDate(startsAt, 'time')} – ${fmtDate(endsAt, 'datetime')}`
}

// ---------- Calendars ----------

export interface CalendarEvent {
  id: string
  title: string
  description: string
  location: string
  startsAt: Date
  endsAt: Date
  updatedAt?: Date
  tags?: string[]
  /** Absolute link back to the event page. */
  url: string
}

/** RFC 5545 TEXT escaping: backslash, semicolon, comma, and newlines. */
export function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

/** UTC form: 20261103T193000Z. */
export function icsDate(value: Date): string {
  return value
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
    .replace(/[-:]/g, '')
}

const encoder = new TextEncoder()

/**
 * Folds a content line at 75 octets (RFC 5545 §3.1): continuation lines
 * start with one space. Splits on code points, never inside a UTF-8 sequence.
 */
export function foldLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line
  const out: string[] = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const n = encoder.encode(ch).length
    if (size + n > 75) {
      out.push(current)
      current = ' '
      size = 1
    }
    current += ch
    size += n
  }
  out.push(current)
  return out.join('\r\n')
}

function vevent(ev: CalendarEvent, stamp: Date): string[] {
  const description = [ev.description.trim(), ev.url].filter(Boolean).join('\n\n')
  const lines = [
    'BEGIN:VEVENT',
    `UID:${ev.id}@rhs-coding-club`,
    `DTSTAMP:${icsDate(stamp)}`,
    ...(ev.updatedAt ? [`LAST-MODIFIED:${icsDate(ev.updatedAt)}`] : []),
    `DTSTART:${icsDate(ev.startsAt)}`,
    `DTEND:${icsDate(ev.endsAt)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    `LOCATION:${icsEscape(ev.location)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `URL:${ev.url}`,
  ]
  if (ev.tags && ev.tags.length > 0) {
    lines.push(`CATEGORIES:${ev.tags.map((t) => icsEscape(tagLabel(t))).join(',')}`)
  }
  lines.push('END:VEVENT')
  return lines
}

/** A whole VCALENDAR document (CRLF line endings, folded lines). */
export function buildIcs(
  events: CalendarEvent[],
  opts: { name: string; now?: Date },
): string {
  const stamp = opts.now ?? new Date()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RHS Coding Club//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(opts.name)}`,
    `X-WR-TIMEZONE:${CLUB_TIMEZONE}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...events.flatMap((ev) => vevent(ev, ev.updatedAt ?? stamp)),
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

/** Prefilled "add to Google Calendar" link. */
export function googleCalendarUrl(ev: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${icsDate(ev.startsAt)}/${icsDate(ev.endsAt)}`,
    details: [ev.description.trim(), ev.url].filter(Boolean).join('\n\n'),
    location: ev.location,
    ctz: CLUB_TIMEZONE,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** https://x.org/events/calendar.ics -> webcal://x.org/events/calendar.ics */
export function webcalUrl(httpUrl: string): string {
  return httpUrl.replace(/^https?:\/\//, 'webcal://')
}
