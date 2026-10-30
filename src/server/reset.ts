import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { getDb } from '#/db'
import { runResetSchema } from '#/lib/schemas/reset'
import { requireAdmin } from '#/server/auth'
import { exportBackup, resetCounts, runReset } from '#/services/reset'

// The admin reset tool. Admins only, every call: officers can't see the page,
// count rows, download the backup, or run anything.

export const getResetCounts = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(({ context }) => resetCounts(getDb(), context.user.id))

export const downloadBackup = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(() => exportBackup(getDb()))

export const resetData = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(runResetSchema)
  .handler(({ data, context }) =>
    runReset(getDb(), env.FILES, { actions: data.actions, actorId: context.user.id }),
  )
