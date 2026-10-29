import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getDb } from '#/db'
import { getAuth } from '#/lib/auth'
import {
  approveResourceSchema,
  resourceIdSchema,
  saveResourceSchema,
  suggestResourceSchema,
} from '#/lib/schemas/resources'
import { requireMember, requireOfficer, requireUser } from '#/server/auth'
import * as resources from '#/services/resources'

/** The signed-in viewer's id for public reads (null when signed out). */
async function viewerId() {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() })
  return session?.user.id ?? null
}

// ---------- Public ----------

/** /resources: approved links, plus the viewer's own pending suggestions and saves. */
export const listResources = createServerFn({ method: 'GET' }).handler(async () => {
  const userId = await viewerId()
  return { resources: await resources.listResourcesFor(getDb(), userId) }
})

export const toggleResourceBookmark = createServerFn({ method: 'POST' })
  .middleware([requireUser])
  .validator(resourceIdSchema)
  .handler(({ data, context }) =>
    resources.toggleBookmark(getDb(), context.user.id, data.id),
  )

export const suggestResource = createServerFn({ method: 'POST' })
  .middleware([requireMember])
  .validator(suggestResourceSchema)
  .handler(({ data, context }) =>
    resources.suggestResource(getDb(), context.user.id, data),
  )

// ---------- Officers ----------

export const listResourcesAdmin = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => resources.listResourcesAdmin(getDb()))

export const saveResource = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(saveResourceSchema)
  .handler(({ data, context }) => resources.saveResource(getDb(), context.user.id, data))

export const approveResource = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(approveResourceSchema)
  .handler(({ data }) => resources.setResourceApproved(getDb(), data.id, data.approved))

export const deleteResource = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(resourceIdSchema)
  .handler(async ({ data }) => {
    await resources.deleteResource(getDb(), data.id)
    return { ok: true as const }
  })
