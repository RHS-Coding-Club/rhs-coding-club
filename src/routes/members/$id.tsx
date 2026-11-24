import { createFileRoute, notFound } from '@tanstack/react-router'
import { Award } from '#/components/icons/award'
import { CodeXml } from '#/components/icons/code-xml'
import { FolderGit2 } from '#/components/icons/folder-git-2'
import { EmptyState } from '#/components/empty-state'
import { BadgeBinder, RARITY_ORDER } from '#/components/members/badge-binder'
import { DotGridBackground } from '#/components/members/dot-grid-bg'
import { GithubLink, MemberCard } from '#/components/members/member-card'
import { ProjectRail } from '#/components/members/project-rail'
import { RARITY } from '#/components/members/rarity'
import { WeeksSolved } from '#/components/members/weeks-solved'
import { FadeUp } from '#/components/motion'
import { PageHero } from '#/components/page-hero'
import { useIsDark } from '#/hooks/use-is-dark'
import { fmtDate } from '#/lib/format'
import { ROLE_LABEL } from '#/lib/schemas/users'
import { cn } from '#/lib/utils'
import { getMember } from '#/server/members'

export const Route = createFileRoute('/members/$id')({
  loader: async ({ params }) => {
    const profile = await getMember({ data: { id: params.id } })
    if (!profile) throw notFound()
    return profile
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Member not found · RHS Coding Club' }] }
    const { user, stats } = loaderData
    const title = `${user.name} · RHS Coding Club`
    const description =
      user.bio ??
      `${user.name} has ${stats.allTime.toLocaleString('en-US')} points and ${stats.solved} solved challenges at RHS Coding Club.`
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
      ],
    }
  },
  component: MemberPage,
})

const heading = 'text-3xl font-semibold tracking-[-0.035em] sm:text-4xl'

function MemberPage() {
  const p = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  const dark = useIsDark(theme === 'dark')
  const { user, stats, collection, weeks } = p
  const earned = collection.filter((b) => b.awardedAt)
  const counts = RARITY_ORDER.map((r) => ({
    r,
    n: earned.filter((b) => b.rarity === r).length,
  })).filter((x) => x.n > 0)

  return (
    <>
      <PageHero
        size="lg"
        background={<DotGridBackground initialDark={theme === 'dark'} />}
        eyebrow={`${ROLE_LABEL[user.role]}${user.gradYear ? ` · Class of ${user.gradYear}` : ''}`}
        title={user.name}
        description={
          user.bio ??
          `In RHS Coding Club since ${fmtDate(user.createdAt)}, with ${stats.allTime.toLocaleString('en-US')} points.`
        }
        actions={user.githubUsername ? <GithubLink user={user} /> : undefined}
        aside={<MemberCard p={p} dark={dark} />}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-(--gutter) py-14 sm:gap-24 sm:py-20">
        <section aria-labelledby="badges-heading">
          <FadeUp className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="badges-heading" className={heading}>
                The collection
              </h2>
              <p className="text-muted-foreground mt-2">
                {earned.length} of {collection.length} badges collected
              </p>
            </div>
            {counts.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Collected by rarity">
                {counts.map(({ r, n }) => (
                  <li
                    key={r}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs ring-1',
                      RARITY[r].chip,
                    )}
                  >
                    <span className="font-mono font-medium tabular-nums">{n}</span>{' '}
                    {RARITY[r].label.toLowerCase()}
                  </li>
                ))}
              </ul>
            )}
          </FadeUp>
          <FadeUp>
            {collection.length === 0 ? (
              <EmptyState icon={<Award />} title="No badges to collect yet." />
            ) : (
              <BadgeBinder collection={collection} />
            )}
          </FadeUp>
        </section>

        <section
          aria-labelledby="solved-heading"
          className="grid gap-8 lg:grid-cols-[1fr_2fr]"
        >
          <FadeUp>
            <h2 id="solved-heading" className={heading}>
              Weeks solved
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xs text-pretty">
              {stats.solved} of {weeks.length} weekly challenges passed. Old weeks stay
              open, so there&apos;s always one to go back for.
            </p>
          </FadeUp>
          <FadeUp>
            {weeks.length === 0 ? (
              <EmptyState icon={<CodeXml />} title="No challenges posted yet." />
            ) : (
              <WeeksSolved weeks={weeks} solved={p.solved} />
            )}
          </FadeUp>
        </section>

        <section aria-labelledby="projects-heading">
          <FadeUp className="mb-6 flex items-baseline gap-3">
            <h2 id="projects-heading" className={heading}>
              Shipped
            </h2>
            {p.projects.length > 0 && (
              <span className="text-muted-foreground font-mono text-sm">
                {p.projects.length}
              </span>
            )}
          </FadeUp>
          <FadeUp>
            {p.projects.length === 0 ? (
              <EmptyState icon={<FolderGit2 />} title="No approved projects yet." />
            ) : (
              <ProjectRail rows={p.projects} />
            )}
          </FadeUp>
        </section>
      </div>
    </>
  )
}
