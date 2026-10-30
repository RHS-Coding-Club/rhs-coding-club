import { Link, createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/legal/legal-page'
import type { LegalSection } from '#/components/legal/legal-page'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms · RHS Coding Club' },
      {
        name: 'description',
        content:
          'The ground rules for using the RHS Coding Club website: accounts, your work, points, and how to treat each other.',
      },
      { property: 'og:title', content: 'Terms · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Plain-language terms of use for the RHS Coding Club website.',
      },
    ],
  }),
  component: TermsPage,
})

const SECTIONS: LegalSection[] = [
  {
    id: 'about',
    title: 'About these terms',
    body: (
      <p>
        This website belongs to the Ripon High School Coding Club and is built and run by
        its student officers. By using it, you agree to these rules. They’re short on
        purpose; if something isn’t covered, use common sense and school rules.
      </p>
    ),
  },
  {
    id: 'who-can-use',
    title: 'Who can use the site',
    body: (
      <>
        <p>
          Anyone can browse. To make an account you must be at least 13. Accounts start as
          guests; an officer approves your <Link to="/join">membership application</Link>{' '}
          before you can submit challenges, RSVP, check in, or add projects. Membership is
          for Ripon High School students.
        </p>
        <p>
          If you’re under 18, check with a parent or guardian first. Our{' '}
          <Link to="/privacy">privacy notice</Link> explains what we collect.
        </p>
      </>
    ),
  },
  {
    id: 'your-account',
    title: 'Your account',
    body: (
      <ul>
        <li>One account per person, under your real name.</li>
        <li>
          Keep your password to yourself. You’re responsible for what your account does.
        </li>
        <li>
          Tell an officer if you think someone else got into your account, and change your
          password.
        </li>
      </ul>
    ),
  },
  {
    id: 'conduct',
    title: 'How we treat each other',
    body: (
      <>
        <p>
          The club is for everyone, especially beginners. On the site and at meetings:
        </p>
        <ul>
          <li>Be kind. No harassment, insults, or making fun of someone’s code.</li>
          <li>
            Do your own work. Using docs, tutorials, and help is fine and encouraged; say
            where it came from. Copying someone else’s solution for points isn’t.
          </li>
          <li>No spam, ads, or anything you wouldn’t show a teacher.</li>
          <li>
            Don’t try to break, overload, or get around the site’s security. Found a bug
            or a hole? <Link to="/contact">Tell us</Link> and we’ll thank you for it.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-work',
    title: 'Your work stays yours',
    body: (
      <>
        <p>
          You own the code, projects, and writing you share here. By posting it, you let
          the club show it on this site (for example, approved projects in the public
          showcase and your name on the leaderboard) and use it in club announcements.
        </p>
        <p>
          Only post things you have the right to share, and list your teammates on team
          projects. If you delete your account, your submissions and projects go with it.
        </p>
      </>
    ),
  },
  {
    id: 'points',
    title: 'Points, badges, and the leaderboard',
    body: (
      <p>
        Points and badges are for fun and recognition. Officers review submissions and can
        correct points when something was scored by mistake or broke the rules. Prizes,
        when there are any, are announced by the officers and aren’t guaranteed.
      </p>
    ),
  },
  {
    id: 'events',
    title: 'Events and volunteering',
    body: (
      <p>
        Meetings, the H2O hackathon, and teaching at the Ripon Afterschool Program (RAP)
        follow school rules and the supervising teacher. Check in only for events you
        actually attend. Officers sign off on volunteer hours for RAP sessions you worked.
      </p>
    ),
  },
  {
    id: 'github',
    title: 'The club’s GitHub org',
    body: (
      <p>
        Members can ask for an invite to the RHS-Coding-Club organization on GitHub. While
        you’re in it, follow GitHub’s own terms and each repository’s README. Officers can
        remove access, for example after you leave the club or if the rules above are
        broken.
      </p>
    ),
  },
  {
    id: 'officer-actions',
    title: 'What officers can do',
    body: (
      <p>
        To keep the site useful and safe, officers can edit or remove content, reject
        submissions, and suspend accounts that break these rules. Serious issues go to the
        club advisor and the school.
      </p>
    ),
  },
  {
    id: 'as-is',
    title: 'The site is student-built',
    body: (
      <p>
        We work hard on it, but it’s provided as is: it might go down, lose a feature, or
        have bugs. Keep your own copies of anything important (your code belongs in your
        repos anyway). The club and the school aren’t responsible for losses caused by the
        site being unavailable.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <p>
        If these terms change, we’ll update this page and the date at the top. Questions?{' '}
        <Link to="/contact">Send the officers a message</Link>.
      </p>
    ),
  },
]

function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      description="The ground rules for the club website: your account, your work, points, and how we treat each other."
      updated="Oct 29, 2026"
      sections={SECTIONS}
      other={{ to: '/privacy', label: 'Privacy' }}
    />
  )
}
