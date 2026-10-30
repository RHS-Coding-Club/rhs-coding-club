import { DAY, doc, q } from './util'
import type { SeedContext } from './util'

/** Officers, resources, GitHub requests, contact messages, newsletter. Owned by the community domain. */
export function seedCommunity({ now }: SeedContext): string[] {
  const lines: string[] = []
  lines.push(`DELETE FROM officer WHERE id LIKE 'o_seed_%';`)
  lines.push(`DELETE FROM resource WHERE id LIKE 'res_seed_%';`)
  lines.push(`DELETE FROM github_membership_request WHERE id LIKE 'gh_seed_%';`)
  lines.push(`DELETE FROM contact_message WHERE id LIKE 'cm_seed_%';`)
  lines.push(`DELETE FROM newsletter_subscriber WHERE id LIKE 'ns_seed_%';`)
  lines.push(`DELETE FROM newsletter_issue WHERE id LIKE 'nli_seed_%';`)

  // ---------- officers ----------
  const officers = [
    [
      'o_seed_1',
      'Jashan Maan',
      'President',
      'Runs the club, ships the website, and teaches at RAP.',
      'https://github.com/JashanMaan28',
      1,
    ],
    [
      'o_seed_2',
      'Sahib S.',
      'Vice President',
      'Plans hackathons and keeps the Discord alive.',
      null,
      2,
    ],
    [
      'o_seed_3',
      'Miguel A.',
      'Outreach',
      'Coordinates the Ripon Afterschool Program volunteers.',
      null,
      3,
    ],
  ] as const
  for (const [id, name, title, bio, gh, order] of officers) {
    lines.push(
      `INSERT INTO officer (id, name, title, bio, email, github_url, image_key, sort_order, is_active, created_at, updated_at) VALUES (${q(id)}, ${q(name)}, ${q(title)}, ${q(bio)}, NULL, ${q(gh)}, NULL, ${order}, 1, ${now}, ${now});`,
    )
  }

  // ---------- resources ----------
  type Res = [
    id: string,
    title: string,
    description: string,
    url: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    tags: string[],
    approved: boolean,
    addedBy: string,
    daysAgo: number,
  ]
  const resources: Res[] = [
    [
      'res_seed_1',
      'CS50x: Introduction to Computer Science',
      "Harvard's free intro course. Long, but the problem sets teach you how to think like a programmer.",
      'https://cs50.harvard.edu/x/',
      'beginner',
      ['course', 'c', 'python'],
      true,
      'u_officer',
      60,
    ],
    [
      'res_seed_2',
      'Python for Everybody',
      'Gentle videos and exercises from Dr. Chuck. The best first course if you have never coded.',
      'https://www.py4e.com/',
      'beginner',
      ['python', 'course'],
      true,
      'u_officer',
      58,
    ],
    [
      'res_seed_3',
      'freeCodeCamp: Responsive Web Design',
      'Build real pages in the browser with HTML and CSS, step by step, with a certificate at the end.',
      'https://www.freecodecamp.org/learn/',
      'beginner',
      ['web', 'html', 'css'],
      true,
      'u_admin',
      50,
    ],
    [
      'res_seed_4',
      'MDN: Learn web development',
      'Mozilla’s structured path through HTML, CSS, and JavaScript. Also the reference every web dev keeps open.',
      'https://developer.mozilla.org/en-US/docs/Learn_web_development',
      'beginner',
      ['web', 'docs', 'javascript'],
      true,
      'u_officer',
      45,
    ],
    [
      'res_seed_5',
      'Learn Git Branching',
      'A visual sandbox for git commands. Ten minutes here beats an hour of reading.',
      'https://learngitbranching.js.org/',
      'beginner',
      ['git', 'tools'],
      true,
      'u_seed_m1',
      30,
    ],
    [
      'res_seed_6',
      'The Odin Project',
      'A full, free web development curriculum where you build projects the whole way through.',
      'https://www.theodinproject.com/',
      'intermediate',
      ['web', 'javascript', 'course'],
      true,
      'u_admin',
      55,
    ],
    [
      'res_seed_7',
      'Exercism',
      'Practice problems in 70+ languages with optional feedback from volunteer mentors.',
      'https://exercism.org/',
      'intermediate',
      ['practice', 'python', 'javascript'],
      true,
      'u_seed_m2',
      40,
    ],
    [
      'res_seed_8',
      'The Modern JavaScript Tutorial',
      'javascript.info covers the language from basics to async in clear, short chapters.',
      'https://javascript.info/',
      'intermediate',
      ['javascript', 'docs'],
      true,
      'u_officer',
      35,
    ],
    [
      'res_seed_9',
      'The Missing Semester of Your CS Education',
      'MIT’s short course on the shell, editors, git, and debugging. The tools nobody teaches.',
      'https://missing.csail.mit.edu/',
      'intermediate',
      ['tools', 'git', 'shell'],
      true,
      'u_admin',
      28,
    ],
    [
      'res_seed_10',
      'Advent of Code',
      'Twenty-five puzzles every December. The club solves them together at lunch.',
      'https://adventofcode.com/',
      'intermediate',
      ['practice', 'puzzles'],
      true,
      'u_officer',
      20,
    ],
    [
      'res_seed_11',
      'USACO Guide',
      'A free, organized path through competitive programming, from Bronze to Platinum.',
      'https://usaco.guide/',
      'advanced',
      ['competitive', 'algorithms'],
      true,
      'u_admin',
      52,
    ],
    [
      'res_seed_12',
      'Codeforces',
      'Weekly contests and thousands of rated problems. Where you go once USACO Silver feels easy.',
      'https://codeforces.com/',
      'advanced',
      ['competitive', 'practice'],
      true,
      'u_seed_m3',
      25,
    ],
    [
      'res_seed_13',
      'CP-Algorithms',
      'Clear write-ups of the algorithms and data structures contest problems lean on.',
      'https://cp-algorithms.com/',
      'advanced',
      ['algorithms', 'docs'],
      true,
      'u_officer',
      18,
    ],
    [
      'res_seed_14',
      'Crafting Interpreters',
      'Build two complete interpreters from scratch. Free to read online, and a great winter project.',
      'https://craftinginterpreters.com/',
      'advanced',
      ['compilers', 'book'],
      true,
      'u_admin',
      12,
    ],
    // A member's suggestion still waiting for an officer.
    [
      'res_seed_15',
      'roadmap.sh',
      'Step-by-step guides for frontend, backend, and more. Helped me figure out what to learn next.',
      'https://roadmap.sh/',
      'intermediate',
      ['career', 'web'],
      false,
      'u_member',
      2,
    ],
  ]
  for (const [
    id,
    title,
    description,
    url,
    level,
    tags,
    approved,
    addedBy,
    ago,
  ] of resources) {
    const at = now - ago * DAY
    lines.push(
      `INSERT INTO resource (id, title, description, url, tags, level, approved, added_by, created_at, updated_at) VALUES (${q(id)}, ${q(title)}, ${q(description)}, ${q(url)}, ${q(JSON.stringify(tags))}, ${q(level)}, ${q(approved)}, ${q(addedBy)}, ${at}, ${at});`,
    )
  }

  const bookmarks: [string, string][] = [
    ['u_member', 'res_seed_1'],
    ['u_member', 'res_seed_6'],
    ['u_member', 'res_seed_11'],
    ['u_seed_m1', 'res_seed_1'],
    ['u_seed_m2', 'res_seed_12'],
  ]
  bookmarks.forEach(([userId, resourceId], i) => {
    lines.push(
      `INSERT INTO resource_bookmark (id, user_id, resource_id, created_at) VALUES (${q(`rb_seed_${i + 1}`)}, ${q(userId)}, ${q(resourceId)}, ${now - i * DAY});`,
    )
  })

  // ---------- GitHub org requests ----------
  type Gh = {
    id: string
    userId: string
    username: string
    githubId: number | null
    note: string | null
    status: string
    adminNote?: string
    reviewed?: number
    invited?: number
    joined?: number
    error?: string
    created: number
  }
  const requests: Gh[] = [
    {
      id: 'gh_seed_1',
      userId: 'u_member',
      username: 'maxmember-dev',
      githubId: 90210001,
      note: 'Want to help on the club website repo.',
      status: 'invite-sent',
      reviewed: 3,
      invited: 3,
      created: 5,
    },
    {
      id: 'gh_seed_2',
      userId: 'u_seed_m1',
      username: 'priya-n',
      githubId: 90210002,
      note: 'For the H2O hackathon team repo.',
      status: 'pending',
      created: 1,
    },
    {
      id: 'gh_seed_3',
      userId: 'u_seed_m2',
      username: 'diegor',
      githubId: 90210003,
      note: null,
      status: 'pending',
      created: 0.3,
    },
    {
      id: 'gh_seed_4',
      userId: 'u_seed_m3',
      username: 'lenak',
      githubId: 90210004,
      note: 'RAP lesson plans repo.',
      status: 'joined',
      reviewed: 20,
      invited: 20,
      joined: 18,
      created: 21,
    },
    {
      id: 'gh_seed_5',
      userId: 'u_seed_m4',
      username: 'theo-b-personal',
      githubId: 90210005,
      note: null,
      status: 'denied',
      adminNote:
        'This account looks like a shared family one. Request again with your own GitHub account.',
      reviewed: 9,
      created: 10,
    },
    {
      id: 'gh_seed_6',
      userId: 'u_officer',
      username: 'olive-officer',
      githubId: 90210006,
      note: null,
      status: 'approved',
      error: 'GitHub returned 403: Must have admin rights to Repository.',
      reviewed: 6,
      created: 7,
    },
  ]
  for (const r of requests) {
    const at = (d?: number) =>
      d === undefined ? 'NULL' : String(Math.round(now - d * DAY))
    const created = at(r.created)
    lines.push(
      `INSERT INTO github_membership_request (id, user_id, github_username, github_id, note, status, admin_note, reviewed_by, reviewed_at, invite_sent_at, invite_error, joined_at, created_at, updated_at) VALUES (${q(r.id)}, ${q(r.userId)}, ${q(r.username)}, ${q(r.githubId)}, ${q(r.note)}, ${q(r.status)}, ${q(r.adminNote ?? null)}, ${r.reviewed === undefined ? 'NULL' : q('u_admin')}, ${at(r.reviewed)}, ${at(r.invited)}, ${q(r.error ?? null)}, ${at(r.joined)}, ${created}, ${created});`,
    )
  }
  lines.push(
    `UPDATE user SET github_username = 'maxmember-dev' WHERE id = 'u_member' AND github_username IS NULL;`,
  )

  // ---------- contact messages ----------
  const messages = [
    {
      id: 'cm_seed_1',
      name: 'Rosa Delgado',
      email: 'rosa.delgado@example.com',
      subject: 'Can my freshman join mid-semester?',
      message:
        'Hi! My son just started at RHS and heard about the club at lunch. Is it too late for him to join this semester? He has done a little Scratch but nothing else.\n\nThanks,\nRosa',
      read: false,
      ago: 0.2,
    },
    {
      id: 'cm_seed_2',
      name: 'Ms. Patel',
      email: 'apatel@riponusd.example',
      subject: 'RAP volunteers for November',
      message:
        'The Ripon Afterschool Program would love two or three club members on Thursdays in November for the intro-to-coding block. Let me know who is available and I will send the schedule.',
      read: false,
      ago: 1.5,
    },
    {
      id: 'cm_seed_3',
      name: 'Kevin Tran',
      email: 'kevin@tranlabs.example',
      subject: 'Sponsoring H2O',
      message:
        'I run a small software shop in Ripon and would like to sponsor prizes for the H2O hackathon this spring. Who should I talk to?',
      read: true,
      ago: 6,
    },
    {
      id: 'cm_seed_4',
      name: 'Jamie',
      email: 'jamie.s@example.com',
      subject: 'Website typo',
      message:
        'The events page said Wendesday last week. Looks fixed now, just letting you know!',
      read: true,
      ago: 12,
    },
  ]
  for (const m of messages) {
    const at = Math.round(now - m.ago * DAY)
    lines.push(
      `INSERT INTO contact_message (id, name, email, subject, message, read_at, created_at) VALUES (${q(m.id)}, ${q(m.name)}, ${q(m.email)}, ${q(m.subject)}, ${q(m.message)}, ${m.read ? at + 3600_000 : 'NULL'}, ${at});`,
    )
  }

  // ---------- newsletter ----------
  const subscribers: [string, number, number | null][] = [
    ['rosa.delgado@example.com', 40, null],
    ['member@test.local', 35, null],
    ['priya@test.local', 30, null],
    ['parent.carter@example.com', 22, null],
    ['alumni.sam@example.com', 15, 4],
    ['ripon.rap@example.com', 3, null],
  ]
  subscribers.forEach(([email, ago, unsubAgo], i) => {
    const n = String(i + 1).padStart(4, '0')
    lines.push(
      `INSERT INTO newsletter_subscriber (id, email, unsubscribe_token, subscribed_at, unsubscribed_at) VALUES (${q(`ns_seed_${i + 1}`)}, ${q(email)}, ${q(`seed-unsub-token-${n}`)}, ${now - ago * DAY}, ${unsubAgo === null ? 'NULL' : now - unsubAgo * DAY}) ON CONFLICT(email) DO NOTHING;`,
    )
  })

  const sentIssue = doc(
    { h2: 'October at the club' },
    'We packed Mr. Derrick’s room every lunch this month. Here is what happened and what is next.',
    {
      list: [
        'Week 8’s challenge, Two Sum with a twist, had 14 passing solutions. Nice work.',
        'Six members taught the intro block at the Ripon Afterschool Program (RAP).',
        'H2O hackathon planning has started. Teams of up to four, any skill level.',
      ],
    },
    { h3: 'Coming up' },
    'Advent of Code starts December 1st. We will solve each day’s puzzle together at lunch, in whatever language you like.',
    'Questions? Reply to this email or find an officer at lunch.',
  )
  const draftIssue = doc(
    { h2: 'H2O hackathon: save the date' },
    'Our spring hackathon is coming back. Teams of up to four, any skill level, food provided.',
  )
  lines.push(
    `INSERT INTO newsletter_issue (id, subject, content, sent_at, recipient_count, created_by, created_at, updated_at) VALUES ('nli_seed_1', 'October at the club', ${q(sentIssue)}, ${now - 4 * DAY}, 5, 'u_officer', ${now - 5 * DAY}, ${now - 4 * DAY});`,
  )
  lines.push(
    `INSERT INTO newsletter_issue (id, subject, content, sent_at, recipient_count, created_by, created_at, updated_at) VALUES ('nli_seed_2', 'H2O hackathon: save the date', ${q(draftIssue)}, NULL, 0, 'u_admin', ${now - DAY}, ${now - DAY});`,
  )

  return lines
}
