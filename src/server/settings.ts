import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import { saveSettingSchema } from '#/lib/schemas/settings'
import { requireAdmin, requireOfficer } from '#/server/auth'
import { saveSettingAs, settingsOverview } from '#/services/settings-admin'

/** Officers can read every settings group (the page is read-only for them). */
export const getSettingsAdmin = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(async ({ context }) => ({
    ...(await settingsOverview(getDb())),
    canEdit: context.user.role === 'admin',
  }))

/** Admins only: the middleware rejects officers, and the service checks again. */
export const saveSettings = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(saveSettingSchema)
  .handler(({ data, context }) =>
    saveSettingAs(getDb(), context.user, data.key, data.value as never),
  )
