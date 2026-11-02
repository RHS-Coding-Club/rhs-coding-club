import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import {
  adjustPointsSchema,
  changeRoleSchema,
  listUsersSchema,
  userIdSchema,
} from '#/lib/schemas/users'
import { requireAdmin, requireOfficer } from '#/server/auth'
import {
  adjustMemberPoints,
  changeRole,
  getUserDetail,
  listUsers,
} from '#/services/members'

// Admin > Users. Officers may look (the nav only shows it to admins); every
// write is admin-only.

export const listAllUsers = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(listUsersSchema)
  .handler(({ data }) => listUsers(getDb(), data))

export const getUser = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(userIdSchema)
  .handler(({ data }) => getUserDetail(getDb(), data.userId))

export const setUserRole = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(changeRoleSchema)
  .handler(({ data, context }) =>
    changeRole(getDb(), {
      actorId: context.user.id,
      userId: data.userId,
      role: data.role,
    }),
  )

export const adjustUserPoints = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(adjustPointsSchema)
  .handler(({ data, context }) =>
    adjustMemberPoints(getDb(), { ...data, createdBy: context.user.id }),
  )
