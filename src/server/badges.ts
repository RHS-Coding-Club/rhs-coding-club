import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import {
  badgeIdSchema,
  badgeSchema,
  badgeUserSchema,
  memberSearchSchema,
} from '#/lib/schemas/badges'
import { requireOfficer } from '#/server/auth'
import * as badges from '#/services/badges-admin'

// Officers manage badges. Awards go through the badge engine (src/lib/badges.ts).

export const listBadgesAdmin = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => badges.listBadgesAdmin(getDb()))

export const saveBadge = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(badgeSchema)
  .handler(({ data }) => badges.saveBadge(getDb(), data))

export const deleteBadge = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(badgeIdSchema)
  .handler(async ({ data }) => {
    await badges.deleteBadge(getDb(), data.id)
    return { ok: true as const }
  })

export const listBadgeHolders = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(badgeIdSchema)
  .handler(({ data }) => badges.badgeHolders(getDb(), data.id))

export const searchBadgeMembers = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(memberSearchSchema)
  .handler(({ data }) => badges.searchMembers(getDb(), data.query))

export const awardBadgeToMember = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(badgeUserSchema)
  .handler(({ data, context }) =>
    badges.awardBadgeTo(getDb(), { ...data, awardedBy: context.user.id }),
  )

export const revokeBadgeFromMember = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(badgeUserSchema)
  .handler(async ({ data }) => {
    await badges.revokeBadgeFrom(getDb(), data)
    return { ok: true as const }
  })
