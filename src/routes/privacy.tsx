import { Link, createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/legal/legal-page'
import type { LegalSection } from '#/components/legal/legal-page'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy · RHS Coding Club' },
      {
        name: 'description',
        content:
          'What the RHS Coding Club website collects, where it is stored, who can see it, and how to delete it.',
      },
      { property: 'og:title', content: 'Privacy · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Plain-language privacy notice for the RHS Coding Club website.',
      },
    ],
  }),
  component: PrivacyPage,
})

const SECTIONS: LegalSection[] = [
  {
    id: 'short-version',
    title: 'The short version',
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
    body: (
      <>
        <p>Only what you give us or what the club does with you:</p>
        <ul>
          <li>
            <strong>Your account.</strong> Your name and email. If you sign in with Google
            or GitHub, we get your name, email, and profile picture from them, never your
            password for those accounts. If you use a password with us, we store it
            scrambled (hashed), so nobody can read it, officers included.
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
            <strong>What you submit.</strong> Challenge solutions (links and any code you
            paste), projects (descriptions, screenshots, repo and demo links, teammates),
            and resources you suggest.
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
            <strong>Newsletter.</strong> Your email address if you sign up in the footer.
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
          contact messages, so they can review and reply. <strong>Admins</strong> can also
          change roles and site settings.
        </p>
        <p>
          Your email address is never shown publicly. Unapproved projects and suggestions
          are only visible to you and the officers.
        </p>
      </>
    ),
  },
  {
    id: 'where-its-stored',
    title: 'Where it’s stored',
    body: (
      <>
        <p>The site runs on a few services, each only getting what it needs:</p>
        <ul>
          <li>
            <strong>Cloudflare</strong> hosts the site. Your data lives in a Cloudflare D1
            database, and uploaded images (avatars, project screenshots) in Cloudflare R2
            storage.
          </li>
          <li>
            <strong>Resend</strong> delivers our emails, so it sees the address and the
            message.
          </li>
          <li>
            <strong>Google and GitHub</strong> handle sign-in if you choose them.
          </li>
          <li>
            <strong>GitHub</strong> also receives your username when an officer sends your
            org invite.
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
    body: (
      <p>
        Turn notification emails on or off in <Link to="/account">Account settings</Link>.
        Every newsletter has an unsubscribe link at the bottom that takes you off the list
        without needing an account.
      </p>
    ),
  },
  {
    id: 'how-long',
    title: 'How long we keep it',
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
          Parents and guardians can <Link to="/contact">contact the officers</Link> to see
          what we have about their student or to have it deleted. The club follows Ripon
          Unified School District policies.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this page',
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
    body: (
      <p>
        Questions or requests? <Link to="/contact">Send the officers a message</Link>, or
        find us at lunch in Mr. Derrick’s classroom.
      </p>
    ),
  },
]

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      description="What this site collects, where it lives, who can see it, and how to get rid of it. Written for students and parents, not lawyers."
      updated="Oct 29, 2026"
      sections={SECTIONS}
      other={{ to: '/terms', label: 'Terms of use' }}
    />
  )
}
