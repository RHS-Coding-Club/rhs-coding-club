import { createFileRoute } from '@tanstack/react-router'
import Counter from '#/components/bits/Counter'
import SplitText from '#/components/bits/SplitText'
import { GuestStatus } from '#/components/dashboard/guest-status'
import {
  BadgesCard,
  ChallengeCard,
  EventsCard,
  LedgerCard,
  ProjectsCard,
  QueuesCard,
} from '#/components/dashboard/member-panels'
import { QuickDock } from '#/components/dashboard/quick-dock'
import { LightRaysBackground } from '#/components/members/light-rays-bg'
import { PageHero } from '#/components/page-hero'
import { useIsDark } from '#/hooks/use-is-dark'
import { hasRole } from '#/lib/roles'
import { getMyDashboard } from '#/server/members'

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
  const dark = useIsDark(theme === 'dark')
  const first = user.name.split(' ')[0] || user.name
  const isMember = d.kind === 'member'

  return (
    <>
      <PageHero
        size="sm"
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
        description={
          isMember
            ? 'Here’s where you stand this week.'
            : 'Welcome to RHS Coding Club. You’re signed in as a guest.'
        }
        aside={
          d.kind === 'member' ? (
            <dl className="flex gap-10 text-[#101826] dark:text-white">
              <div>
                <dt className="text-sm text-[#101826]/60 dark:text-white/60">
                  Points this semester
                </dt>
                <dd className="mt-1">
                  <Counter
                    value={d.points.semester}
                    fontSize="clamp(2.75rem, 5vw, 3.75rem)"
                    fontWeight={600}
                    format={{ useGrouping: true }}
                    className="tracking-[-0.04em]"
                  />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[#101826]/60 dark:text-white/60">
                  Semester rank
                </dt>
                <dd className="mt-1">
                  {d.points.rank ? (
                    <Counter
                      value={d.points.rank}
                      prefix="#"
                      fontSize="clamp(2.75rem, 5vw, 3.75rem)"
                      fontWeight={600}
                      className="tracking-[-0.04em]"
                    />
                  ) : (
                    <span className="text-[clamp(2.75rem,5vw,3.75rem)] leading-none font-semibold text-[#101826]/40 dark:text-white/40">
                      None
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-6xl px-(--gutter)">
        <QuickDock
          dark={dark}
          isMember={isMember}
          isOfficer={hasRole(user.role, 'officer')}
        />
      </div>

      <div className="mx-auto max-w-6xl px-(--gutter) pt-6 pb-16 sm:pb-24">
        {d.kind === 'guest' ? (
          <GuestStatus application={d.application} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {d.queues && (
              <div className="lg:col-span-3">
                <QueuesCard queues={d.queues} />
              </div>
            )}
            <ChallengeCard challenge={d.challenge} />
            <EventsCard rsvps={d.rsvps} delay={0.05} />
            <BadgesCard badges={d.badges} profileId={user.id} delay={0.1} />
            <div className="lg:col-span-2">
              <LedgerCard ledger={d.ledger} delay={0.05} />
            </div>
            <ProjectsCard projects={d.projects} delay={0.1} />
          </div>
        )}
      </div>
    </>
  )
}
