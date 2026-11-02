import { describe, expect, it } from 'vitest'
import {
  canChangeTeam,
  canDeleteProject,
  canEditProject,
  canViewProject,
  dedupeTags,
  projectInputSchema,
  reviewProjectSchema,
} from '#/lib/schemas/projects'
import { coverHeight, projectCoverSvg } from '#/components/projects/cover'
import {
  filterProjects,
  teamNames,
  techFacets,
  yearFacets,
} from '#/components/projects/filter'

const base = {
  title: 'Seat finder',
  description: 'Shows which library tables are free at lunch.',
  tech: ['Python'],
  repoUrl: '',
  demoUrl: '',
  year: 2026,
  imageKeys: [],
  teammateIds: [],
}

describe('projectInputSchema', () => {
  it('turns empty links into null and dedupes tags and teammates', () => {
    const v = projectInputSchema.parse({
      ...base,
      tech: [' React ', 'react', 'Node  js'],
      teammateIds: ['a', 'a', 'b'],
    })
    expect(v.repoUrl).toBeNull()
    expect(v.tech).toEqual(['React', 'Node js'])
    expect(v.teammateIds).toEqual(['a', 'b'])
  })

  it('requires https links and caps sizes', () => {
    expect(
      projectInputSchema.safeParse({ ...base, repoUrl: 'http://x.com' }).success,
    ).toBe(false)
    expect(
      projectInputSchema.safeParse({ ...base, demoUrl: 'javascript:alert(1)' }).success,
    ).toBe(false)
    expect(
      projectInputSchema.safeParse({ ...base, demoUrl: 'https://rhs.dev' }).success,
    ).toBe(true)
    expect(
      projectInputSchema.safeParse({ ...base, description: 'x'.repeat(2001) }).success,
    ).toBe(false)
    expect(
      projectInputSchema.safeParse({
        ...base,
        tech: Array.from({ length: 9 }, (_, i) => `t${i}`),
      }).success,
    ).toBe(false)
    expect(
      projectInputSchema.safeParse({
        ...base,
        teammateIds: ['1', '2', '3', '4', '5', '6', '7'],
      }).success,
    ).toBe(false)
    expect(
      projectInputSchema.safeParse({ ...base, imageKeys: ['avatar/../../etc'] }).success,
    ).toBe(false)
  })

  it('needs a reason to reject', () => {
    expect(reviewProjectSchema.safeParse({ id: 'p', decision: 'reject' }).success).toBe(
      false,
    )
    expect(
      reviewProjectSchema.safeParse({ id: 'p', decision: 'reject', reason: 'Add a link' })
        .success,
    ).toBe(true)
    expect(reviewProjectSchema.safeParse({ id: 'p', decision: 'approve' }).success).toBe(
      true,
    )
  })

  it('dedupes tags case-insensitively', () => {
    expect(dedupeTags(['Go', 'go', ' ', 'GO '])).toEqual(['Go'])
  })
})

describe('project access rules', () => {
  const pending = { status: 'pending' as const, authorId: 'a', memberIds: ['a', 'b'] }
  const approved = { ...pending, status: 'approved' as const }
  const officer = { id: 'o', role: 'officer' as const }
  const author = { id: 'a', role: 'member' as const }
  const mate = { id: 'b', role: 'member' as const }
  const stranger = { id: 'c', role: 'member' as const }

  it('shows pending projects to the team and officers only', () => {
    expect(canViewProject(pending, null)).toBe(false)
    expect(canViewProject(pending, stranger)).toBe(false)
    expect(canViewProject(pending, mate)).toBe(true)
    expect(canViewProject(pending, officer)).toBe(true)
    expect(canViewProject(approved, null)).toBe(true)
  })

  it('locks approved projects for members', () => {
    expect(canEditProject(pending, mate)).toBe(true)
    expect(canEditProject(approved, author)).toBe(false)
    expect(canEditProject(approved, officer)).toBe(true)
    expect(canEditProject(pending, { id: 'b', role: 'guest' })).toBe(false)
  })

  it('lets only the submitter or an officer change the team or delete', () => {
    expect(canChangeTeam(pending, author)).toBe(true)
    expect(canChangeTeam(pending, mate)).toBe(false)
    expect(canChangeTeam(approved, officer)).toBe(true)
    expect(canDeleteProject(pending, author)).toBe(true)
    expect(canDeleteProject(pending, mate)).toBe(false)
    expect(canDeleteProject(approved, author)).toBe(false)
    expect(canDeleteProject(approved, officer)).toBe(true)
  })
})

describe('showcase filters', () => {
  const projects = [
    {
      title: 'H2O tracker',
      description: 'Water use',
      tech: ['React', 'D1'],
      year: 2026,
      featured: true,
      team: [{ name: 'Priya Natarajan' }],
    },
    {
      title: 'Bell widget',
      description: 'Periods',
      tech: ['JavaScript'],
      year: 2025,
      featured: false,
      team: [{ name: 'Olive Officer' }],
    },
    {
      title: 'Planner',
      description: 'Lessons for RAP',
      tech: ['react'],
      year: 2026,
      featured: false,
      team: [{ name: 'Max Member' }],
    },
  ]

  it('filters by tech case-insensitively, year, and every query word', () => {
    expect(filterProjects(projects, { tech: 'REACT' }).map((p) => p.title)).toEqual([
      'H2O tracker',
      'Planner',
    ])
    expect(filterProjects(projects, { year: 2025 }).map((p) => p.title)).toEqual([
      'Bell widget',
    ])
    expect(filterProjects(projects, { q: 'priya water' }).map((p) => p.title)).toEqual([
      'H2O tracker',
    ])
    expect(filterProjects(projects, { q: 'priya bell' })).toEqual([])
    expect(filterProjects(projects, {})).toHaveLength(3)
  })

  it('builds facets', () => {
    expect(techFacets(projects)).toEqual([
      { label: 'React', count: 2 },
      { label: 'D1', count: 1 },
      { label: 'JavaScript', count: 1 },
    ])
    expect(yearFacets(projects)).toEqual([2026, 2025])
  })

  it('names teams in plain English', () => {
    expect(teamNames([{ name: 'Max Member' }])).toBe('Max')
    expect(teamNames([{ name: 'Max M' }, { name: 'Priya N' }])).toBe('Max and Priya')
    expect(teamNames([{ name: 'A' }, { name: 'B' }, { name: 'C' }])).toBe('A, B, and C')
    expect(teamNames([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }])).toBe(
      'A, B, and 2 others',
    )
  })
})

describe('generated covers', () => {
  const input = {
    id: 'pr_1',
    title: 'X',
    tech: ['<script>', 'Rust & Go'],
    initials: ['AB'],
    dark: true,
  }

  it('is deterministic and escapes text', () => {
    const svg = projectCoverSvg(input)
    expect(projectCoverSvg(input)).toBe(svg)
    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&lt;script&gt;')
    expect(svg).toContain('Rust &amp; Go')
    expect(svg).toContain(`height="${coverHeight('pr_1')}"`)
  })

  it('honours a custom size', () => {
    expect(projectCoverSvg({ ...input, width: 1200, height: 480 })).toContain(
      'viewBox="0 0 1200 480"',
    )
  })
})
