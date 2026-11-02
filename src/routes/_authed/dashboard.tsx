import { Link, createFileRoute } from '@tanstack/react-router'
import { Code2, Trophy, UserRound } from 'lucide-react'
import SplitText from '#/components/bits/SplitText'
import { GuestStatus } from '#/components/dashboard/guest-status'
import {
  ActivityPanel,
  BadgesPanel,
  ChallengePanel,
  NextUpPanel,
  PointsPanel,
  ProjectsPanel,
  QueueStrip,
  StatsPanel,
} from '#/components/dashboard/member-panels'
import { LightRaysBackground } from '#/components/members/light-rays-bg'
import { PageHero } from '#/components/page-hero'
import { RaisedButton } from '#/components/raised-button'
import { fmtDate } from '#/lib/format'
import { getMyDashboard } from '#/server/members'
import type { Dashboard } from '#/services/members'

export const Route = createFileRoute('/_authed/dashboard')({
  loader: () => getMyDashboard(),
  head: () => ({
    meta: [
      { title: 'Dashboard · RHS Coding Club' },
      { name: 'description', content: 'Your points, challenges, events, and projects.' },
    ],
  }),
  component: DashboardPage,
})

function DashboardPage() {
  const d = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const first = user.name.split(' ')[0] || user.name

  return (
    <>
      <PageHero
        background={<LightRaysBackground initialDark={theme === 'dark'} />}
        title={
          <>
            <span className="sr-only">Hey, {first}.</span>
            <SplitText
              text={`Hey, ${first}.`}
              tag="span"
              splitType="chars"
              effect="rise"
              trigger="load"
              delay={35}
              duration={0.7}
              textAlign="left"
              aria-hidden="true"
            />
          </>
        }
        description={d.kind === 'member' ? memberLine(d) : guestLine(d.application)}
        actions={
          d.kind === 'member' ? <MemberActions d={d} userId={user.id} /> : undefined
        }
      />

      <div className="mx-auto max-w-6xl px-(--gutter) py-12 sm:py-16">
        {d.kind === 'guest' ? (
          <GuestStatus application={d.application} />
        ) : (
          <div className="flex flex-col gap-4">
            {d.queues && <QueueStrip queues={d.queues} />}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
              <div className="lg:col-span-4">
                <PointsPanel points={d.points} />
              </div>
              <div className="lg:col-span-2">
                <StatsPanel stats={d.stats} delay={0.05} />
              </div>
              <div className="lg:col-span-3">
                <ChallengePanel challenge={d.challenge} />
              </div>
              <div className="lg:col-span-3">
                <NextUpPanel rsvps={d.rsvps} delay={0.05} />
              </div>
              <div className="lg:col-span-2">
                <BadgesPanel badges={d.badges} profileId={user.id} />
              </div>
              <div className="lg:col-span-2">
                <ActivityPanel ledger={d.ledger} delay={0.05} />
              </div>
              <div className="lg:col-span-2">
                <ProjectsPanel projects={d.projects} delay={0.1} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

type MemberDash = Extract<Dashboard, { kind: 'member' }>
type GuestDash = Extract<Dashboard, { kind: 'guest' }>

/** One line under the greeting: the most useful thing to know right now. */
function memberLine(d: MemberDash) {
  if (d.challenge && !d.challenge.submission)
    return `Week ${d.challenge.weekNo}'s challenge is open: ${d.challenge.title}.`
  const next = d.rsvps.at(0)
  if (next) return `Next up: ${next.title}, ${fmtDate(next.startsAt, 'weekday')}.`
  if (d.points.rank)
    return `You're #${d.points.rank} on the semester board with ${d.points.semester.toLocaleString('en-US')} points.`
  return 'Pass a challenge or check in at a meeting to get on the board.'
}

function guestLine(application: GuestDash['application']) {
  if (!application)
    return 'Welcome to RHS Coding Club. One short application and you’re in.'
  if (application.status === 'pending') return 'Your application is with the officers.'
  return 'Your application needs another look.'
}

function MemberActions({ d, userId }: { d: MemberDash; userId: string }) {
  const open = d.challenge && !d.challenge.submission ? d.challenge : null
  return (
    <>
      {open ? (
        <RaisedButton asChild size="lg">
          <Link to="/challenges/$id" params={{ id: open.id }}>
            <Code2 />
            Solve week {open.weekNo}
          </Link>
        </RaisedButton>
      ) : (
        <RaisedButton asChild size="lg">
          <Link to="/leaderboard">
            <Trophy />
            Leaderboard
          </Link>
        </RaisedButton>
      )}
      <RaisedButton asChild size="lg" variant="secondary">
        <Link to="/members/$id" params={{ id: userId }}>
          <UserRound />
          Your profile
        </Link>
      </RaisedButton>
    </>
  )
}
