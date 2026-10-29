import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowUpRight, Award, Code2, FolderGit2, Github } from 'lucide-react'
import { EmptyState } from '#/components/empty-state'
import { BadgeShelf } from '#/components/members/badge-shelf'
import { DotGridBackground } from '#/components/members/dot-grid-bg'
import { MemberProfileCard } from '#/components/members/profile-card'
import { Stat } from '#/components/members/stat'
import { FadeUp } from '#/components/motion'
import { PageHero } from '#/components/page-hero'
import { TooltipProvider } from '#/components/ui/tooltip'
import { useIsDark } from '#/hooks/use-is-dark'
import { fileUrl } from '#/lib/files'
import { fmtDate } from '#/lib/format'
import { ROLE_LABEL } from '#/lib/schemas/users'
import { cn } from '#/lib/utils'
import { getMember } from '#/server/members'
import type { MemberProfile } from '#/services/members'

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

function MemberPage() {
  const p = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  const dark = useIsDark(theme === 'dark')
  const { user, stats } = p
  const role = ROLE_LABEL[user.role]

  return (
    <TooltipProvider>
      <PageHero
        size="lg"
        background={<DotGridBackground initialDark={theme === 'dark'} />}
        eyebrow={`${role}${user.gradYear ? ` · Class of ${user.gradYear}` : ''}`}
        title={user.name}
        description={
          user.bio ?? `Member of RHS Coding Club since ${fmtDate(user.createdAt)}.`
        }
        actions={
          user.githubUsername ? (
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#101826]/6 px-4 py-2 font-mono text-sm text-[#101826] ring-1 ring-[#101826]/10 transition-colors hover:bg-[#101826]/10 dark:bg-white/8 dark:text-white dark:ring-white/12 dark:hover:bg-white/14"
            >
              <Github className="size-4" aria-hidden="true" />
              {user.githubUsername}
              <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
            </a>
          ) : undefined
        }
        aside={
          <div className="flex justify-center lg:justify-end">
            <MemberProfileCard user={user} title={role} dark={dark} />
          </div>
        }
      >
        {user.skills.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Skills">
            {user.skills.map((s) => (
              <li
                key={s}
                className="rounded-full bg-white/70 px-3 py-1 text-sm text-[#101826] ring-1 ring-[#101826]/8 backdrop-blur dark:bg-white/8 dark:text-white/85 dark:ring-white/10"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </PageHero>

      <section
        className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-20"
        aria-label="Stats"
      >
        <FadeUp>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            <Stat value={stats.allTime} label="Points, all time" />
            <Stat value={stats.semester} label="This semester" />
            <Stat value={stats.rank} prefix="#" label="Semester rank" empty="Unranked" />
            <Stat value={stats.solved} label="Challenges solved" />
            <Stat value={stats.events} label="Events attended" />
            <Stat value={stats.projects} label="Projects shipped" />
          </dl>
        </FadeUp>
      </section>

      <Section id="badges" title="Badges" count={p.badges.length}>
        {p.badges.length === 0 ? (
          <EmptyState icon={<Award />} title="No badges yet.">
            Badges unlock on their own as points, solves, and check-ins add up.
          </EmptyState>
        ) : (
          <BadgeShelf badges={p.badges} dark={dark} />
        )}
      </Section>

      <div className="mx-auto grid max-w-6xl gap-x-10 px-(--gutter) lg:grid-cols-2">
        <Section id="solved" title="Solved challenges" count={p.solved.length} bare>
          {p.solved.length === 0 ? (
            <EmptyState icon={<Code2 />} title="Nothing solved yet." />
          ) : (
            <SolvedList rows={p.solved} />
          )}
        </Section>
        <Section id="projects" title="Projects" count={p.projects.length} bare>
          {p.projects.length === 0 ? (
            <EmptyState icon={<FolderGit2 />} title="No approved projects yet." />
          ) : (
            <ProjectList rows={p.projects} />
          )}
        </Section>
      </div>
    </TooltipProvider>
  )
}

function Section({
  id,
  title,
  count,
  bare,
  children,
}: {
  id: string
  title: string
  count: number
  /** Inside a parent grid: no own max-width or gutter. */
  bare?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={cn('pb-16 sm:pb-20', !bare && 'mx-auto max-w-6xl px-(--gutter)')}
    >
      <FadeUp className="mb-6 flex items-baseline gap-3">
        <h2
          id={`${id}-heading`}
          className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
        >
          {title}
        </h2>
        {count > 0 && (
          <span className="text-muted-foreground font-mono text-sm">{count}</span>
        )}
      </FadeUp>
      <FadeUp delay={0.05}>{children}</FadeUp>
    </section>
  )
}

const DIFFICULTY_STYLE = {
  easy: 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-300',
  medium: 'text-amber-700 bg-amber-500/10 dark:text-amber-300',
  hard: 'text-rose-700 bg-rose-500/10 dark:text-rose-300',
} as const

function SolvedList({ rows }: { rows: MemberProfile['solved'] }) {
  return (
    <ol className="bg-card ring-border/70 divide-border/70 divide-y overflow-hidden rounded-3xl ring-1">
      {rows.map((c) => (
        <li key={c.id}>
          <Link
            to="/challenges/$id"
            params={{ id: c.id }}
            className="hover:bg-muted/50 focus-visible:bg-muted/60 flex items-center gap-4 px-5 py-4 transition-colors outline-none"
          >
            <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs">
              Wk {c.weekNo}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{c.title}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs capitalize',
                DIFFICULTY_STYLE[c.difficulty],
              )}
            >
              {c.difficulty}
            </span>
            <span className="text-muted-foreground hidden w-16 text-right font-mono text-xs sm:inline">
              {fmtDate(c.solvedAt, 'short')}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

function ProjectList({ rows }: { rows: MemberProfile['projects'] }) {
  return (
    <ul className="grid gap-3">
      {rows.map((pr) => (
        <li key={pr.id}>
          <Link
            to="/projects/$id"
            params={{ id: pr.id }}
            className="group bg-card ring-border/70 hover:ring-border focus-visible:ring-ring flex gap-4 rounded-3xl p-4 ring-1 transition-shadow outline-none focus-visible:ring-2"
          >
            <span className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-2xl">
              {pr.imageKeys[0] ? (
                <img
                  src={fileUrl(pr.imageKeys[0])}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="brand-gradient absolute inset-0 grid place-items-center">
                  <FolderGit2 className="size-6 text-white/80" aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1 py-0.5">
              <span className="flex items-center gap-2">
                <span className="truncate font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                  {pr.title}
                </span>
                {pr.year && (
                  <span className="text-muted-foreground font-mono text-xs">
                    {pr.year}
                  </span>
                )}
              </span>
              <span className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {pr.description}
              </span>
              {pr.tech.length > 0 && (
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {pr.tech.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 font-mono text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
