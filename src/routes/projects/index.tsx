import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, FolderGit2, Plus, Search, X } from 'lucide-react'
import { z } from 'zod'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { EmptyState } from '#/components/empty-state'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { BeamsBackground } from '#/components/projects/beams-bg'
import { ProjectGrid } from '#/components/projects/project-grid'
import { FeaturedProject } from '#/components/projects/featured-project'
import { filterProjects, techFacets, yearFacets } from '#/components/projects/filter'
import { hasRole } from '#/lib/roles'
import { listProjects } from '#/server/projects'

const ALL = '__all'

const searchSchema = z.object({
  q: z.string().max(80).optional().catch(undefined),
  tech: z.string().max(40).optional().catch(undefined),
  year: z.number().int().min(2000).max(2100).optional().catch(undefined),
})

export const Route = createFileRoute('/projects/')({
  validateSearch: searchSchema,
  loader: () => listProjects(),
  head: () => ({
    meta: [
      { title: 'Projects · RHS Coding Club' },
      {
        name: 'description',
        content:
          'Apps, bots, and tools built by RHS Coding Club members, from H2O hackathon weekends to projects teachers use every day.',
      },
      { property: 'og:title', content: 'Projects · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Apps, bots, and tools built by RHS Coding Club members.',
      },
    ],
  }),
  component: ProjectsPage,
})

function ProjectsPage() {
  const projects = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { user, theme } = Route.useRouteContext()
  const initialDark = theme === 'dark'

  // The search box updates the URL a beat after typing stops.
  const [query, setQuery] = useState(search.q ?? '')
  useEffect(() => setQuery(search.q ?? ''), [search.q])
  useEffect(() => {
    const next = query.trim() || undefined
    if (next === search.q) return
    const t = setTimeout(() => {
      void navigate({ search: (s) => ({ ...s, q: next }), replace: true })
    }, 200)
    return () => clearTimeout(t)
  }, [query, search.q, navigate])

  const techs = useMemo(() => techFacets(projects), [projects])
  const years = useMemo(() => yearFacets(projects), [projects])
  const shown = useMemo(() => filterProjects(projects, search), [projects, search])
  const filtering = Boolean(search.q || search.tech || search.year)
  const featured = projects.filter((p) => p.featured).slice(0, 2)
  const builders = new Set(projects.flatMap((p) => p.team.map((m) => m.id))).size

  const submit = !user ? (
    <RaisedButton asChild size="lg">
      <Link to="/login" search={{ redirect: '/projects/new' }}>
        Sign in to submit
      </Link>
    </RaisedButton>
  ) : hasRole(user.role, 'member') ? (
    <RaisedButton asChild size="lg">
      <Link to="/projects/new">
        <Plus aria-hidden="true" />
        Submit a project
      </Link>
    </RaisedButton>
  ) : (
    <RaisedButton asChild size="lg">
      <Link to="/join">Apply to join</Link>
    </RaisedButton>
  )

  return (
    <>
      <PageHero
        background={<BeamsBackground initialDark={initialDark} />}
        title="Projects"
        description="Apps, bots, and tools our members built, from 24-hour H2O hackathon builds to tools teachers at RHS use every week."
        actions={
          <>
            {submit}
            <RaisedButton asChild size="lg" variant="outline">
              <a href="#showcase">Browse the showcase</a>
            </RaisedButton>
          </>
        }
        aside={
          <dl className="flex gap-10 text-[#101826] dark:text-white">
            <Stat value={projects.length} label="Approved projects" />
            <Stat value={builders} label="Members credited" />
          </dl>
        }
      />

      {!filtering && featured.length > 0 && (
        <section
          aria-labelledby="featured-heading"
          className="mx-auto max-w-6xl px-(--gutter) pt-16 sm:pt-24"
        >
          <FadeUp>
            <h2
              id="featured-heading"
              className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              Featured builds
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
              Picked by the officers: projects people outside the club actually use.
            </p>
          </FadeUp>
          <div className="mt-10 grid gap-5">
            {featured.map((p, i) => (
              <FadeUp key={p.id} delay={i * 0.08} className="min-w-0">
                <FeaturedProject
                  project={p}
                  initialDark={initialDark}
                  flip={i % 2 === 1}
                />
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      <section
        id="showcase"
        aria-labelledby="showcase-heading"
        className="mx-auto max-w-6xl scroll-mt-28 px-(--gutter) py-16 sm:py-24"
      >
        <FadeUp className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <h2
            id="showcase-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            Every project
          </h2>
          <p className="text-muted-foreground font-mono text-sm" aria-live="polite">
            {shown.length} of {projects.length}
          </p>
        </FadeUp>

        <FadeUp delay={0.05}>
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="bg-card ring-border/70 mt-8 flex flex-col gap-3 rounded-3xl p-3 ring-1 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Label htmlFor="project-search" className="sr-only">
                Search projects
              </Label>
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="project-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, stack, or teammate"
                className="h-11 rounded-2xl border-transparent bg-transparent pl-10 shadow-none dark:bg-transparent"
              />
            </div>
            <div className="flex gap-3">
              <FilterSelect
                label="Tech"
                value={search.tech}
                options={techs.map((t) => ({
                  value: t.label,
                  label: `${t.label} (${t.count})`,
                }))}
                onChange={(tech) =>
                  void navigate({ search: (s) => ({ ...s, tech }), replace: true })
                }
              />
              <FilterSelect
                label="Year"
                value={search.year ? String(search.year) : undefined}
                options={years.map((y) => ({ value: String(y), label: String(y) }))}
                onChange={(year) =>
                  void navigate({
                    search: (s) => ({ ...s, year: year ? Number(year) : undefined }),
                    replace: true,
                  })
                }
              />
            </div>
            {filtering && (
              <RaisedButton
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  setQuery('')
                  void navigate({ search: {}, replace: true })
                }}
              >
                <X aria-hidden="true" />
                Clear
              </RaisedButton>
            )}
          </form>
        </FadeUp>

        <div className="mt-8">
          {projects.length === 0 ? (
            <EmptyState icon={<FolderGit2 />} title="No projects on the showcase yet">
              Members submit projects for review. Once an officer approves one, it shows
              up here.
            </EmptyState>
          ) : shown.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title="Nothing matches those filters"
              action={
                <RaisedButton
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    void navigate({ search: {}, replace: true })
                  }}
                >
                  Clear filters
                </RaisedButton>
              }
            >
              Try a different stack or year, or search for a teammate by name.
            </EmptyState>
          ) : (
            <ProjectGrid projects={shown} initialDark={initialDark} />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-(--gutter) pb-8">
        <FadeUp className="border-border flex flex-wrap items-center justify-between gap-8 border-t pt-14">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Built something?
            </p>
            <p className="text-muted-foreground mt-2 max-w-xl text-lg">
              Add your team, a few screenshots, and a link. Approved projects earn every
              teammate points.
            </p>
          </div>
          {user && hasRole(user.role, 'member') ? (
            <RaisedButton asChild size="lg" variant="secondary">
              <Link to="/projects/new">
                Submit a project
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </RaisedButton>
          ) : (
            submit
          )}
        </FadeUp>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-1 text-sm text-[#101826]/60 dark:text-white/60">{label}</dt>
      <dd className="font-mono text-4xl font-medium tracking-tight sm:text-5xl">
        {value}
      </dd>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | undefined
  options: { value: string; label: string }[]
  onChange: (value: string | undefined) => void
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(v) => onChange(v === ALL ? undefined : v)}
    >
      <SelectTrigger
        aria-label={`Filter by ${label.toLowerCase()}`}
        className="bg-muted/50 dark:bg-muted/40 h-11! min-w-32 flex-1 rounded-2xl border-transparent sm:flex-none"
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        <SelectItem value={ALL}>Any {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
