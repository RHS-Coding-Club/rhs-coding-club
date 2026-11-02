import { clubLocalToDate, generateCheckInCode, toClubLocalInput } from '#/lib/events'
import { DAY, q } from './util'
import type { SeedContext } from './util'

/**
 * Events, RSVPs, and attendance for a realistic fall semester: weekly lunch
 * meetings in Mr. Derrick's classroom, teaching days at the Ripon Afterschool
 * Program, a hackathon prep workshop, and the H2O hackathon. Dates are
 * relative to the seed time and land on real club-local times.
 *
 * Fixed ids other modules rely on: `e_seed_1` is the next lunch meeting (with
 * RSVPs); `e_seed_2` is the RAP teaching day 14 days ago whose attendance
 * points (`pe_seed_*`) the members module seeds.
 */
export function seedEvents({ now }: SeedContext): string[] {
  const today = toClubLocalInput(now).slice(0, 10)
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay()

  /** Club-local calendar date `offset` days from today, as YYYY-MM-DD. */
  const day = (offset: number) =>
    new Date(Date.parse(`${today}T00:00:00Z`) + offset * DAY).toISOString().slice(0, 10)
  /** Offset (in days) of the Tuesday `weeks` weeks from this one. Week 0 is the next Tuesday. */
  const tuesday = (weeks: number) => ((2 - weekday + 7) % 7 || 7) + weeks * 7
  const at = (offset: number, time: string) =>
    clubLocalToDate(`${day(offset)}T${time}`).getTime()

  type Seed = {
    id: string
    title: string
    description: string
    start: number
    end: number
    location: string
    tags: string[]
  }

  const ROOM = "Mr. Derrick's classroom"
  const lunch = (
    id: string,
    offset: number,
    title: string,
    description: string,
  ): Seed => ({
    id,
    title,
    description,
    start: at(offset, '12:30'),
    end: at(offset, '13:15'),
    location: ROOM,
    tags: ['meeting'],
  })
  const rap = (id: string, offset: number, title: string, description: string): Seed => ({
    id,
    title,
    description,
    start: at(offset, '15:30'),
    end: at(offset, '17:00'),
    location: 'Ripon Elementary, Room 4',
    tags: ['volunteering', 'rap'],
  })

  const events: Seed[] = [
    // ---------- Past ----------
    lunch(
      'e_seed_3',
      tuesday(-9),
      'Kickoff: what we are building this year',
      'First meeting of the year. Meet the officers, hear how points and badges work, and sign up for the RAP teaching rotation. New members welcome, no experience needed.',
    ),
    lunch(
      'e_seed_4',
      tuesday(-8),
      'Python warm-up: loops and lists',
      'A gentle start for anyone new to Python. We solve three short problems together on the projector, then you try the weekly challenge.',
    ),
    lunch(
      'e_seed_5',
      tuesday(-7),
      'Git and GitHub, for real this time',
      'Clone, branch, commit, push, open a pull request. Bring a laptop. By the end you will have your first commit in the club org.',
    ),
    rap(
      'e_seed_6',
      tuesday(-6) + 2,
      'RAP teaching day: Scratch animations',
      'Teach Ripon Afterschool Program students to animate a sprite in Scratch. Four volunteers per table. We leave from the RHS front office at 3:15.',
    ),
    lunch(
      'e_seed_7',
      tuesday(-5),
      'Weekly challenge review: two pointers',
      'We walk through the two-pointer solutions people submitted, compare approaches, and talk about why some ran faster.',
    ),
    lunch(
      'e_seed_8',
      tuesday(-4),
      'Build a Discord bot in 30 minutes',
      'Live coding a small Discord bot in Python that answers trivia. Fork the starter repo before lunch if you want to follow along.',
    ),
    lunch(
      'e_seed_9',
      tuesday(-3),
      'Intro to recursion',
      'Factorials, Fibonacci, and drawing a fractal tree. Bring paper: we trace the call stack by hand before we touch a keyboard.',
    ),
    {
      id: 'e_seed_2',
      title: 'RAP teaching day: paper circuits',
      description:
        'Teach afterschool students STEM and art principles through interactive activities. This round: building paper circuits with LED stickers.',
      start: at(-14, '15:30'),
      end: at(-14, '17:00'),
      location: 'Ripon Elementary, Room 4',
      tags: ['volunteering', 'rap'],
    },
    lunch(
      'e_seed_10',
      tuesday(-2),
      'Web basics: HTML, CSS, and a deploy',
      'Write a one-page site and put it online before the bell. We cover the box model, flexbox, and pushing to GitHub Pages.',
    ),
    lunch(
      'e_seed_11',
      tuesday(-1),
      'Data structures speed round',
      'Stacks, queues, sets, and maps in twenty minutes, then a team quiz. Winners get bonus points.',
    ),

    // ---------- Upcoming ----------
    lunch(
      'e_seed_1',
      tuesday(0),
      'H2O hackathon team formation',
      'Ripon Afterschool Program volunteer dates, H2O hackathon groups, and more. Come with an idea or come find a team; we match everyone before the bell.',
    ),
    rap(
      'e_seed_12',
      tuesday(0) + 2,
      'RAP teaching day: build a maze game',
      'Afterschool students design a maze in Scratch and code a sprite to solve it. Volunteers lead one table each. Sign the permission slip in the office.',
    ),
    lunch(
      'e_seed_13',
      tuesday(1),
      'Talking to APIs',
      'Fetch real data (weather, Pokemon, NASA photos) from a public API and show it on a page. Good prep for hackathon projects.',
    ),
    {
      id: 'e_seed_14',
      title: 'Hackathon prep: shipping in a day',
      description:
        'How to scope an idea that fits in one day, split work across a team, and demo something that runs. Templates and starter repos provided.',
      start: at(tuesday(2) + 1, '15:15'),
      end: at(tuesday(2) + 1, '16:30'),
      location: ROOM,
      tags: ['workshop', 'hackathon'],
    },
    lunch(
      'e_seed_19',
      tuesday(2),
      'Sorting, visualized',
      'Bubble, insertion, merge, and quick sort racing each other on the projector. Then you predict which one wins on a nearly sorted list.',
    ),
    lunch(
      'e_seed_15',
      tuesday(4),
      'H2O idea pitches',
      'Every team gets two minutes to pitch their H2O project. Officers give quick feedback so you walk into hackathon day with a plan.',
    ),
    {
      id: 'e_seed_16',
      title: 'H2O Hackathon',
      description:
        "The club's hackathon. Teams of two to four build anything that helps someone, from a study tool to a game for RAP students. Breakfast, lunch, and snacks provided. Judging and prizes at 5 PM.\n\nBring a laptop and charger. Parents are welcome at the demos.",
      start: at(tuesday(4) + 4, '09:00'),
      end: at(tuesday(4) + 4, '18:00'),
      location: 'RHS Library',
      tags: ['hackathon'],
    },
    rap(
      'e_seed_17',
      tuesday(2) + 2,
      'RAP teaching day: coding with Ozobots',
      'Little robots that follow colored lines. Students draw a track and "program" it with color codes. Great for first-time volunteers.',
    ),
    lunch(
      'e_seed_20',
      tuesday(5),
      "H2O retro and what's next",
      'What worked at the hackathon, what we would change, and which projects keep going next semester.',
    ),
    {
      id: 'e_seed_18',
      title: 'End of semester showcase',
      description:
        'Demo what you built this semester, from hackathon projects to challenge solutions you are proud of. Pizza on the club. Badges and top-of-leaderboard shout-outs.',
      start: at(tuesday(6), '12:30'),
      end: at(tuesday(6), '13:15'),
      location: ROOM,
      tags: ['social', 'meeting'],
    },
  ]

  const lines: string[] = []
  for (const e of events) {
    const past = e.end < now
    lines.push(
      `INSERT INTO event (id, title, description, starts_at, ends_at, location, tags, cover_key, check_in_code, check_in_open, reminder_sent_at, created_by, created_at, updated_at) VALUES (${q(e.id)}, ${q(e.title)}, ${q(e.description)}, ${e.start}, ${e.end}, ${q(e.location)}, ${q(JSON.stringify(e.tags))}, NULL, ${past ? q(generateCheckInCode()) : 'NULL'}, 0, ${past ? e.start - 20 * 3_600_000 : 'NULL'}, 'u_officer', ${Math.min(now, e.start - 14 * DAY)}, ${now});`,
    )
  }

  // ---------- RSVPs ----------
  type Status = 'yes' | 'maybe' | 'no'
  const rsvps: [string, string, Status][] = [
    // The next meeting: the original five yeses plus a couple of maybes.
    ['e_seed_1', 'u_member', 'yes'],
    ['e_seed_1', 'u_seed_m1', 'yes'],
    ['e_seed_1', 'u_seed_m2', 'yes'],
    ['e_seed_1', 'u_seed_m3', 'yes'],
    ['e_seed_1', 'u_officer', 'yes'],
    ['e_seed_1', 'u_seed_m4', 'maybe'],
    ['e_seed_1', 'u_admin', 'maybe'],
    ['e_seed_12', 'u_seed_m1', 'yes'],
    ['e_seed_12', 'u_seed_m3', 'yes'],
    ['e_seed_12', 'u_officer', 'yes'],
    ['e_seed_12', 'u_member', 'maybe'],
    ['e_seed_13', 'u_seed_m2', 'yes'],
    ['e_seed_13', 'u_seed_m4', 'yes'],
    ['e_seed_13', 'u_seed_m1', 'no'],
    ['e_seed_14', 'u_seed_m1', 'yes'],
    ['e_seed_14', 'u_seed_m2', 'yes'],
    ['e_seed_14', 'u_member', 'yes'],
    ['e_seed_16', 'u_seed_m1', 'yes'],
    ['e_seed_16', 'u_seed_m2', 'yes'],
    ['e_seed_16', 'u_seed_m3', 'yes'],
    ['e_seed_16', 'u_seed_m4', 'yes'],
    ['e_seed_16', 'u_member', 'yes'],
    ['e_seed_16', 'u_officer', 'yes'],
    ['e_seed_16', 'u_admin', 'yes'],
    ['e_seed_18', 'u_seed_m3', 'maybe'],
    // Past events people said they'd come to.
    ['e_seed_2', 'u_seed_m1', 'yes'],
    ['e_seed_2', 'u_seed_m2', 'yes'],
    ['e_seed_2', 'u_seed_m3', 'yes'],
    ['e_seed_2', 'u_seed_m4', 'yes'],
    ['e_seed_2', 'u_member', 'maybe'],
    ['e_seed_11', 'u_member', 'yes'],
    ['e_seed_11', 'u_seed_m2', 'yes'],
    ['e_seed_10', 'u_seed_m1', 'yes'],
  ]
  rsvps.forEach(([eventId, userId, status], i) => {
    lines.push(
      `INSERT INTO rsvp (id, event_id, user_id, status, created_at, updated_at) VALUES (${q(`r_seed_${i + 1}`)}, ${q(eventId)}, ${q(userId)}, ${q(status)}, ${now - (rsvps.length - i) * 3_600_000}, ${now});`,
    )
  })

  // ---------- Attendance (past events) ----------
  // Points for e_seed_2's attendance are seeded by the members module; the
  // other rows give past events realistic headcounts.
  const attended: Record<string, string[]> = {
    e_seed_2: ['u_seed_m1', 'u_seed_m2', 'u_seed_m3', 'u_seed_m4'],
    e_seed_3: [
      'u_seed_m1',
      'u_seed_m2',
      'u_seed_m3',
      'u_seed_m4',
      'u_member',
      'u_officer',
      'u_admin',
    ],
    e_seed_4: ['u_seed_m1', 'u_seed_m3', 'u_member', 'u_officer'],
    e_seed_5: ['u_seed_m1', 'u_seed_m2', 'u_seed_m4', 'u_member', 'u_officer'],
    e_seed_6: ['u_seed_m1', 'u_seed_m3', 'u_officer'],
    e_seed_7: ['u_seed_m2', 'u_seed_m3', 'u_member', 'u_officer'],
    e_seed_8: [
      'u_seed_m1',
      'u_seed_m2',
      'u_seed_m3',
      'u_seed_m4',
      'u_member',
      'u_officer',
    ],
    e_seed_9: ['u_seed_m1', 'u_seed_m4', 'u_member', 'u_admin'],
    e_seed_10: ['u_seed_m1', 'u_seed_m2', 'u_seed_m3', 'u_officer'],
    e_seed_11: ['u_seed_m2', 'u_seed_m3', 'u_member', 'u_officer', 'u_admin'],
  }
  const byId = new Map(events.map((e) => [e.id, e]))
  let n = 0
  for (const [eventId, users] of Object.entries(attended)) {
    const e = byId.get(eventId)
    if (!e || e.end > now) continue
    users.forEach((userId, i) => {
      n++
      const markedBy = i % 4 === 3 ? "'u_officer'" : q(userId)
      lines.push(
        `INSERT INTO attendance (id, event_id, user_id, marked_by, marked_at) VALUES (${q(`a_seed_${n}`)}, ${q(eventId)}, ${q(userId)}, ${markedBy}, ${e.start + (3 + i * 2) * 60_000});`,
      )
    })
  }

  return lines
}
