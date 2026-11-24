import { Suspense } from 'react'
import { ClientOnly, Link, createFileRoute } from '@tanstack/react-router'
import { CalendarCheck } from '#/components/icons/calendar-check'
import { Clock3 } from '#/components/icons/clock-3'
import { CodeXml } from '#/components/icons/code-xml'
import { FolderGit2 } from '#/components/icons/folder-git-2'
import { PartyPopper } from '#/components/icons/party-popper'
import { Trophy } from '#/components/icons/trophy'
import { ApplicationStepper } from '#/components/join/application-stepper'
import { ApprovalDemo } from '#/components/join/approval-demo'
import { JoinFaq } from '#/components/join/join-faq'
import { JoinSteps } from '#/components/join/join-steps'
import { ThreadsBackground } from '#/components/join/threads-bg'
import { FadeUp, riseIn } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { SplitButton } from '#/components/split-button'
import { useIsDark } from '#/hooks/use-is-dark'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
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

const PERKS = [
  {
    icon: CodeXml,
    title: 'A problem every week',
    body: 'Easy to hard, any language. An officer reviews every solution.',
  },
  {
    icon: Trophy,
    title: 'Points and badges',
    body: 'Solves, check-ins, and shipped projects all count on the leaderboard.',
  },
  {
    icon: CalendarCheck,
    title: 'Meetings and RAP',
    body: 'Lunch in Mr. Derrick’s classroom, and afternoons teaching at Ripon Elementary.',
  },
  {
    icon: FolderGit2,
    title: 'Ship with a team',
    body: 'Build for the H2O hackathon and put it in the project showcase.',
  },
]

const STEP = { 'signed-out': 0, apply: 1, pending: 2, member: 3 } as const

/**
 * Signed out: a centered hero over React Bits Threads, then a Stageshow
 * device pair of both sides of the door (an officer approves on the
 * desktop, the notification lands on the applicant's phone), the steps, the
 * perks, and the FAQ. Signed in, the page centers on one column: the step
 * track, then the application, or its status.
 */
function JoinPage() {
  const state = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  const dark = useIsDark(theme === 'dark')
  const signedOut = state.kind === 'signed-out'

  const title = {
    'signed-out': 'Join the club',
    apply: 'Four quick questions',
    pending: 'Application received',
    member: 'You’re in.',
  }[state.kind]
  const lede = {
    'signed-out':
      'Free, open to every RHS student, no experience needed. Apply in two minutes, and an officer lets you in.',
    apply: 'An officer reads every application. Most get an answer within a week.',
    pending:
      state.kind === 'pending'
        ? `You applied on ${fmtDate(state.application.createdAt)}. We’ll email you the decision.`
        : '',
    member: 'Everything is unlocked. Welcome to the club.',
  }[state.kind]

  return (
    <>
      <section className="bg-stage relative -mt-(--header-offset) overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 opacity-70">
          <ClientOnly>
            <Suspense>
              <ThreadsBackground initialDark={theme === 'dark'} />
            </Suspense>
          </ClientOnly>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_40%,color-mix(in_srgb,var(--stage)_85%,transparent),transparent_80%)]"
        />
        <div
          className={cn(
            'relative mx-auto max-w-3xl px-(--gutter) pt-[calc(var(--header-offset)+3.5rem)] text-center sm:pt-[calc(var(--header-offset)+5rem)]',
            signedOut ? 'pb-12 sm:pb-16' : 'pb-14 sm:pb-20',
          )}
        >
          <h1
            style={riseIn(0.05)}
            className="rise-in text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance"
          >
            {title}
          </h1>
          <p
            style={riseIn(0.18)}
            className="rise-in text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-balance sm:text-xl"
          >
            {lede}
          </p>
          {signedOut ? (
            <div
              style={riseIn(0.3)}
              className="rise-in mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <SplitButton to="/signup" size="lg">
                Create an account
              </SplitButton>
              <RaisedButton asChild variant="ghost" size="lg">
                <Link to="/login" search={{ redirect: '/join' }}>
                  I have an account
                </Link>
              </RaisedButton>
            </div>
          ) : (
            <div
              style={riseIn(0.3)}
              className="rise-in bg-card/75 ring-border/70 mx-auto mt-10 max-w-2xl rounded-3xl p-6 text-left ring-1 backdrop-blur-md"
            >
              <JoinSteps current={STEP[state.kind]} />
            </div>
          )}
        </div>
        {signedOut && (
          <div style={riseIn(0.4, 24, 1)} className="rise-in relative mx-auto max-w-6xl">
            <ApprovalDemo initialDark={theme === 'dark'} />
          </div>
        )}
      </section>

      {signedOut ? (
        <SignedOut />
      ) : (
        <section className="mx-auto max-w-2xl px-(--gutter) py-12 sm:py-16">
          {state.kind === 'apply' && (
            <>
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
            </>
          )}
          {(state.kind === 'pending' || state.kind === 'member') && (
            <FadeUp
              className="ring-border/70 rounded-4xl p-8 text-center ring-1 sm:p-12"
              style={{ background: 'var(--bits-surface)' }}
            >
              <span
                className="text-brand-sky inline-flex [&_svg]:size-8"
                aria-hidden="true"
              >
                {state.kind === 'pending' ? <Clock3 /> : <PartyPopper />}
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">
                {state.kind === 'pending'
                  ? 'An officer is reading it'
                  : 'Everything is unlocked'}
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-md text-lg text-pretty">
                {state.kind === 'pending'
                  ? 'Until then you can browse challenges, events, and projects.'
                  : 'Submit challenges, RSVP and check in at meetings, and add projects to the showcase.'}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <RaisedButton asChild size="lg">
                  <Link to="/dashboard">Open your dashboard</Link>
                </RaisedButton>
                <RaisedButton asChild size="lg" variant="outline">
                  <Link to="/challenges">See this week’s challenge</Link>
                </RaisedButton>
              </div>
            </FadeUp>
          )}
        </section>
      )}
    </>
  )
}

function SignedOut() {
  return (
    <>
      <section
        aria-labelledby="steps-heading"
        className="mx-auto max-w-6xl px-(--gutter) py-20 sm:py-28"
      >
        <FadeUp className="max-w-2xl">
          <h2
            id="steps-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            Three steps, about two minutes
          </h2>
        </FadeUp>
        <FadeUp delay={0.08}>
          <JoinSteps current={0} className="mt-12" />
        </FadeUp>
      </section>

      <section className="mx-2.5" aria-labelledby="perks-heading">
        <div className="bg-card ring-border/60 rounded-4xl px-(--gutter) py-16 ring-1 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <FadeUp>
              <h2
                id="perks-heading"
                className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
              >
                What membership unlocks
              </h2>
            </FadeUp>
            <ul className="mt-12 grid gap-10 sm:grid-cols-2">
              {PERKS.map((p, i) => (
                <li key={p.title}>
                  <FadeUp
                    delay={(i % 2) * 0.06}
                    distance={12}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4"
                  >
                    <span className="bg-secondary text-brand-sky grid size-11 place-items-center rounded-xl">
                      <p.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                      <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed text-pretty">
                        {p.body}
                      </p>
                    </div>
                  </FadeUp>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl px-(--gutter) py-20 sm:py-28"
      >
        <FadeUp className="text-center">
          <h2
            id="faq-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            Good questions
          </h2>
        </FadeUp>
        <FadeUp delay={0.08}>
          <JoinFaq className="mt-10" />
        </FadeUp>
        <FadeUp className="mt-14 flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground text-lg">Ready when you are.</p>
          <SplitButton to="/signup" size="lg">
            Create an account
          </SplitButton>
        </FadeUp>
      </section>
    </>
  )
}
