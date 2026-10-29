import { DAY, doc, q } from './util'
import type { SeedContext } from './util'

interface SeedProject {
  id: string
  title: string
  description: string
  tech: string[]
  repoUrl: string | null
  demoUrl: string | null
  authorId: string
  /** Teammates besides the author. */
  team: string[]
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  featured?: boolean
  year: number
  reviewedBy?: string
  /** Days ago it was submitted / reviewed. */
  created: number
  reviewed?: number
}

const PROJECT_POINTS = 150

const PROJECTS: SeedProject[] = [
  {
    id: 'pr_seed_1',
    title: 'H2O usage tracker',
    description:
      'A dashboard that shows how much water the school uses each week, built in 24 hours at the H2O hackathon. It pulls the district meter export every morning, charts usage per building, and flags days that run more than 20% over the monthly average so facilities can check for leaks.\n\nWe won "Best use of data" and the district asked us to keep it running for the rest of the year.',
    tech: ['TypeScript', 'React', 'Cloudflare D1', 'Chart.js'],
    repoUrl: 'https://github.com/RHS-Coding-Club/h2o-tracker',
    demoUrl: 'https://h2o.rhscoding.club',
    authorId: 'u_member',
    team: ['u_seed_m1', 'u_seed_m2'],
    status: 'approved',
    featured: true,
    year: 2026,
    reviewedBy: 'u_officer',
    created: 5,
    reviewed: 3,
  },
  {
    id: 'pr_seed_2',
    title: 'Lunch line estimator',
    description:
      'Predicts how long the cafeteria line is from a photo taken by the side door camera, so you know whether to grab food now or after club. Counts people with OpenCV and turns that into minutes using two weeks of timed samples.',
    tech: ['Python', 'OpenCV'],
    repoUrl: null,
    demoUrl: null,
    authorId: 'u_member',
    team: ['u_seed_m4'],
    status: 'pending',
    year: 2026,
    created: 1,
  },
  {
    id: 'pr_seed_3',
    title: 'Bell schedule widget',
    description:
      'A tiny installable web app that shows the current period and the minutes left, with the rally-day, minimum-day, and finals schedules built in. Works offline after the first visit, which matters in the B building dead zone.',
    tech: ['JavaScript', 'PWA'],
    repoUrl: 'https://github.com/RHS-Coding-Club/bell-widget',
    demoUrl: null,
    authorId: 'u_officer',
    team: [],
    status: 'approved',
    year: 2026,
    reviewedBy: 'u_admin',
    created: 12,
    reviewed: 8,
  },
  {
    id: 'pr_seed_4',
    title: 'RAP lesson planner',
    description:
      'Drag-and-drop planner the Ripon Afterschool Program volunteers use to build 40-minute STEM lessons for Ripon Elementary. Each block has a time estimate, a materials list, and a printable sheet for the classroom teacher.',
    tech: ['TypeScript', 'React', 'dnd-kit'],
    repoUrl: null,
    demoUrl: 'https://rap.rhscoding.club',
    authorId: 'u_member',
    team: ['u_seed_m3'],
    status: 'approved',
    year: 2026,
    reviewedBy: 'u_officer',
    created: 25,
    reviewed: 20,
  },
  {
    id: 'pr_seed_5',
    title: 'Library seat finder',
    description:
      'Shows which library tables are free during lunch using a cheap motion sensor under each one. The sensors post to a small Flask server, and the page refreshes every 30 seconds. Ms. Alvarez put a QR code for it on the library door.',
    tech: ['Python', 'Flask', 'SQLite', 'Raspberry Pi'],
    repoUrl: 'https://github.com/RHS-Coding-Club/seat-finder',
    demoUrl: null,
    authorId: 'u_seed_m1',
    team: ['u_seed_m4'],
    status: 'approved',
    year: 2025,
    reviewedBy: 'u_officer',
    created: 400,
    reviewed: 395,
  },
  {
    id: 'pr_seed_6',
    title: 'Pixel art Discord bot',
    description:
      'A Discord bot for the club server that runs a shared 32 by 32 canvas. Everyone gets one pixel every five minutes, and the bot posts a time-lapse of the board every Friday.',
    tech: ['JavaScript', 'Node.js', 'discord.js'],
    repoUrl: 'https://github.com/RHS-Coding-Club/pixel-bot',
    demoUrl: null,
    authorId: 'u_seed_m2',
    team: [],
    status: 'approved',
    year: 2025,
    reviewedBy: 'u_admin',
    created: 430,
    reviewed: 426,
  },
  {
    id: 'pr_seed_7',
    title: 'Stoichiometry helper',
    description:
      'An iPad app for chemistry class: type a reaction, and it balances the equation, then walks you through mole ratios one step at a time instead of just giving the answer. Mr. Okafor uses it for the review days before each unit test.',
    tech: ['Swift', 'SwiftUI'],
    repoUrl: 'https://github.com/RHS-Coding-Club/stoich',
    demoUrl: null,
    authorId: 'u_seed_m3',
    team: ['u_seed_m1'],
    status: 'approved',
    year: 2024,
    reviewedBy: 'u_officer',
    created: 760,
    reviewed: 756,
  },
  {
    id: 'pr_seed_8',
    title: 'AP CS flashcards',
    description:
      'Flashcards for the AP Computer Science A exam, with spaced repetition so the cards you miss come back sooner. Covers every unit in the course description.',
    tech: ['Java', 'JavaFX'],
    repoUrl: null,
    demoUrl: null,
    authorId: 'u_seed_m4',
    team: [],
    status: 'rejected',
    rejectionReason:
      'Love the idea. Add a repo link and at least one screenshot so we can try it, then resubmit.',
    year: 2026,
    reviewedBy: 'u_officer',
    created: 9,
    reviewed: 7,
  },
  {
    id: 'pr_seed_9',
    title: 'Hackathon judging board',
    description:
      'The scoring app we built for judges at H2O. Judges score each team on a phone, scores sync live to a projector view, and ties are broken by the rubric weights the officers set before the event. Replaced a very stressful shared spreadsheet.',
    tech: ['TypeScript', 'SvelteKit', 'WebSockets'],
    repoUrl: 'https://github.com/RHS-Coding-Club/judging',
    demoUrl: null,
    authorId: 'u_officer',
    team: ['u_seed_m1', 'u_seed_m2'],
    status: 'approved',
    featured: true,
    year: 2025,
    reviewedBy: 'u_admin',
    created: 380,
    reviewed: 378,
  },
]

interface SeedPost {
  id: string
  title: string
  slug: string
  summary: string
  tags: string[]
  authorId: string
  /** Days ago; null for a draft. */
  published: number | null
  content: string
}

const POSTS: SeedPost[] = [
  {
    id: 'p_seed_1',
    title: 'Welcome to the new site',
    slug: 'welcome-to-the-new-site',
    summary:
      'We rebuilt the club website from scratch. Here is what changed, what is new for members, and how to report anything broken.',
    tags: ['announcement'],
    authorId: 'u_officer',
    published: 2,
    content: doc(
      'Over the summer a few of us rebuilt the club website from the ground up. The old site did its job, but adding anything new took forever and the leaderboard had a habit of losing points. This one is faster, easier to change, and built by members for members.',
      { h2: 'What is new' },
      {
        list: [
          'Points are a ledger now. Every challenge, event, and project adds an entry, so your total can always be explained.',
          'Badges award themselves the moment you qualify.',
          'Projects are team projects. Add your teammates and everyone gets credit.',
          'The leaderboard has a semester view and an all-time view.',
        ],
      },
      { h2: 'How it is built' },
      'The site runs on TanStack Start with Cloudflare Workers, a D1 database, and R2 for uploads. If you want to see how the points ledger works, the core of it is about this small:',
      {
        code: 'const total = await db\n  .select({ n: sum(pointEntry.delta) })\n  .from(pointEntry)\n  .where(eq(pointEntry.userId, me))',
        language: 'typescript',
      },
      'Want to help? The repo is open to every member. Ask in the Discord and an officer will add you to the GitHub org.',
      { h3: 'Found a bug?' },
      'Use the contact page or tell any officer at lunch in Mr. Derrick’s room. Screenshots help a lot.',
    ),
  },
  {
    id: 'p_seed_2',
    title: 'How the STEM teaching program works',
    slug: 'how-the-stem-teaching-program-works',
    summary:
      'What to expect on your first afternoon teaching with the Ripon Afterschool Program at Ripon Elementary.',
    tags: ['rap', 'volunteering'],
    authorId: 'u_officer',
    published: 9,
    content: doc(
      'Every week a group of members teaches a short STEM lesson through the Ripon Afterschool Program (RAP) at Ripon Elementary. It is the part of club most people end up loving, and it counts toward your service hours.',
      { h2: 'Your first afternoon' },
      {
        list: [
          'Meet at the front office at 2:45 and sign in. Grab a volunteer lanyard.',
          'Find your group lead. They have the lesson plan and the materials bin.',
          'Lessons are 40 minutes: a five minute hook, a hands-on build, and a quick share-out.',
          'Help clean up and log your hours before you leave.',
        ],
      },
      { h2: 'What we teach' },
      'Lessons rotate through unplugged coding, Scratch, simple circuits, and the occasional paper-airplane engineering contest. Everything lives in the RAP lesson planner, which members built last year.',
      { h3: 'Tips from returning volunteers' },
      'Kneel down to their level when you help. Ask what they think will happen before you show them. And bring extra pencils, always.',
    ),
  },
  {
    id: 'p_seed_3',
    title: 'H2O hackathon 2026 recap',
    slug: 'h2o-hackathon-2026-recap',
    summary:
      'Twenty-four hours, eleven teams, and one very tired projector. Here is what got built at this year’s H2O hackathon and who took home the awards.',
    tags: ['h2o', 'hackathon'],
    authorId: 'u_admin',
    published: 16,
    content: doc(
      'H2O is the hackathon the club runs every spring, and this year was the biggest one yet: eleven teams, forty-two students, and a theme of building something useful for Ripon.',
      { h2: 'The winners' },
      {
        list: [
          'Best use of data: H2O usage tracker, a live dashboard of school water use.',
          'Best first hack: a bus-arrival texting bot from three freshmen who had never used an API.',
          'People’s choice: a lunch-line estimator that counts people from a photo.',
        ],
      },
      { h2: 'What we learned running it' },
      'Judging on paper does not scale past six teams. This year we used the judging board a few members built, and scores were on the projector minutes after the last demo.',
      'We also learned that 3 AM is the right time for pancakes. Thank you to the parents who made that happen.',
      { h3: 'Next year' },
      'Planning starts in January. If you want to help with sponsors, logistics, or workshops, tell an officer.',
    ),
  },
  {
    id: 'p_seed_4',
    title: 'Your first weekly challenge, step by step',
    slug: 'your-first-weekly-challenge',
    summary:
      'Never submitted a challenge before? This walks through reading the prompt, testing with the sample input, and submitting a solution.',
    tags: ['challenges', 'python', 'how-to'],
    authorId: 'u_officer',
    published: 23,
    content: doc(
      'Every Monday a new challenge goes up on the challenges page. Easy ones take ten minutes, hard ones might take the week. Here is how to tackle your first one.',
      { h2: '1. Read the prompt twice' },
      'Most wrong answers come from skimming. Look for the exact input format and what the output should look like, down to the spaces.',
      { h2: '2. Run the sample' },
      'Paste the sample input into your program and check you get the sample output exactly. For example, a challenge asking you to reverse each word might look like this in Python:',
      {
        code: 'line = input()\nprint(" ".join(word[::-1] for word in line.split()))',
        language: 'python',
      },
      { h2: '3. Try the edge cases' },
      {
        list: [
          'An empty input.',
          'One very long input.',
          'Repeated or negative numbers, if numbers are involved.',
        ],
      },
      { h2: '4. Submit' },
      'Share a link to your code (Replit, GitHub, or a gist all work) on the challenge page. An officer reviews it, and a pass adds points to your total.',
    ),
  },
  {
    id: 'p_seed_5',
    title: 'Git in ten minutes for club projects',
    slug: 'git-in-ten-minutes',
    summary:
      'The handful of Git commands you actually need to work on a team project without overwriting each other.',
    tags: ['git', 'how-to', 'projects'],
    authorId: 'u_admin',
    published: 31,
    content: doc(
      'Team projects are more fun when nobody loses an afternoon of work to a bad copy-paste. Git fixes that. You only need a few commands to start.',
      { h2: 'Get the code' },
      {
        code: 'git clone https://github.com/RHS-Coding-Club/your-project\ncd your-project',
        language: 'bash',
      },
      { h2: 'Work on a branch' },
      'Make a branch for each change so `main` always works:',
      {
        code: 'git switch -c add-dark-mode\n# edit files\ngit add .\ngit commit -m "Add dark mode toggle"',
        language: 'bash',
      },
      { h2: 'Share it' },
      { code: 'git push -u origin add-dark-mode', language: 'bash' },
      'Then open a pull request on GitHub and ask a teammate to look it over. When it is merged, run `git switch main` and `git pull` to get everyone’s changes.',
      { h3: 'When things go wrong' },
      'Run `git status` first. It almost always tells you what to do next. If it does not, ask at lunch: someone has made the same mistake before.',
    ),
  },
  {
    id: 'p_seed_6',
    title: 'Spring officer elections',
    slug: 'spring-officer-elections',
    summary:
      'How nominations, speeches, and voting will work for next year’s officer team.',
    tags: ['announcement', 'officers'],
    authorId: 'u_officer',
    published: null,
    content: doc(
      'Officer elections happen in April. Any member who has attended at least four meetings this year can run.',
      { h2: 'Timeline' },
      {
        list: [
          'Nominations open the first week of April.',
          'Speeches at lunch the following Tuesday.',
          'Voting runs for three days on the site.',
        ],
      },
    ),
  },
]

/** Projects (with teammates) and blog posts. Owned by the projects + blog domain. */
export function seedContent({ now }: SeedContext): string[] {
  const lines: string[] = []
  const ago = (days: number) => now - days * DAY

  lines.push(`DELETE FROM point_entry WHERE id LIKE 'pe_seed_pr_%';`)
  lines.push(`DELETE FROM project_member WHERE project_id LIKE 'pr_seed_%';`)
  lines.push(`DELETE FROM project WHERE id LIKE 'pr_seed_%';`)

  let memberRow = 0
  let pointRow = 0
  for (const p of PROJECTS) {
    lines.push(
      `INSERT INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES (${q(p.id)}, ${q(p.title)}, ${q(p.description)}, ${q(JSON.stringify(p.tech))}, ${q(p.repoUrl)}, ${q(p.demoUrl)}, '[]', ${q(p.authorId)}, ${q(p.status)}, ${q(p.rejectionReason ?? null)}, ${q(Boolean(p.featured))}, ${p.year}, ${q(p.reviewedBy ?? null)}, ${p.reviewed === undefined ? 'NULL' : ago(p.reviewed)}, ${ago(p.created)}, ${ago(p.reviewed ?? p.created)});`,
    )
    const members = [p.authorId, ...p.team]
    members.forEach((userId, i) => {
      memberRow += 1
      lines.push(
        `INSERT INTO project_member (id, project_id, user_id, created_at) VALUES ('pm_seed_${memberRow}', ${q(p.id)}, ${q(userId)}, ${ago(p.created) + i});`,
      )
      // Approved projects pay every teammate. members.ts already seeds
      // u_member's points for pr_seed_1 (pe_seed_7), so skip that one.
      if (p.status !== 'approved' || p.reviewed === undefined) return
      if (p.id === 'pr_seed_1' && userId === 'u_member') return
      pointRow += 1
      lines.push(
        `INSERT INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) VALUES ('pe_seed_pr_${pointRow}', ${q(userId)}, ${PROJECT_POINTS}, 'project', ${q(p.id)}, ${q(`Project: ${p.title}`)}, ${q(p.reviewedBy ?? null)}, ${ago(p.reviewed)});`,
      )
    })
  }

  lines.push(`DELETE FROM post WHERE id LIKE 'p_seed_%';`)
  for (const p of POSTS) {
    const at = p.published === null ? null : ago(p.published)
    lines.push(
      `INSERT INTO post (id, title, slug, summary, content, tags, author_id, legacy_author_email, published_at, created_at, updated_at) VALUES (${q(p.id)}, ${q(p.title)}, ${q(p.slug)}, ${q(p.summary)}, ${q(p.content)}, ${q(JSON.stringify(p.tags))}, ${q(p.authorId)}, NULL, ${at ?? 'NULL'}, ${at ?? ago(1)}, ${at ?? ago(1)});`,
    )
  }

  return lines
}
