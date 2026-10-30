import { Link, createFileRoute } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { z } from 'zod'
import CountUp from '#/components/bits/CountUp'
import { EmptyState } from '#/components/empty-state'
import { LightRaysBackground } from '#/components/members/light-rays-bg'
import { HowPoints, Podium, RankList, WindowTabs } from '#/components/members/leaderboard'
import { semesterName } from '#/components/members/leaderboard-helpers'
import { FadeUp } from '#/components/motion'
import { PageHero } from '#/components/page-hero'
import { RaisedButton } from '#/components/raised-button'
import { TooltipProvider } from '#/components/ui/tooltip'
import { useIsDark } from '#/hooks/use-is-dark'
import { hasRole } from '#/lib/roles'
import { listLeaderboard } from '#/server/members'

const searchSchema = z.object({
  window: z.enum(['semester', 'all']).optional().catch(undefined),
})

const DESCRIPTION =
  'Every solved challenge, check-in, and approved project at RHS Coding Club adds up here.'

export const Route = createFileRoute('/leaderboard')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ window: search.window ?? 'semester' }),
  loader: ({ deps }) => listLeaderboard({ data: { window: deps.window } }),
  head: () => ({
    meta: [
      { title: 'Leaderboard · RHS Coding Club' },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: 'Leaderboard · RHS Coding Club' },
      { property: 'og:description', content: DESCRIPTION },
    ],
  }),
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const board = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const dark = useIsDark(theme === 'dark')
  const range = board.window
  const podium = board.rows.slice(0, 3)
  const rest = board.rows.slice(3)
  const period = range === 'semester' ? semesterName(board.since) : 'All time'

  return (
    <TooltipProvider>
      <PageHero
        size="md"
        background={<LightRaysBackground initialDark={theme === 'dark'} />}
        title="Leaderboard"
        description={
          range === 'semester'
            ? `Points earned since the ${period.toLowerCase()} semester started. Solve, show up, ship.`
            : 'Every point since the ledger began. The long game.'
        }
        aside={
          board.ranked > 0 ? (
            <dl className="flex gap-10 text-[#101826] dark:text-white">
              <div>
                <dt className="text-sm text-[#101826]/60 dark:text-white/60">
                  Members ranked
                </dt>
                <dd className="mt-1 text-4xl font-semibold tracking-[-0.04em] tabular-nums">
                  <CountUp to={board.ranked} duration={1.2} trigger="load" />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[#101826]/60 dark:text-white/60">
                  Points {range === 'semester' ? 'this semester' : 'all time'}
                </dt>
                <dd className="mt-1 text-4xl font-semibold tracking-[-0.04em] tabular-nums">
                  <CountUp
                    to={board.totalPoints}
                    separator=","
                    duration={1.6}
                    trigger="load"
                  />
                </dd>
              </div>
            </dl>
          ) : undefined
        }
      >
        <WindowTabs value={range} />
      </PageHero>

      <section
        className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-20"
        aria-label={`${period} rankings`}
      >
        {board.rows.length === 0 ? (
          <EmptyState
            icon={<Trophy />}
            title={
              range === 'semester'
                ? 'Nobody has scored this semester yet.'
                : 'The board is empty.'
            }
            action={
              <RaisedButton asChild variant="outline">
                <Link to="/challenges">See this week’s challenge</Link>
              </RaisedButton>
            }
          >
            Pass a weekly challenge or check in at a meeting and your name goes up here
            first.
          </EmptyState>
        ) : (
          <>
            <Podium rows={podium} dark={dark} viewerId={user?.id ?? null} />
            {(rest.length > 0 || board.pinned) && (
              <FadeUp className="mt-6">
                <RankList rows={rest} viewerId={user?.id ?? null} pinned={board.pinned} />
              </FadeUp>
            )}
          </>
        )}
        <ViewerNote
          signedIn={Boolean(user)}
          isMember={hasRole(user?.role, 'member')}
          ranked={board.viewerRank !== null}
          range={range}
          hasRows={board.rows.length > 0}
        />
      </section>

      <section
        className="mx-auto max-w-6xl px-(--gutter) pb-16 sm:pb-24"
        aria-labelledby="how-points-heading"
      >
        <FadeUp className="mb-8 max-w-2xl">
          <h2
            id="how-points-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            How points work
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Points are a ledger, not a score someone types in. Every entry links back to
            the solve, check-in, or project that earned it.
          </p>
        </FadeUp>
        <HowPoints values={board.values} />
      </section>
    </TooltipProvider>
  )
}

/** One line under the board for viewers who are not on it. */
function ViewerNote({
  signedIn,
  isMember,
  ranked,
  range,
  hasRows,
}: {
  signedIn: boolean
  isMember: boolean
  ranked: boolean
  range: 'semester' | 'all'
  hasRows: boolean
}) {
  if (ranked || !hasRows) return null
  let text: React.ReactNode
  if (!signedIn) {
    text = (
      <>
        Want your name up here?{' '}
        <Link to="/join" className="text-primary underline-offset-4 hover:underline">
          Join the club
        </Link>
        .
      </>
    )
  } else if (!isMember) {
    text = (
      <>
        Guests don’t appear on the board yet.{' '}
        <Link to="/join" className="text-primary underline-offset-4 hover:underline">
          Apply to join
        </Link>{' '}
        and your points start counting.
      </>
    )
  } else {
    text = (
      <>
        You haven’t scored {range === 'semester' ? 'this semester' : 'yet'}. Start with{' '}
        <Link
          to="/challenges"
          className="text-primary underline-offset-4 hover:underline"
        >
          this week’s challenge
        </Link>
        .
      </>
    )
  }
  return <p className="text-muted-foreground mt-6 text-center text-sm">{text}</p>
}
