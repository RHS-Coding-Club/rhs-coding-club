import { Link } from '@tanstack/react-router'
import { Eye } from '#/components/icons/eye'
import { Lock } from '#/components/icons/lock'
import { ShieldCheck } from '#/components/icons/shield-check'
import { Trash2 } from '#/components/icons/trash-2'
import type { LegalDoc } from './types'

/**
 * The privacy notice, word for word what /privacy promises. Only the
 * structure is new: the four highlights and each section's one-line `short`
 * restate the text below them and never add to it.
 */
export const PRIVACY: LegalDoc = {
  kind: 'privacy',
  title: 'Privacy',
  description:
    'What this site collects, where it lives, who can see it, and how to get rid of it. Written for students and parents, not lawyers.',
  updated: 'Oct 29, 2026',
  updatedIso: '2026-10-29',
  minutes: 5,
  glance: [
    {
      icon: ShieldCheck,
      title: 'Never sold',
      text: 'No selling, no advertisers, no ads, no tracking cookies.',
    },
    {
      icon: Lock,
      title: 'Your email stays private',
      text: 'It is never shown publicly. Passwords are stored hashed.',
    },
    {
      icon: Eye,
      title: 'Two cookies',
      text: 'One keeps you signed in, one remembers light or dark mode.',
    },
    {
      icon: Trash2,
      title: 'Delete any time',
      text: 'Remove your account and its data from Account settings.',
    },
  ],
  sections: [
    {
      id: 'short-version',
      title: 'The short version',
      short: 'Students run this site, keep only what the club needs, and never sell it.',
      body: (
        <>
          <p>
            This site is run by students in the Ripon High School Coding Club. We collect
            what we need to run the club: who you are, what you build, and which meetings
            you come to. We never sell it, we don’t show ads, and we don’t use tracking or
            advertising cookies.
          </p>
          <p>
            You can delete your account and the data tied to it at any time from{' '}
            <Link to="/account">Account settings</Link>.
          </p>
        </>
      ),
    },
    {
      id: 'what-we-collect',
      title: 'What we collect',
      short:
        'Your account and profile, your application, what you submit, your club activity, and messages you send.',
      body: (
        <>
          <p>Only what you give us or what the club does with you:</p>
          <ul>
            <li>
              <strong>Your account.</strong> Your name and email. If you sign in with
              Google or GitHub, we get your name, email, and profile picture from them,
              never your password for those accounts. If you use a password with us, we
              store it scrambled (hashed), so nobody can read it, officers included.
            </li>
            <li>
              <strong>Your profile.</strong> Anything you add: a photo (avatar), bio,
              graduation year, skills, and GitHub username.
            </li>
            <li>
              <strong>Your membership application.</strong> Your grade, experience, the
              languages and topics you’re into, and why you want to join.
            </li>
            <li>
              <strong>What you submit.</strong> Challenge solutions (links and any code
              you paste), projects (descriptions, screenshots, repo and demo links,
              teammates), and resources you suggest.
            </li>
            <li>
              <strong>Club activity.</strong> Points, badges, event RSVPs, and attendance
              when you check in at a meeting.
            </li>
            <li>
              <strong>GitHub org requests.</strong> The GitHub username and public account
              ID you ask us to invite.
            </li>
            <li>
              <strong>Messages.</strong> The name, email, and message you send through the{' '}
              <Link to="/contact">contact form</Link>.
            </li>
            <li>
              <strong>Newsletter.</strong> Your email address if you sign up in the
              footer.
            </li>
          </ul>
          <p>
            We use two cookies: one that keeps you signed in, and one that remembers light
            or dark mode. That’s it.
          </p>
        </>
      ),
    },
    {
      id: 'how-we-use-it',
      title: 'How we use it',
      short:
        'To run the club: sign-ins, reviews, the points ledger, emails you control, and replies.',
      body: (
        <ul>
          <li>To let you sign in, submit challenges, RSVP, and check in.</li>
          <li>To review applications, solutions, and projects, and give feedback.</li>
          <li>To keep the points ledger and award badges.</li>
          <li>
            To send emails you can control: new challenges, event reminders, decisions on
            your application or project, and the newsletter if you signed up.
          </li>
          <li>To answer your messages.</li>
        </ul>
      ),
    },
    {
      id: 'who-can-see-it',
      title: 'Who can see what',
      short:
        'Visitors see the leaderboard, approved projects, posts, and profiles. Officers see what they review. Your email is never public.',
      body: (
        <>
          <p>
            <strong>Anyone visiting the site</strong> can see the leaderboard (names,
            points, badges), approved projects with their team, published blog posts, and
            member profile pages.
          </p>
          <p>
            <strong>Officers</strong> (students elected to run the club) can see
            applications, submissions and code, RSVPs, attendance, GitHub requests, and
            contact messages, so they can review and reply. <strong>Admins</strong> can
            also change roles and site settings.
          </p>
          <p>
            Your email address is never shown publicly. Unapproved projects and
            suggestions are only visible to you and the officers.
          </p>
        </>
      ),
    },
    {
      id: 'where-its-stored',
      title: 'Where it’s stored',
      short:
        'Cloudflare hosts the site and its data. Google sends our email. Google and GitHub handle sign-in if you pick them.',
      body: (
        <>
          <p>The site runs on a few services, each only getting what it needs:</p>
          <ul>
            <li>
              <strong>Cloudflare</strong> hosts the site. Your data lives in a Cloudflare
              D1 database, and uploaded images (avatars, project screenshots) in
              Cloudflare R2 storage. Backups of the database are kept in private R2
              storage and deleted on a schedule. Cloudflare Turnstile checks that forms
              are filled in by people, not bots, and it sees basic browser and connection
              details when it runs.
            </li>
            <li>
              <strong>Google</strong> delivers our emails through the club’s Gmail
              account, so it sees the address and the message.
            </li>
            <li>
              <strong>Google and GitHub</strong> handle sign-in if you choose them.
            </li>
            <li>
              <strong>GitHub</strong> also receives your username when an officer sends
              your org invite.
            </li>
          </ul>
          <p>
            We <strong>never sell</strong> your information or share it with advertisers.
          </p>
        </>
      ),
    },
    {
      id: 'emails',
      title: 'Emails you get',
      short:
        'Turn notifications on or off in Account settings. Account emails always go out. Every newsletter can unsubscribe you.',
      body: (
        <p>
          Turn notification emails on or off in{' '}
          <Link to="/account">Account settings</Link>. Emails you need for your account,
          like confirming your address or resetting your password, always go out. Every
          newsletter has an unsubscribe link at the bottom that takes you off the list
          without needing an account.
        </p>
      ),
    },
    {
      id: 'how-long',
      title: 'How long we keep it',
      short:
        'As long as you have an account. Contact messages stay until an officer deletes them.',
      body: (
        <p>
          As long as you have an account. Points and projects stay so the leaderboard and
          showcase keep their history after you graduate, unless you delete your account.
          Contact messages are kept until an officer deletes them once they’ve been
          answered.
        </p>
      ),
    },
    {
      id: 'delete',
      title: 'Deleting your account and data',
      short:
        'Delete account removes your data. Blog posts you wrote as an officer stay up without your name.',
      body: (
        <>
          <p>
            Go to <Link to="/account">Account settings</Link> and choose{' '}
            <strong>Delete account</strong>. That removes your profile, sign-ins,
            application, submissions, projects you created, points, badges, RSVPs,
            attendance, saved resources, and GitHub requests. Blog posts you wrote as an
            officer stay up, without your name on them.
          </p>
          <p>
            To delete a contact message you sent or get off the newsletter, use the
            unsubscribe link or <Link to="/contact">ask the officers</Link>. Leaving the
            club’s GitHub org is done on GitHub, from your organization settings.
          </p>
        </>
      ),
    },
    {
      id: 'students-and-parents',
      title: 'Students and parents',
      short:
        'You must be at least 13. Parents and guardians can ask to see or delete what we have about their student.',
      body: (
        <>
          <p>
            The club is for Ripon High School students. You must be at least 13 to make an
            account; if you’re younger, please don’t sign up.
          </p>
          <p>
            If you’re under 18, talk with a parent or guardian before you join and share
            anything personal. Keep your profile to club stuff: no home address, phone
            number, or anything you wouldn’t say at school.
          </p>
          <p>
            Parents and guardians can <Link to="/contact">contact the officers</Link> to
            see what we have about their student or to have it deleted. The club follows
            Ripon Unified School District policies.
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to this page',
      short: 'We update this page and its date. Big changes also go to members by email.',
      body: (
        <p>
          If we change how we handle your information, we’ll update this page and the date
          at the top. Big changes will also go out by email to members.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      short: 'Message the officers, or find us at lunch in Mr. Derrick’s classroom.',
      body: (
        <p>
          Questions or requests? <Link to="/contact">Send the officers a message</Link>,
          or find us at lunch in Mr. Derrick’s classroom.
        </p>
      ),
    },
  ],
}
