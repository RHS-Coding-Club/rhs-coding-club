import { beforeAll, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { projectInputSchema } from '#/lib/schemas/projects'
import type { ProjectInput } from '#/lib/schemas/projects'
import { pointsFor } from '#/services/points'
import {
  createProject,
  deleteProject,
  getProjectForEdit,
  getProjectView,
  listApprovedProjects,
  listProjectQueue,
  reviewProject,
  searchTeammates,
  setProjectFeatured,
  updateProject,
} from '#/services/projects'

const db = getDb()

const officer = { id: 'o1', role: 'officer' as const }
const ada = { id: 'm1', role: 'member' as const }
const bo = { id: 'm2', role: 'member' as const }
const cy = { id: 'm3', role: 'member' as const }
const gus = { id: 'g1', role: 'guest' as const }

const input = (over: Partial<ProjectInput> = {}) =>
  projectInputSchema.parse({
    title: 'Bell schedule widget',
    description: 'Shows the current period and the minutes left, rally days included.',
    tech: ['TypeScript', 'React'],
    repoUrl: 'https://github.com/RHS-Coding-Club/bell',
    demoUrl: '',
    year: 2026,
    imageKeys: [],
    teammateIds: [],
    ...over,
  })

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'o1', name: 'Olive Officer', email: 'o1@test.local', role: 'officer' },
    { id: 'm1', name: 'Ada Lovelace', email: 'm1@test.local', role: 'member' },
    { id: 'm2', name: 'Bo Diaz', email: 'm2@test.local', role: 'member' },
    { id: 'm3', name: 'Cy Adams', email: 'm3@test.local', role: 'member' },
    { id: 'g1', name: 'Gus Adler', email: 'g1@test.local', role: 'guest' },
  ])
  await db.insert(schema.setting).values({
    key: 'points',
    value: {
      easy: 50,
      medium: 100,
      hard: 200,
      project: 150,
      attendance: 25,
      showTop: 25,
    },
  })
})

async function projectPoints(userId: string, projectId: string) {
  const rows = await db
    .select({ delta: schema.pointEntry.delta })
    .from(schema.pointEntry)
    .where(
      and(
        eq(schema.pointEntry.userId, userId),
        eq(schema.pointEntry.source, 'project'),
        eq(schema.pointEntry.sourceId, projectId),
      ),
    )
  return rows.reduce((n, r) => n + r.delta, 0)
}

describe('team projects', () => {
  it('always puts the submitter on the team and rejects guest teammates', async () => {
    await expect(createProject(db, ada, input({ teammateIds: ['g1'] }))).rejects.toThrow(
      /members/,
    )
    const { id } = await createProject(db, ada, input({ teammateIds: ['m2', 'm1'] }))
    const edit = await getProjectForEdit(db, id, ada)
    expect(edit.project.status).toBe('pending')
    expect(edit.project.team.map((m) => m.id)).toEqual(['m1', 'm2'])
    expect(edit.canChangeTeam).toBe(true)
  })

  it('settles points for every teammate on approve and reverses on reject', async () => {
    const { id } = await createProject(db, ada, input({ teammateIds: ['m2', 'm3'] }))
    await reviewProject(db, officer, { id, decision: 'approve' })
    for (const u of ['m1', 'm2', 'm3']) expect(await projectPoints(u, id)).toBe(150)

    // Approving twice grants once.
    await reviewProject(db, officer, { id, decision: 'approve' })
    expect(await projectPoints('m2', id)).toBe(150)

    await expect(
      reviewProject(db, officer, { id, decision: 'reject', reason: '' }),
    ).rejects.toThrow()
    await reviewProject(db, officer, {
      id,
      decision: 'reject',
      reason: 'Add a screenshot',
    })
    for (const u of ['m1', 'm2', 'm3']) expect(await projectPoints(u, id)).toBe(0)
    const view = await getProjectView(db, id, bo)
    expect(view?.project.status).toBe('rejected')
    expect(view?.project.rejectionReason).toBe('Add a screenshot')
  })

  it('un-approving settles to zero and unfeatures', async () => {
    const { id } = await createProject(db, bo, input({ teammateIds: ['m1'] }))
    await reviewProject(db, officer, { id, decision: 'approve' })
    await setProjectFeatured(db, id, true)
    await reviewProject(db, officer, { id, decision: 'unapprove' })
    expect(await projectPoints('m1', id)).toBe(0)
    expect(await projectPoints('m2', id)).toBe(0)
    const row = await db.query.project.findFirst({ where: eq(schema.project.id, id) })
    expect(row?.status).toBe('pending')
    expect(row?.featured).toBe(false)
  })

  it('settles zero for anyone removed from an approved team, and grants new teammates', async () => {
    const { id } = await createProject(db, ada, input({ teammateIds: ['m2'] }))
    await reviewProject(db, officer, { id, decision: 'approve' })
    expect(await projectPoints('m2', id)).toBe(150)

    // Officers can edit a live project; the status stays approved.
    const r = await updateProject(db, officer, id, input({ teammateIds: ['m3'] }))
    expect(r.status).toBe('approved')
    expect(await projectPoints('m2', id)).toBe(0)
    expect(await projectPoints('m3', id)).toBe(150)
    expect(await projectPoints('m1', id)).toBe(150)
  })

  it('locks approved projects for members and resets edits to pending', async () => {
    const { id } = await createProject(db, ada, input({ teammateIds: ['m2'] }))
    await reviewProject(db, officer, { id, decision: 'reject', reason: 'Needs a demo' })

    // A teammate (not the submitter) can edit, but can't change the team.
    const edited = await updateProject(
      db,
      bo,
      id,
      input({ title: 'Bell widget v2', teammateIds: [] }),
    )
    expect(edited.status).toBe('pending')
    const after = await getProjectForEdit(db, id, bo)
    expect(after.project.title).toBe('Bell widget v2')
    expect(after.project.rejectionReason).toBeNull()
    expect(after.project.team.map((m) => m.id)).toEqual(['m1', 'm2'])
    expect(after.canChangeTeam).toBe(false)

    await reviewProject(db, officer, { id, decision: 'approve' })
    await expect(updateProject(db, ada, id, input())).rejects.toThrow(/officer/)
    await expect(getProjectForEdit(db, id, ada)).rejects.toThrow(/officer/)
    await expect(updateProject(db, cy, id, input())).rejects.toThrow()
  })

  it('hides pending projects from the public and other members', async () => {
    const { id } = await createProject(db, ada, input({ title: 'Secret thing' }))
    expect(await getProjectView(db, id, null)).toBeNull()
    expect(await getProjectView(db, id, cy)).toBeNull()
    expect(await getProjectView(db, id, gus)).toBeNull()
    expect((await getProjectView(db, id, ada))?.canEdit).toBe(true)
    expect((await getProjectView(db, id, officer))?.canEdit).toBe(true)
    const listed = await listApprovedProjects(db)
    expect(listed.some((p) => p.id === id)).toBe(false)
    const queue = await listProjectQueue(db)
    expect(queue[0].status).toBe('pending')
  })

  it('lets the submitter withdraw a pending project but not a live one', async () => {
    const { id } = await createProject(db, ada, input({ teammateIds: ['m2'] }))
    await expect(deleteProject(db, bo, id)).rejects.toThrow()
    await deleteProject(db, ada, id)
    expect(await db.query.project.findFirst({ where: eq(schema.project.id, id) })).toBe(
      undefined,
    )

    const live = await createProject(db, ada, input({ teammateIds: ['m2'] }))
    await reviewProject(db, officer, { id: live.id, decision: 'approve' })
    await expect(deleteProject(db, ada, live.id)).rejects.toThrow()
    const before = await pointsFor(db, 'm2')
    await deleteProject(db, officer, live.id)
    expect(await pointsFor(db, 'm2')).toBe(before - 150)
  })

  it('cannot feature a project that is not approved', async () => {
    const { id } = await createProject(db, ada, input())
    await expect(setProjectFeatured(db, id, true)).rejects.toThrow(/Approve/)
  })
})

describe('searchTeammates', () => {
  it('matches members by name and never returns guests', async () => {
    const rows = await searchTeammates(db, 'ad')
    const ids = rows.map((r) => r.id)
    expect(ids).toContain('m1')
    expect(ids).toContain('m3')
    expect(ids).not.toContain('g1')
    expect(await searchTeammates(db, 'gus')).toEqual([])
  })

  it('excludes ids and treats wildcards literally', async () => {
    expect((await searchTeammates(db, 'ad', ['m1'])).map((r) => r.id)).not.toContain('m1')
    expect(await searchTeammates(db, '%')).toEqual([])
    expect(await searchTeammates(db, '   ')).toEqual([])
  })
})
