import { createFileRoute } from '@tanstack/react-router'
import { Code2 } from 'lucide-react'
import DecryptedText from '#/components/bits/DecryptedText'
import { PageHero } from '#/components/page-hero'
import { EmptyState } from '#/components/empty-state'
import { FadeUp } from '#/components/motion'
import { DotGridBackground } from '#/components/challenges/dot-grid-bg'
import { ThisWeekCard } from '#/components/challenges/this-week'
import { ChallengeArchive } from '#/components/challenges/archive'
import { HowItWorks } from '#/components/challenges/how-it-works'
import { hasRole } from '#/lib/roles'
import { memberProgress } from '#/lib/schemas/challenges'
import { listChallenges } from '#/server/challenges'

const DESCRIPTION =
  'A new problem every week, from warmups to real head-scratchers. Solve it in any language, submit a link, and earn points when an officer signs off.'

export const Route = createFileRoute('/challenges/')({
  loader: () => listChallenges(),
  head: () => ({
    meta: [
      { title: 'Challenges · RHS Coding Club' },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: 'Weekly challenges · RHS Coding Club' },
      { property: 'og:description', content: DESCRIPTION },
    ],
  }),
  component: ChallengesPage,
})

function ChallengesPage() {
  const { challenges, featured, mine, points } = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const initialDark = theme === 'dark'
  const isMember = hasRole(user?.role, 'member')
  const solvedCount = Object.values(mine).filter((s) => s === 'pass').length
  const totalSolves = challenges.reduce((n, c) => n + c.solves, 0)

  return (
    <>
      <PageHero
        background={<DotGridBackground initialDark={initialDark} />}
        title={
          <DecryptedText
            text="Weekly challenges"
            animateOn="view"
            sequential
            revealDirection="start"
            speed={40}
            encryptedClassName="text-brand-sky"
          />
        }
        description={DESCRIPTION}
        aside={
          <dl className="flex gap-8 sm:gap-10">
            <HeroStat term="Challenges" value={challenges.length} />
            <HeroStat term="Solves" value={totalSolves} />
            {isMember && <HeroStat term="Yours" value={solvedCount} />}
          </dl>
        }
      />

      {featured ? (
        <section
          aria-labelledby="this-week-heading"
          className="mx-auto max-w-6xl overflow-x-clip px-(--gutter) pt-16 xl:overflow-visible sm:pt-24"
        >
          <FadeUp>
            <h2
              id="this-week-heading"
              className="mb-8 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              This week
            </h2>
          </FadeUp>
          <FadeUp delay={0.05}>
            <ThisWeekCard
              challenge={featured}
              progress={user ? memberProgress(mine[featured.id]) : null}
              initialDark={initialDark}
            />
          </FadeUp>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-(--gutter) pt-16 sm:pt-24">
          <EmptyState icon={<Code2 />} title="The first challenge drops soon.">
            Officers post a new problem every week. Check back after the next meeting.
          </EmptyState>
        </section>
      )}

      <HowItWorks points={points} />

      {challenges.length > 0 && (
        <ChallengeArchive
          challenges={challenges}
          mine={mine}
          showSolvedFilter={isMember}
          initialDark={initialDark}
        />
      )}
    </>
  )
}

function HeroStat({ term, value }: { term: string; value: number }) {
  return (
    <div>
      <dt className="text-sm text-[#101826]/60 dark:text-white/60">{term}</dt>
      <dd className="tabular mt-1 font-mono text-4xl font-medium tracking-tight text-[#101826] dark:text-white">
        {value}
      </dd>
    </div>
  )
}
