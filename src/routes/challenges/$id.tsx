import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, Eye, Users } from 'lucide-react'
import SplitText from '#/components/bits/SplitText'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { RichText } from '#/components/rich-text/rich-text'
import { RaisedButton } from '#/components/raised-button'
import { DotGridBackground } from '#/components/challenges/dot-grid-bg'
import { DifficultyPill } from '#/components/challenges/meta'
import { SamplePanel } from '#/components/challenges/code-view'
import { SubmissionPanel } from '#/components/challenges/submission-panel'
import { fmtDate } from '#/lib/format'
import { getChallenge } from '#/server/challenges'

export const Route = createFileRoute('/challenges/$id')({
  loader: async ({ params }) => {
    const data = await getChallenge({ data: { id: params.id } })
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Challenge · RHS Coding Club' }] }
    const { challenge } = loaderData
    const title = `${challenge.title} · RHS Coding Club`
    return {
      meta: [
        { title },
        { name: 'description', content: challenge.description },
        { property: 'og:title', content: `Week ${challenge.weekNo}: ${challenge.title}` },
        { property: 'og:description', content: challenge.description },
        ...(loaderData.preview ? [{ name: 'robots', content: 'noindex' }] : []),
      ],
    }
  },
  component: ChallengePage,
})

function ChallengePage() {
  const { challenge, state, preview, solves, mine } = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()

  return (
    <>
      <PageHero
        size="sm"
        background={<DotGridBackground initialDark={theme === 'dark'} />}
        eyebrow={
          <Link
            to="/challenges"
            className="pointer-events-auto inline-flex items-center gap-1.5 transition-colors hover:text-[#101826] dark:hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All challenges
          </Link>
        }
        title={
          <SplitText
            key={challenge.id}
            text={challenge.title}
            tag="span"
            effect="rise"
            splitType="words"
            delay={60}
            duration={0.9}
            trigger="load"
            textAlign="left"
          />
        }
        description={challenge.description}
      >
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#101826]/70 dark:text-white/70">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Week</dt>
            <dd className="text-brand-sky font-mono font-medium">
              Week {challenge.weekNo}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Difficulty</dt>
            <dd>
              <DifficultyPill difficulty={challenge.difficulty} />
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Points</dt>
            <dd className="tabular font-mono font-medium text-[#101826] dark:text-white">
              {challenge.points} pts
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4" aria-hidden="true" />
            <dt className="sr-only">Solves</dt>
            <dd>
              <span className="tabular font-mono font-medium text-[#101826] dark:text-white">
                {solves}
              </span>{' '}
              {solves === 1 ? 'solve' : 'solves'}
            </dd>
          </div>
          {!preview && challenge.publishedAt && (
            <div className="hidden sm:block">
              <dt className="sr-only">Posted</dt>
              <dd>Posted {fmtDate(challenge.publishedAt, 'date')}</dd>
            </div>
          )}
        </dl>
      </PageHero>

      {preview && (
        <div
          role="status"
          className="mx-2.5 mt-2.5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-500/12 px-5 py-3 text-sm text-amber-800 ring-1 ring-amber-500/25 ring-inset dark:text-amber-200"
        >
          <span className="inline-flex items-center gap-2 font-medium">
            <Eye className="size-4" aria-hidden="true" />
            Preview, not live yet.{' '}
            <span className="font-normal opacity-80">
              {state === 'scheduled' && challenge.publishedAt
                ? `Goes live ${fmtDate(challenge.publishedAt, 'datetime')}.`
                : 'This is a draft. Only officers can see it.'}
            </span>
          </span>
          <Link
            to="/admin/challenges/$id"
            params={{ id: challenge.id }}
            className="font-medium underline underline-offset-4"
          >
            Edit in admin
          </Link>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-10 px-(--gutter) py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14">
        <FadeUp className="min-w-0 lg:col-start-1 lg:row-start-1">
          <article aria-label="Challenge prompt">
            <RichText value={challenge.prompt} className="max-w-[68ch]" />
          </article>

          {(challenge.sampleInput || challenge.sampleOutput) && (
            <section aria-labelledby="samples-heading" className="mt-12">
              <h2
                id="samples-heading"
                className="text-2xl font-semibold tracking-[-0.03em]"
              >
                Sample
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {challenge.sampleInput && (
                  <SamplePanel label="Input" value={challenge.sampleInput} />
                )}
                {challenge.sampleOutput && (
                  <SamplePanel label="Expected output" value={challenge.sampleOutput} />
                )}
              </div>
            </section>
          )}
        </FadeUp>

        <div className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <FadeUp delay={0.1}>
            <SubmissionPanel
              key={`${challenge.id}-${mine?.status ?? 'none'}`}
              challengeId={challenge.id}
              points={challenge.points}
              live={!preview}
              viewer={user ? { role: user.role } : null}
              mine={mine}
            />
          </FadeUp>
        </div>

        <div className="border-border flex lg:col-start-1 lg:row-start-2 lg:self-start flex-wrap items-center justify-between gap-4 border-t pt-8 lg:mt-4">
          <p className="text-muted-foreground text-sm">
            Stuck? Bring it to lunch in Mr. Derrick&apos;s room and work it out with the
            club.
          </p>
          <RaisedButton asChild variant="outline">
            <Link to="/challenges">
              <ArrowLeft aria-hidden="true" />
              All challenges
            </Link>
          </RaisedButton>
        </div>
      </div>
    </>
  )
}
