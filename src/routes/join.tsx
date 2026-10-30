import { Link, createFileRoute } from '@tanstack/react-router'
import {
  CalendarCheck,
  Code2,
  Clock3,
  FolderGit2,
  PartyPopper,
  Trophy,
} from 'lucide-react'
import { ApplicationStepper } from '#/components/join/application-stepper'
import { ThreadsBackground } from '#/components/join/threads-bg'
import { FadeUp } from '#/components/motion'
import { PageHero } from '#/components/page-hero'
import { RaisedButton } from '#/components/raised-button'
import { SplitButton } from '#/components/split-button'
import { useIsDark } from '#/hooks/use-is-dark'
import { fmtDate } from '#/lib/format'
import { getJoin } from '#/server/membership'

const DESCRIPTION =
  'Join RHS Coding Club: weekly challenges, lunch meetings in Mr. Derrick’s classroom, teaching at RAP, and the H2O hackathon. No experience required.'

export const Route = createFileRoute('/join')({
  loader: () => getJoin(),
  head: () => ({
    meta: [
      { title: 'Join · RHS Coding Club' },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: 'Join RHS Coding Club' },
      { property: 'og:description', content: DESCRIPTION },
    ],
  }),
  component: JoinPage,
})

const HERO_COPY = {
  'signed-out': 'Make an account, answer a few questions, and an officer brings you in.',
  apply: 'Four quick steps. An officer reads every application.',
  pending: 'Your application is in. Hang tight.',
  member: 'You’re already a member. Welcome back.',
} as const

function JoinPage() {
  const state = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  const dark = useIsDark(theme === 'dark')

  return (
    <>
      <PageHero
        size="sm"
        background={<ThreadsBackground initialDark={theme === 'dark'} />}
        title={state.kind === 'member' ? 'You’re in.' : 'Join the club'}
        description={HERO_COPY[state.kind]}
      />
      <section className="mx-auto max-w-6xl px-(--gutter) py-12 sm:py-16">
        {state.kind === 'signed-out' && <SignedOut />}
        {state.kind === 'apply' && (
          <div className="mx-auto max-w-2xl">
            {state.previous && (
              <FadeUp className="ring-border/70 bg-card mb-6 rounded-3xl p-5 ring-1">
                <p className="font-medium">
                  Your application from {fmtDate(state.previous.createdAt)} wasn’t
                  approved.
                </p>
                {state.previous.reviewNote && (
                  <blockquote className="border-brand-sky text-muted-foreground mt-2 border-l-2 pl-3 text-sm">
                    {state.previous.reviewNote}
                  </blockquote>
                )}
                <p className="text-muted-foreground mt-2 text-sm">
                  Your last answers are filled in below. Update them and send it again.
                </p>
              </FadeUp>
            )}
            <FadeUp>
              <ApplicationStepper
                dark={dark}
                defaults={
                  state.previous
                    ? {
                        grade: state.previous.grade as never,
                        experience: state.previous.experience as never,
                        languages: state.previous.languages,
                        interests: state.previous.interests,
                        goals: state.previous.goals,
                        whyJoin: state.previous.whyJoin,
                        availability: state.previous.availability
                          .split(', ')
                          .filter(Boolean),
                        githubUsername: state.previous.githubUsername ?? '',
                      }
                    : undefined
                }
              />
            </FadeUp>
          </div>
        )}
        {state.kind === 'pending' && (
          <StatusCard
            icon={<Clock3 />}
            title="Under review"
            body={`You applied on ${fmtDate(state.application.createdAt)}. An officer usually reviews applications within a week, and you’ll get an email with the decision. Guests can still browse challenges, events, and projects.`}
            actions={
              <>
                <RaisedButton asChild size="lg">
                  <Link to="/dashboard">Go to your dashboard</Link>
                </RaisedButton>
                <RaisedButton asChild size="lg" variant="outline">
                  <Link to="/challenges">See this week’s challenge</Link>
                </RaisedButton>
              </>
            }
          />
        )}
        {state.kind === 'member' && (
          <StatusCard
            icon={<PartyPopper />}
            title="You’re already a member"
            body="Everything is unlocked: submit challenges, RSVP and check in, and add projects to the showcase."
            actions={
              <>
                <RaisedButton asChild size="lg">
                  <Link to="/dashboard">Open your dashboard</Link>
                </RaisedButton>
                <RaisedButton asChild size="lg" variant="outline">
                  <Link to="/challenges">This week’s challenge</Link>
                </RaisedButton>
              </>
            }
          />
        )}
      </section>
    </>
  )
}

const PERKS = [
  {
    icon: Code2,
    title: 'A problem every week',
    body: 'Easy to hard, any language. Officers review every solution.',
  },
  {
    icon: Trophy,
    title: 'Points and badges',
    body: 'Every solve and check-in goes on the leaderboard.',
  },
  {
    icon: CalendarCheck,
    title: 'Meetings and RAP',
    body: 'Lunch in Mr. Derrick’s classroom, afternoons teaching at Ripon Elementary.',
  },
  {
    icon: FolderGit2,
    title: 'Ship with a team',
    body: 'Build for the H2O hackathon and put it in the showcase.',
  },
]

function SignedOut() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
      <FadeUp>
        <h2 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Two minutes to start.
        </h2>
        <ol className="text-muted-foreground mt-6 flex flex-col gap-3 text-lg">
          <li>
            <span className="text-foreground font-medium">1.</span> Create an account with
            Google, GitHub, or email.
          </li>
          <li>
            <span className="text-foreground font-medium">2.</span> Answer four short
            questions about what you want to do.
          </li>
          <li>
            <span className="text-foreground font-medium">3.</span> An officer approves
            you, usually within a week.
          </li>
        </ol>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <SplitButton to="/signup" size="lg">
            Create an account
          </SplitButton>
          <RaisedButton asChild variant="ghost" size="lg">
            <Link to="/login" search={{ redirect: '/join' }}>
              I have an account
            </Link>
          </RaisedButton>
        </div>
      </FadeUp>
      <ul className="grid gap-3 sm:grid-cols-2">
        {PERKS.map((p, i) => (
          <li key={p.title}>
            <FadeUp
              delay={0.05 * i}
              className="ring-border/70 h-full rounded-3xl p-6 ring-1"
              style={{ background: 'var(--bits-surface)' }}
            >
              <p.icon className="text-brand-sky size-5" aria-hidden="true" />
              <p className="mt-5 font-semibold tracking-tight">{p.title}</p>
              <p className="text-muted-foreground mt-1.5 text-sm">{p.body}</p>
            </FadeUp>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusCard({
  icon,
  title,
  body,
  actions,
}: {
  icon: React.ReactNode
  title: string
  body: string
  actions: React.ReactNode
}) {
  return (
    <FadeUp
      className="ring-border/70 mx-auto max-w-2xl rounded-4xl p-8 text-center ring-1 sm:p-12"
      style={{ background: 'var(--bits-surface)' }}
    >
      <span className="text-brand-sky inline-flex [&_svg]:size-8" aria-hidden="true">
        {icon}
      </span>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">{title}</h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-lg">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
    </FadeUp>
  )
}
