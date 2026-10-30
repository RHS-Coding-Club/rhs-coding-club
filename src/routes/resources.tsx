import { lazy, useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Bookmark, LibraryBig, Search, X } from 'lucide-react'
import { z } from 'zod'
import GradientText from '#/components/bits/GradientText'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { LevelFolders } from '#/components/resources/level-folders'
import { ResourceCard } from '#/components/resources/resource-card'
import { SuggestResourceDialog } from '#/components/resources/suggest-dialog'
import { useIsDark } from '#/hooks/use-is-dark'
import { hasRole } from '#/lib/roles'
import { LEVELS, matchesQuery } from '#/lib/schemas/resources'
import type { Level } from '#/lib/schemas/resources'
import { serverErrorMessage } from '#/lib/schemas/community'
import { cn } from '#/lib/utils'
import { listResources, toggleResourceBookmark } from '#/server/resources'

const ResourcesHeroBackground = lazy(() =>
  import('#/components/resources/resources-hero-bg').then((m) => ({
    default: m.ResourcesHeroBackground,
  })),
)

const searchSchema = z.object({
  level: z.enum(LEVELS).optional().catch(undefined),
  tag: z.string().max(24).optional().catch(undefined),
})

export const Route = createFileRoute('/resources')({
  validateSearch: searchSchema,
  loader: () => listResources(),
  head: () => ({
    meta: [
      { title: 'Resources · RHS Coding Club' },
      {
        name: 'description',
        content:
          'Courses, docs, and practice sites picked by RHS Coding Club officers, sorted from beginner to advanced.',
      },
      { property: 'og:title', content: 'Resources · RHS Coding Club' },
      {
        property: 'og:description',
        content:
          'The links the club actually uses to learn, from first program to contest prep.',
      },
    ],
  }),
  component: ResourcesPage,
})

const GRADIENT_DARK = ['#9ccbf2', '#5fb2ee', '#e6edf5', '#5fb2ee']
const GRADIENT_LIGHT = ['#1f4f8a', '#2a7fc4', '#5fb2ee', '#1f4f8a']

function ResourcesPage() {
  const { resources: loaded } = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const dark = useIsDark(theme === 'dark')
  const toggle = useServerFn(toggleResourceBookmark)

  const [query, setQuery] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  // Optimistic bookmark state on top of the loader data.
  const [savedOverride, setSavedOverride] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const resources = useMemo(
    () => loaded.map((r) => ({ ...r, saved: savedOverride[r.id] ?? r.saved })),
    [loaded, savedOverride],
  )
  const approved = resources.filter((r) => r.approved)

  const level = search.level ?? null
  const tag = search.tag ?? null
  const setLevel = (next: Level | null) =>
    navigate({
      search: (s) => ({ ...s, level: next ?? undefined }),
      replace: true,
      resetScroll: false,
    })
  const setTag = (next: string | null) =>
    navigate({
      search: (s) => ({ ...s, tag: next ?? undefined }),
      replace: true,
      resetScroll: false,
    })

  const counts = Object.fromEntries(
    LEVELS.map((l) => [l, approved.filter((r) => r.level === l).length]),
  ) as Record<Level, number>
  const previews = Object.fromEntries(
    LEVELS.map((l) => [l, approved.filter((r) => r.level === l).slice(0, 3)]),
  ) as unknown as Record<Level, { title: string; url: string }[]>

  // Tags in the current level, most used first.
  const tags = useMemo(() => {
    const n = new Map<string, number>()
    for (const r of resources) {
      if (level && r.level !== level) continue
      for (const t of r.tags) n.set(t, (n.get(t) ?? 0) + 1)
    }
    return [...n.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 14)
  }, [resources, level])

  const visible = resources.filter(
    (r) =>
      (!level || r.level === level) &&
      (!tag || r.tags.includes(tag)) &&
      (!savedOnly || r.saved) &&
      matchesQuery(r, query),
  )
  const savedCount = resources.filter((r) => r.saved).length
  const filtered = Boolean(level || tag || savedOnly || query.trim())

  async function onToggleSave(id: string, current: boolean) {
    setBusy(id)
    setSavedOverride((o) => ({ ...o, [id]: !current }))
    try {
      const { saved } = await toggle({ data: { id } })
      setSavedOverride((o) => ({ ...o, [id]: saved }))
    } catch (err) {
      setSavedOverride((o) => ({ ...o, [id]: current }))
      toast.error(serverErrorMessage(err, 'Could not save that. Try again.'))
    } finally {
      setBusy(null)
    }
  }

  const isMember = hasRole(user?.role, 'member')

  return (
    <>
      <PageHero
        background={<ResourcesHeroBackground initialDark={theme === 'dark'} />}
        title={
          <>
            The links we{' '}
            <GradientText
              colors={dark ? GRADIENT_DARK : GRADIENT_LIGHT}
              animationSpeed={9}
              className="inline"
            >
              actually use
            </GradientText>
            .
          </>
        }
        description="Courses, docs, and practice sites that got club members unstuck, sorted from your first program to contest prep."
        actions={
          isMember ? (
            <SuggestResourceDialog />
          ) : user ? (
            <RaisedButton asChild size="lg" variant="outline">
              <Link to="/join">Apply to join to suggest links</Link>
            </RaisedButton>
          ) : (
            <RaisedButton asChild size="lg" variant="outline">
              <Link to="/login" search={{ redirect: '/resources' }}>
                Sign in to save links
              </Link>
            </RaisedButton>
          )
        }
        aside={
          <div className="flex gap-8 lg:flex-col lg:gap-5 lg:text-right">
            <Stat n={approved.length} label="links" />
            <Stat n={new Set(approved.flatMap((r) => r.tags)).size} label="topics" />
          </div>
        }
      />

      <section
        aria-labelledby="levels-heading"
        className="mx-auto max-w-6xl px-(--gutter) pt-16 sm:pt-24"
      >
        <FadeUp className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="levels-heading"
              className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              Pick your level
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-lg">
              Open a folder to see only that level. Close it to see everything.
            </p>
          </div>
          {level && (
            <RaisedButton variant="ghost" size="sm" onClick={() => setLevel(null)}>
              <X aria-hidden="true" />
              Show all levels
            </RaisedButton>
          )}
        </FadeUp>
        <FadeUp delay={0.1} className="mt-6 sm:mt-10">
          <LevelFolders
            selected={level}
            onSelect={setLevel}
            counts={counts}
            previews={previews}
            dark={dark}
          />
        </FadeUp>
      </section>

      <section
        aria-label="Resources"
        className="mx-auto max-w-6xl px-(--gutter) pt-14 pb-16 sm:pb-24"
      >
        <div className="border-border flex flex-col gap-4 border-t pt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, sites, and tags"
                aria-label="Search resources"
                className="h-11 rounded-xl pl-10"
              />
            </div>
            {user && (
              <RaisedButton
                variant={savedOnly ? 'secondary' : 'outline'}
                size="lg"
                aria-pressed={savedOnly}
                onClick={() => setSavedOnly((v) => !v)}
              >
                <Bookmark
                  aria-hidden="true"
                  className={cn(savedOnly && 'fill-current')}
                />
                Saved
                <span className="tabular font-mono text-xs opacity-70">{savedCount}</span>
              </RaisedButton>
            )}
          </div>

          {tags.length > 0 && (
            <div
              role="group"
              aria-label="Filter by tag"
              className="flex flex-wrap gap-1.5"
            >
              {tags.map(([t, n]) => {
                const on = tag === t
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTag(on ? null : t)}
                    className={cn(
                      'focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs transition-colors outline-none focus-visible:ring-3',
                      on
                        ? 'bg-brand-sky text-[#0b0f15]'
                        : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                  >
                    #{t}
                    <span className={cn('tabular', on ? 'opacity-70' : 'opacity-60')}>
                      {n}
                    </span>
                  </button>
                )
              })}
              {tag && !tags.some(([t]) => t === tag) && (
                <button
                  type="button"
                  aria-pressed
                  onClick={() => setTag(null)}
                  className="bg-brand-sky inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs text-[#0b0f15]"
                >
                  #{tag}
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          <p className="text-muted-foreground text-sm" aria-live="polite">
            {visible.length === 1 ? '1 resource' : `${visible.length} resources`}
            {filtered && ' match'}
          </p>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            className="mt-6"
            icon={<LibraryBig />}
            title={
              savedOnly && savedCount === 0 ? 'Nothing saved yet' : 'No resources match'
            }
            action={
              filtered ? (
                <RaisedButton
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setSavedOnly(false)
                    navigate({ search: {}, replace: true, resetScroll: false })
                  }}
                >
                  Clear filters
                </RaisedButton>
              ) : undefined
            }
          >
            {savedOnly && savedCount === 0
              ? 'Tap the bookmark on any resource to keep it here.'
              : 'Try another level or tag, or clear the search.'}
          </EmptyState>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((r, i) => (
              <li key={r.id}>
                <FadeUp delay={(i % 3) * 0.05} distance={16} className="h-full">
                  <ResourceCard
                    resource={r}
                    canSave={Boolean(user)}
                    busy={busy === r.id}
                    onToggleSave={() => onToggleSave(r.id, r.saved)}
                    onTag={(t) => setTag(t)}
                  />
                </FadeUp>
              </li>
            ))}
          </ul>
        )}

        <FadeUp className="bg-card ring-border/70 mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl p-8 ring-1 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
              Know a better link?
            </p>
            <p className="text-muted-foreground mt-2 max-w-lg">
              {isMember
                ? 'Suggest it. Officers check every link before it goes up.'
                : user
                  ? 'Members can suggest links for the list. Apply to join, it takes two minutes.'
                  : 'Members suggest links for the list. Sign in or join the club to add yours.'}
            </p>
          </div>
          {isMember ? (
            <SuggestResourceDialog size="lg" variant="outline" />
          ) : (
            <RaisedButton asChild variant="outline" size="lg">
              {user ? (
                <Link to="/join">Apply to join</Link>
              ) : (
                <Link to="/login" search={{ redirect: '/resources' }}>
                  Sign in
                </Link>
              )}
            </RaisedButton>
          )}
        </FadeUp>
      </section>
    </>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="tabular text-4xl font-semibold tracking-[-0.04em] text-[#101826] sm:text-5xl dark:text-white">
        {n}
      </p>
      <p className="text-sm text-[#101826]/60 dark:text-white/60">{label}</p>
    </div>
  )
}
