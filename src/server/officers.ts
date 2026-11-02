import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import { moveOfficerSchema, officerIdSchema, officerSchema } from '#/lib/schemas/officers'
import { requireAdmin } from '#/server/auth'
import {
  deleteOfficer,
  listOfficers,
  moveOfficer,
  saveOfficer,
} from '#/services/officers'

// Admin > Officers: admin only, reads included.

export const listAllOfficers = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(() => listOfficers(getDb()))

export const upsertOfficer = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(officerSchema)
  .handler(({ data }) => saveOfficer(getDb(), data))

export const removeOfficer = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(officerIdSchema)
  .handler(async ({ data }) => {
    await deleteOfficer(getDb(), data.id)
    return { ok: true as const }
  })

export const reorderOfficer = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(moveOfficerSchema)
  .handler(({ data }) => moveOfficer(getDb(), data.id, data.direction))
