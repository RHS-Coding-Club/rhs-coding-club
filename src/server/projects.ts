import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { getDb } from '#/db'
import {
  featureProjectSchema,
  projectIdSchema,
  projectInputSchema,
  reviewProjectSchema,
  teammateSearchSchema,
  updateProjectSchema,
} from '#/lib/schemas/projects'
import { getSessionUser, requireMember, requireOfficer } from '#/server/auth'
import { deleteFile } from '#/services/files'
import {
  createProject as createProjectRow,
  deleteProject as deleteProjectRow,
  getProjectForEdit as loadProjectForEdit,
  getProjectView,
  listApprovedProjects,
  listProjectQueue,
  reviewProject as reviewProjectRow,
  searchTeammates as searchTeammateRows,
  setProjectFeatured,
  updateProject as updateProjectRow,
} from '#/services/projects'

/** Best-effort cleanup of screenshots nobody references any more. */
async function deleteImages(keys: string[]) {
  await Promise.all(keys.map((k) => deleteFile(env.FILES, k).catch(() => undefined)))
}

/** Public: the approved showcase. */
export const listProjects = createServerFn({ method: 'GET' }).handler(() =>
  listApprovedProjects(getDb()),
)

/** Public for approved projects; team and officers for the rest. Null = 404. */
export const getProject = createServerFn({ method: 'GET' })
  .validator(projectIdSchema)
  .handler(async ({ data }) => {
    const viewer = await getSessionUser()
    return getProjectView(getDb(), data.id, viewer)
  })

export const getProjectForEdit = createServerFn({ method: 'GET' })
  .middleware([requireMember])
  .validator(projectIdSchema)
  .handler(({ data, context }) => loadProjectForEdit(getDb(), data.id, context.user))

export const createProject = createServerFn({ method: 'POST' })
  .middleware([requireMember])
  .validator(projectInputSchema)
  .handler(({ data, context }) => createProjectRow(getDb(), context.user, data))

export const updateProject = createServerFn({ method: 'POST' })
  .middleware([requireMember])
  .validator(updateProjectSchema)
  .handler(async ({ data, context }) => {
    const { id, ...input } = data
    const result = await updateProjectRow(getDb(), context.user, id, input)
    await deleteImages(result.unusedKeys)
    return { id: result.id, status: result.status }
  })

export const deleteProject = createServerFn({ method: 'POST' })
  .middleware([requireMember])
  .validator(projectIdSchema)
  .handler(async ({ data, context }) => {
    const { imageKeys } = await deleteProjectRow(getDb(), context.user, data.id)
    await deleteImages(imageKeys)
    return { ok: true as const }
  })

/** Members only, and only members come back: guests can't be credited. */
export const searchTeammates = createServerFn({ method: 'GET' })
  .middleware([requireMember])
  .validator(teammateSearchSchema)
  .handler(({ data, context }) =>
    searchTeammateRows(getDb(), data.q, [...data.exclude, context.user.id]),
  )

// ---------- Officers ----------

export const listProjectReviewQueue = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => listProjectQueue(getDb()))

export const reviewProject = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(reviewProjectSchema)
  .handler(async ({ data, context }) => {
    const { status, points } = await reviewProjectRow(getDb(), context.user, data)
    return { status, points }
  })

export const featureProject = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(featureProjectSchema)
  .handler(({ data }) => setProjectFeatured(getDb(), data.id, data.featured))
