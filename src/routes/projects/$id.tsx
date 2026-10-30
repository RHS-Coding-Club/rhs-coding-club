import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Github,
  Globe,
  MapPin,
  Pencil,
  TriangleAlert,
} from 'lucide-react'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { SplitButton } from '#/components/split-button'
import { UserAvatar } from '#/components/user-avatar'
import { BeamsBackground } from '#/components/projects/beams-bg'
import { ProjectCover } from '#/components/projects/project-cover'
import { ScreenshotCarousel } from '#/components/projects/screenshot-carousel'
import { TechChip } from '#/components/projects/tech-chip'
import { teamNames } from '#/components/projects/filter'
import { fmtDate } from '#/lib/format'
import { hasRole } from '#/lib/roles'
import { getProject } from '#/server/projects'
import { safeHref } from '#/lib/rich-text'

export const Route = createFileRoute('/projects/$id')({
  loader: async ({ params }) => {
    const view = await getProject({ data: { id: params.id } })
    if (!view) throw notFound()
    return view
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project
    if (!p) return { meta: [{ title: 'Project · RHS Coding Club' }] }
    const title = `${p.title} · RHS Coding Club`
    const description =
      p.description.length > 160 ? `${p.description.slice(0, 157)}…` : p.description
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        ...(p.imageKeys[0]
          ? [{ property: 'og:image', content: `/files/${p.imageKeys[0]}` }]
          : []),
        // Unreviewed work stays out of search engines.
        ...(p.status === 'approved' ? [] : [{ name: 'robots', content: 'noindex' }]),
      ],
    }
  },
  component: ProjectPage,
})

function ProjectPage() {
  const { project, canEdit } = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const initialDark = theme === 'dark'
  const isMember = Boolean(user && hasRole(user.role, 'member'))

  return (
    <>
      <PageHero
        size="sm"
        background={<BeamsBackground initialDark={initialDark} />}
        eyebrow={
          <Link
            to="/projects"
            className="pointer-events-auto inline-flex items-center gap-1.5 transition-colors hover:text-[#101826] dark:hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All projects
          </Link>
        }
        title={project.title}
        description={`Built by ${teamNames(project.team)}${project.year ? ` in ${project.year}` : ''}.`}
        actions={
          <>
            {project.demoUrl && (
              <RaisedButton asChild size="lg">
                <a
                  href={safeHref(project.demoUrl) ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe aria-hidden="true" />
                  Live demo
                </a>
              </RaisedButton>
            )}
            {project.repoUrl && (
              <RaisedButton
                asChild
                size="lg"
                variant={project.demoUrl ? 'outline' : 'primary'}
              >
                <a
                  href={safeHref(project.repoUrl) ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github aria-hidden="true" />
                  View the code
                </a>
              </RaisedButton>
            )}
            {canEdit && (
              <RaisedButton asChild size="lg" variant="ghost">
                <Link to="/projects/$id/edit" params={{ id: project.id }}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </RaisedButton>
            )}
          </>
        }
      />

      {project.status !== 'approved' && (
        <StatusBanner
          status={project.status}
          reason={project.rejectionReason}
          canEdit={canEdit}
          id={project.id}
        />
      )}

      <section className="mx-auto max-w-6xl px-(--gutter) pt-10 sm:pt-14">
        <FadeUp>
          {project.imageKeys.length > 0 ? (
            <ScreenshotCarousel
              title={project.title}
              imageKeys={project.imageKeys}
              initialDark={initialDark}
            />
          ) : (
            <div className="bg-brand-navy relative aspect-[2/1] overflow-hidden rounded-4xl sm:aspect-[5/2]">
              <ProjectCover
                project={project}
                initialDark={initialDark}
                width={1200}
                height={480}
                className="object-left"
              />
            </div>
          )}
        </FadeUp>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-(--gutter) py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <FadeUp>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            About the project
          </h2>
          <div className="text-foreground/85 mt-6 max-w-[68ch] space-y-5 text-lg leading-relaxed">
            {project.description
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
          </div>

          {project.tech.length > 0 && (
            <>
              <h3 className="mt-12 text-lg font-semibold tracking-tight">Built with</h3>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                {project.tech.map((t) => (
                  <li key={t}>
                    <TechChip className="px-3 py-1 text-xs">{t}</TechChip>
                  </li>
                ))}
              </ul>
            </>
          )}
        </FadeUp>

        <FadeUp delay={0.08} className="flex flex-col gap-4">
          <aside
            aria-labelledby="team-heading"
            className="bg-card ring-border/70 rounded-3xl p-6 ring-1"
          >
            <h2 id="team-heading" className="text-lg font-semibold tracking-tight">
              The team
            </h2>
            <ul className="mt-5 flex flex-col gap-1">
              {project.team.map((m, i) => (
                <li key={m.id}>
                  <Link
                    to="/members/$id"
                    params={{ id: m.id }}
                    className="hover:bg-muted/70 focus-visible:ring-ring/50 -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors outline-none focus-visible:ring-3"
                  >
                    <UserAvatar user={m} className="size-10" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{m.name}</span>
                      <span className="text-muted-foreground block text-xs">
                        {i === 0 ? 'Submitted the project' : 'Teammate'}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <aside
            aria-label="Project details"
            className="bg-card ring-border/70 rounded-3xl p-6 ring-1"
          >
            <dl className="flex flex-col gap-4 text-sm">
              {project.year && (
                <Detail icon={CalendarDays} term="Year" value={String(project.year)} />
              )}
              {project.reviewedAt && project.status === 'approved' && (
                <Detail
                  icon={Clock3}
                  term="On the showcase since"
                  value={fmtDate(project.reviewedAt)}
                />
              )}
              <Detail
                icon={MapPin}
                term="Built at"
                value="RHS Coding Club, Ripon High School"
              />
            </dl>
          </aside>

          <div className="bg-brand-navy rounded-3xl p-6 text-[#e6edf5]">
            <p className="text-lg font-semibold tracking-tight">
              Built at RHS Coding Club
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#e6edf5]/75">
              Members build projects at lunch in Mr. Derrick&apos;s classroom and over the
              H2O hackathon weekend. Every approved project earns each teammate points.
            </p>
            <div className="mt-5">
              {isMember ? (
                <RaisedButton asChild variant="primary">
                  <Link to="/projects/new">Submit your own</Link>
                </RaisedButton>
              ) : user ? (
                <RaisedButton asChild variant="primary">
                  <Link to="/join">Apply to join</Link>
                </RaisedButton>
              ) : (
                <SplitButton to="/signup">Join the club</SplitButton>
              )}
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  )
}

function Detail({
  icon: Icon,
  term,
  value,
}: {
  icon: typeof MapPin
  term: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="text-brand-sky mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <dt className="text-muted-foreground">{term}</dt>
        <dd className="mt-0.5 font-medium">{value}</dd>
      </div>
    </div>
  )
}

function StatusBanner({
  status,
  reason,
  canEdit,
  id,
}: {
  status: 'pending' | 'rejected'
  reason: string | null
  canEdit: boolean
  id: string
}) {
  const rejected = status === 'rejected'
  return (
    <div className="mx-auto mt-4 max-w-6xl px-(--gutter)">
      <div
        role="status"
        className={
          rejected
            ? 'flex flex-wrap items-start gap-3 rounded-3xl bg-amber-500/12 px-5 py-4 text-amber-950 ring-1 ring-amber-500/30 dark:text-amber-100'
            : 'bg-brand-sky/12 ring-brand-sky/30 flex flex-wrap items-start gap-3 rounded-3xl px-5 py-4 ring-1'
        }
      >
        {rejected ? (
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        ) : (
          <Clock3 className="text-brand-sky mt-0.5 size-5 shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {rejected
              ? 'An officer asked for changes before this goes on the showcase.'
              : 'Waiting for an officer to review. Only your team and officers can see this page.'}
          </p>
          {rejected && reason && <p className="mt-1 text-sm opacity-85">{reason}</p>}
        </div>
        {canEdit && (
          <RaisedButton asChild size="sm" variant="outline">
            <Link to="/projects/$id/edit" params={{ id }}>
              <Pencil aria-hidden="true" />
              {rejected ? 'Make changes' : 'Edit'}
            </Link>
          </RaisedButton>
        )}
      </div>
    </div>
  )
}
