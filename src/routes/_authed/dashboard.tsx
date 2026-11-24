import { createFileRoute } from '@tanstack/react-router'
import { GuestStatus } from '#/components/dashboard/guest-status'
import { SeasonBody, SeasonMeter, SeasonScore } from '#/components/dashboard/season'
import { PageHero } from '#/components/page-hero'
import { BeamsBackground } from '#/components/projects/beams-bg'
import { getMyDashboard } from '#/server/members'

export const Route = createFileRoute('/_authed/dashboard')({
  loader: async () => ({ d: await getMyDashboard(), now: new Date() }),
  head: () => ({
    meta: [
      { title: 'Dashboard · RHS Coding Club' },
      { name: 'description', content: 'Your points, challenges, events, and projects.' },
    ],
  }),
  component: DashboardPage,
})

function DashboardPage() {
  const { d, now } = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const first = user.name.split(' ')[0] || user.name

  if (d.kind === 'guest') {
    return (
      <>
        <PageHero
          size="sm"
          background={<BeamsBackground initialDark={theme === 'dark'} />}
          title={`Hey, ${first}.`}
          description={guestLine(d.application)}
        />
        <div className="mx-auto max-w-6xl px-(--gutter) py-12 sm:py-16">
          <GuestStatus application={d.application} />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHero
        size="lg"
        background={<BeamsBackground initialDark={theme === 'dark'} />}
        title={`${first}'s season`}
        description="Every solve, check-in, and shipped project this semester, in one place."
        aside={<SeasonScore d={d} />}
      >
        <SeasonMeter d={d} />
      </PageHero>
      <SeasonBody d={d} userId={user.id} now={now} />
    </>
  )
}

type GuestDash = Extract<Awaited<ReturnType<typeof getMyDashboard>>, { kind: 'guest' }>

function guestLine(application: GuestDash['application']) {
  if (!application)
    return 'Welcome to RHS Coding Club. One short application and you’re in.'
  if (application.status === 'pending') return 'Your application is with the officers.'
  return 'Your application needs another look.'
}
