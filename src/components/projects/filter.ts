// Pure filtering for the public showcase. The list is small (a club's worth
// of projects), so it's loaded once and filtered in the browser, with the
// filters kept in the URL so a filtered view can be shared.

export interface FilterableProject {
  title: string
  description: string
  tech: string[]
  year: number | null
  featured: boolean
  team: { name: string }[]
}

export interface ProjectFilters {
  q?: string
  tech?: string
  year?: number
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')

/** Matches every word of the query against title, description, tech, and team names. */
export function filterProjects<T extends FilterableProject>(
  projects: T[],
  { q, tech, year }: ProjectFilters,
): T[] {
  const words = norm(q ?? '')
    .split(/\s+/)
    .filter(Boolean)
  const techKey = tech ? norm(tech) : null
  return projects.filter((p) => {
    if (year && p.year !== year) return false
    if (techKey && !p.tech.some((t) => norm(t) === techKey)) return false
    if (words.length === 0) return true
    const hay = norm(
      [p.title, p.description, ...p.tech, ...p.team.map((m) => m.name)].join(' '),
    )
    return words.every((w) => hay.includes(w))
  })
}

/** Tech tags by how many projects use them, then alphabetically. Case-insensitive. */
export function techFacets(projects: Pick<FilterableProject, 'tech'>[]) {
  const counts = new Map<string, { label: string; count: number }>()
  for (const p of projects) {
    for (const t of new Set(p.tech.map((x) => x.trim()).filter(Boolean))) {
      const key = norm(t)
      const entry = counts.get(key)
      if (entry) entry.count += 1
      else counts.set(key, { label: t, count: 1 })
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  )
}

/** Distinct years, newest first. */
export function yearFacets(projects: Pick<FilterableProject, 'year'>[]) {
  return [...new Set(projects.map((p) => p.year).filter((y): y is number => !!y))].sort(
    (a, b) => b - a,
  )
}

/** "Max", "Max and Priya", "Max, Priya, and Diego", "Max, Priya, and 3 others". */
export function teamNames(team: { name: string }[]) {
  const first = team.map((m) => m.name.split(/\s+/)[0] || m.name)
  if (first.length <= 1) return first[0] ?? ''
  if (first.length === 2) return `${first[0]} and ${first[1]}`
  if (first.length === 3) return `${first[0]}, ${first[1]}, and ${first[2]}`
  return `${first[0]}, ${first[1]}, and ${first.length - 2} others`
}
