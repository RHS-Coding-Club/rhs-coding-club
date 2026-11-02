import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import {
  applicationFilterSchema,
  applicationSchema,
  reviewApplicationSchema,
} from '#/lib/schemas/membership'
import { getSessionUser, requireOfficer, requireUser } from '#/server/auth'
import {
  getApplicationDetail,
  getJoinState,
  listApplications,
  reviewApplication,
  submitApplication,
} from '#/services/membership'
import { z } from 'zod'

/** What /join should show the viewer (signed out, apply, pending, or member). */
export const getJoin = createServerFn({ method: 'GET' }).handler(async () => {
  const viewer = await getSessionUser()
  return getJoinState(getDb(), viewer)
})

export const applyForMembership = createServerFn({ method: 'POST' })
  .middleware([requireUser])
  .validator(applicationSchema)
  .handler(({ data, context }) => submitApplication(getDb(), context.user, data))

export const listMembershipApplications = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(applicationFilterSchema)
  .handler(({ data }) => listApplications(getDb(), { status: data.status }))

export const getMembershipApplication = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => getApplicationDetail(getDb(), data.id))

export const reviewMembershipApplication = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(reviewApplicationSchema)
  .handler(({ data, context }) =>
    reviewApplication(getDb(), {
      id: data.id,
      reviewerId: context.user.id,
      decision: data.decision,
      note: data.note,
    }),
  )
