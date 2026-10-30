import { describe, expect, it } from 'vitest'
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  buildIcs,
  checkInTiming,
  checkInWindow,
  clubLocalToDate,
  codesMatch,
  countdownParts,
  dateTile,
  eventPhase,
  fmtEventWhen,
  foldLine,
  generateCheckInCode,
  googleCalendarUrl,
  icsDate,
  icsEscape,
  normalizeCode,
  tagLabel,
  toClubLocalInput,
  webcalUrl,
} from '#/lib/events'
import { checkInSchema, eventFormSchema } from '#/lib/schemas/events'

const HOUR = 3600_000

describe('check-in codes', () => {
  it('uses an alphabet without look-alike characters', () => {
    expect(CODE_ALPHABET).toHaveLength(32)
    for (const ch of ['0', 'O', '1', 'I']) expect(CODE_ALPHABET).not.toContain(ch)
    expect(new Set(CODE_ALPHABET).size).toBe(32)
  })

  it('generates 6 characters drawn only from the alphabet', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) {
      const code = generateCheckInCode()
      expect(code).toHaveLength(CODE_LENGTH)
      for (const ch of code) expect(CODE_ALPHABET).toContain(ch)
      seen.add(code)
    }
    expect(seen.size).toBeGreaterThan(495)
  })

  it('matches case-insensitively and ignores spaces and dashes', () => {
    expect(normalizeCode(' ab3-k7q ')).toBe('AB3K7Q')
    expect(codesMatch('AB3K7Q', 'ab3k7q')).toBe(true)
    expect(codesMatch('AB3K7Q', 'AB3 K7Q')).toBe(true)
    expect(codesMatch('AB3K7Q', 'AB3K7R')).toBe(false)
    expect(codesMatch(null, 'AB3K7Q')).toBe(false)
  })

  it('validates typed codes to exactly 6 normalized characters', () => {
    expect(checkInSchema.parse({ eventId: 'e1', code: 'ab3-k7q' }).code).toBe('AB3K7Q')
    expect(checkInSchema.safeParse({ eventId: 'e1', code: 'abc' }).success).toBe(false)
  })
})

describe('time windows', () => {
  const ev = {
    startsAt: new Date('2026-11-03T20:30:00Z'),
    endsAt: new Date('2026-11-03T21:15:00Z'),
  }

  it('opens an hour before the start and closes three hours after the end', () => {
    const { opensAt, closesAt } = checkInWindow(ev)
    expect(opensAt.toISOString()).toBe('2026-11-03T19:30:00.000Z')
    expect(closesAt.toISOString()).toBe('2026-11-04T00:15:00.000Z')
  })

  it('classifies now against the window, inclusive at both edges', () => {
    const start = ev.startsAt.getTime()
    const end = ev.endsAt.getTime()
    expect(checkInTiming(ev, start - HOUR - 1)).toBe('early')
    expect(checkInTiming(ev, start - HOUR)).toBe('open')
    expect(checkInTiming(ev, start)).toBe('open')
    expect(checkInTiming(ev, end + 3 * HOUR)).toBe('open')
    expect(checkInTiming(ev, end + 3 * HOUR + 1)).toBe('late')
  })

  it('knows when an event is upcoming, live, or past', () => {
    expect(eventPhase(ev, ev.startsAt.getTime() - 1)).toBe('upcoming')
    expect(eventPhase(ev, ev.startsAt)).toBe('live')
    expect(eventPhase(ev, ev.endsAt)).toBe('past')
  })

  it('breaks a countdown into whole units', () => {
    expect(countdownParts(2 * 86_400_000 + 3 * HOUR + 4 * 60_000 + 5_500)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    })
    expect(countdownParts(-10)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })
})

describe('club timezone', () => {
  it('reads datetime-local values as Pacific wall-clock time', () => {
    // PDT (UTC-7) in October, PST (UTC-8) in December.
    expect(clubLocalToDate('2026-10-20T12:30').toISOString()).toBe(
      '2026-10-20T19:30:00.000Z',
    )
    expect(clubLocalToDate('2026-12-08T12:30').toISOString()).toBe(
      '2026-12-08T20:30:00.000Z',
    )
  })

  it('survives the daylight-saving switch', () => {
    // DST ends Nov 1, 2026 at 2 AM Pacific.
    expect(clubLocalToDate('2026-11-01T09:00').toISOString()).toBe(
      '2026-11-01T17:00:00.000Z',
    )
    expect(clubLocalToDate('2026-10-31T23:00').toISOString()).toBe(
      '2026-11-01T06:00:00.000Z',
    )
  })

  it('round-trips through toClubLocalInput', () => {
    for (const v of ['2026-03-08T12:00', '2026-07-04T00:05', '2026-11-03T23:59']) {
      expect(toClubLocalInput(clubLocalToDate(v))).toBe(v)
    }
  })

  it('formats tiles and ranges in the club timezone', () => {
    // 05:00 UTC on Nov 4 is still Nov 3 in California.
    expect(dateTile('2026-11-04T05:00:00Z')).toMatchObject({
      month: 'Nov',
      day: '3',
      weekday: 'Tue',
    })
    expect(
      fmtEventWhen(new Date('2026-11-03T20:30:00Z'), new Date('2026-11-03T21:15:00Z')),
    ).toBe('Tue, Nov 3 · 12:30 PM – 1:15 PM')
    expect(
      fmtEventWhen(new Date('2027-02-06T17:00:00Z'), new Date('2027-02-07T23:00:00Z')),
    ).toBe('Sat, Feb 6 · 9:00 AM – Sun, Feb 7 · 3:00 PM')
  })
})

describe('event form schema', () => {
  const base = {
    title: 'Lunch meeting',
    description: '',
    startsAt: '2026-11-03T12:30',
    endsAt: '2026-11-03T13:15',
    location: "Mr. Derrick's classroom",
    tags: ['Meeting'],
    coverKey: null,
  }

  it('lowercases tags and accepts a valid event', () => {
    const parsed = eventFormSchema.parse(base)
    expect(parsed.tags).toEqual(['meeting'])
  })

  it('rejects an end before the start', () => {
    const r = eventFormSchema.safeParse({ ...base, endsAt: '2026-11-03T12:00' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.path).toEqual(['endsAt'])
  })
})

describe('ics', () => {
  it('escapes text values', () => {
    expect(icsEscape('a,b;c\\d\nnext')).toBe('a\\,b\\;c\\\\d\\nnext')
    expect(icsEscape('line\r\nbreak')).toBe('line\\nbreak')
  })

  it('formats dates in UTC basic form', () => {
    expect(icsDate(new Date('2026-11-03T20:30:00.123Z'))).toBe('20261103T203000Z')
  })

  it('folds long lines at 75 octets without splitting characters', () => {
    const line = `DESCRIPTION:${'é'.repeat(80)}`
    const folded = foldLine(line)
    const parts = folded.split('\r\n')
    expect(parts.length).toBeGreaterThan(1)
    for (const p of parts)
      expect(new TextEncoder().encode(p).length).toBeLessThanOrEqual(75)
    for (const p of parts.slice(1)) expect(p.startsWith(' ')).toBe(true)
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join('')).toBe(line)
    expect(foldLine('SHORT:line')).toBe('SHORT:line')
  })

  it('builds a calendar with one VEVENT per event and CRLF endings', () => {
    const ics = buildIcs(
      [
        {
          id: 'e1',
          title: 'H2O Hackathon, 2027',
          description: 'Bring a laptop; we bring food.',
          location: 'RHS Library',
          startsAt: new Date('2027-02-06T17:00:00Z'),
          endsAt: new Date('2027-02-07T23:00:00Z'),
          updatedAt: new Date('2026-10-01T00:00:00Z'),
          tags: ['hackathon', 'rap'],
          url: 'https://club.test/events/e1',
        },
      ],
      { name: 'RHS Coding Club', now: new Date('2026-10-29T00:00:00Z') },
    )
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).not.toMatch(/[^\r]\n/)
    expect(ics).toContain('UID:e1@rhs-coding-club')
    expect(ics).toContain('DTSTART:20270206T170000Z')
    expect(ics).toContain('DTEND:20270207T230000Z')
    expect(ics).toContain('SUMMARY:H2O Hackathon\\, 2027')
    expect(ics).toContain('CATEGORIES:Hackathon,RAP')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
  })

  it('links to Google Calendar and webcal', () => {
    const url = new URL(
      googleCalendarUrl({
        id: 'e1',
        title: 'Lunch meeting',
        description: '',
        location: 'Room 12',
        startsAt: new Date('2026-11-03T20:30:00Z'),
        endsAt: new Date('2026-11-03T21:15:00Z'),
        url: 'https://club.test/events/e1',
      }),
    )
    expect(url.searchParams.get('dates')).toBe('20261103T203000Z/20261103T211500Z')
    expect(url.searchParams.get('text')).toBe('Lunch meeting')
    expect(webcalUrl('https://club.test/events/calendar.ics')).toBe(
      'webcal://club.test/events/calendar.ics',
    )
  })

  it('labels known and unknown tags', () => {
    expect(tagLabel('rap')).toBe('RAP')
    expect(tagLabel('robotics')).toBe('Robotics')
  })
})
