import { Link } from '@tanstack/react-router'
import { Code } from '#/components/icons/code'
import { FolderGit2 } from '#/components/icons/folder-git-2'
import { UserCheck } from '#/components/icons/user-check'
import { Users } from '#/components/icons/users'
import type { LegalDoc } from './types'

/**
 * The terms of use, word for word what /terms says. The highlights and each
 * section's `short` restate the text and never add to it.
 */
export const TERMS: LegalDoc = {
  kind: 'terms',
  title: 'Terms of use',
  description:
    'The ground rules for the club website: your account, your work, points, and how we treat each other.',
  updated: 'Oct 29, 2026',
  updatedIso: '2026-10-29',
  minutes: 3,
  glance: [
    {
      icon: Users,
      title: 'Be kind',
      text: 'No harassment, insults, or making fun of someone’s code.',
    },
    {
      icon: Code,
      title: 'Do your own work',
      text: 'Docs and help are encouraged; say where it came from.',
    },
    {
      icon: FolderGit2,
      title: 'Your work stays yours',
      text: 'Posting it lets the club show it here and in announcements.',
    },
    {
      icon: UserCheck,
      title: '13 and up',
      text: 'Anyone can browse. Accounts need you to be at least 13.',
    },
  ],
  sections: [
    {
      id: 'about',
      title: 'About these terms',
      short:
        'Using the site means agreeing to these rules. Common sense and school rules cover the rest.',
      body: (
        <p>
          This website belongs to the Ripon High School Coding Club and is built and run
          by its student officers. By using it, you agree to these rules. They’re short on
          purpose; if something isn’t covered, use common sense and school rules.
        </p>
      ),
    },
    {
      id: 'who-can-use',
      title: 'Who can use the site',
      short:
        'Anyone can browse. Accounts are for ages 13 and up, and an officer approves members, who are RHS students.',
      body: (
        <>
          <p>
            Anyone can browse. To make an account you must be at least 13. Accounts start
            as guests; an officer approves your{' '}
            <Link to="/join">membership application</Link> before you can submit
            challenges, RSVP, check in, or add projects. Membership is for Ripon High
            School students.
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
      short:
        'One account per person, under your real name. Keep your password to yourself.',
      body: (
        <ul>
          <li>One account per person, under your real name.</li>
          <li>
            Keep your password to yourself. You’re responsible for what your account does.
          </li>
          <li>
            Tell an officer if you think someone else got into your account, and change
            your password.
          </li>
        </ul>
      ),
    },
    {
      id: 'conduct',
      title: 'How we treat each other',
      short:
        'Be kind, do your own work, no spam, and report security holes instead of using them.',
      body: (
        <>
          <p>
            The club is for everyone, especially beginners. On the site and at meetings:
          </p>
          <ul>
            <li>Be kind. No harassment, insults, or making fun of someone’s code.</li>
            <li>
              Do your own work. Using docs, tutorials, and help is fine and encouraged;
              say where it came from. Copying someone else’s solution for points isn’t.
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
      short:
        'You own what you share. Posting it lets the club show it on the site and in announcements.',
      body: (
        <>
          <p>
            You own the code, projects, and writing you share here. By posting it, you let
            the club show it on this site (for example, approved projects in the public
            showcase and your name on the leaderboard) and use it in club announcements.
          </p>
          <p>
            Only post things you have the right to share, and list your teammates on team
            projects. If you delete your account, your submissions and projects go with
            it.
          </p>
        </>
      ),
    },
    {
      id: 'points',
      title: 'Points, badges, and the leaderboard',
      short:
        'Points are for fun. Officers can correct mistakes, and prizes aren’t guaranteed.',
      body: (
        <p>
          Points and badges are for fun and recognition. Officers review submissions and
          can correct points when something was scored by mistake or broke the rules.
          Prizes, when there are any, are announced by the officers and aren’t guaranteed.
        </p>
      ),
    },
    {
      id: 'events',
      title: 'Events and volunteering',
      short: 'School rules apply. Check in only for events you attend.',
      body: (
        <p>
          Meetings, the H2O hackathon, and teaching at the Ripon Afterschool Program (RAP)
          follow school rules and the supervising teacher. Check in only for events you
          actually attend. Officers sign off on volunteer hours for RAP sessions you
          worked.
        </p>
      ),
    },
    {
      id: 'github',
      title: 'The club’s GitHub org',
      short: 'Follow GitHub’s terms while you’re in the org. Officers can remove access.',
      body: (
        <p>
          Members can ask for an invite to the RHS-Coding-Club organization on GitHub.
          While you’re in it, follow GitHub’s own terms and each repository’s README.
          Officers can remove access, for example after you leave the club or if the rules
          above are broken.
        </p>
      ),
    },
    {
      id: 'officer-actions',
      title: 'What officers can do',
      short:
        'Officers can edit or remove content and suspend accounts that break these rules.',
      body: (
        <p>
          To keep the site useful and safe, officers can edit or remove content, reject
          submissions, and suspend accounts that break these rules. Serious issues go to
          the club advisor and the school.
        </p>
      ),
    },
    {
      id: 'as-is',
      title: 'The site is student-built',
      short:
        'It’s provided as is and might go down. Keep your own copies of anything important.',
      body: (
        <p>
          We work hard on it, but it’s provided as is: it might go down, lose a feature,
          or have bugs. Keep your own copies of anything important (your code belongs in
          your repos anyway). The club and the school aren’t responsible for losses caused
          by the site being unavailable.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes and contact',
      short:
        'We update this page and its date when the terms change. Questions go to the officers.',
      body: (
        <p>
          If these terms change, we’ll update this page and the date at the top.
          Questions? <Link to="/contact">Send the officers a message</Link>.
        </p>
      ),
    },
  ],
}
