import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import { requireOfficer } from '#/server/auth'
import { getAdminOverview } from '#/services/home'

export const getOverview = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => getAdminOverview(getDb()))
