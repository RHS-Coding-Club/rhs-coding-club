import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getDb } from '#/db'
import { getAuth } from '#/lib/auth'
import { isRole } from '#/lib/roles'
import {
  challengeFormSchema,
  challengeIdSchema,
  publishChallengeSchema,
  reviewSubmissionSchema,
  submissionFilterSchema,
  submitSolutionSchema,
} from '#/lib/schemas/challenges'
import { requireMember, requireOfficer } from '#/server/auth'
import * as challenges from '#/services/challenges'
import { getSetting } from '#/services/settings'

/** The signed-in viewer for public reads (null when signed out). */
async function viewer() {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() })
  if (!session) return null
  const role = (session.user as { role?: unknown }).role
  return { id: session.user.id, role: isRole(role) ? role : ('guest' as const) }
}

// ---------- Public ----------

/** /challenges: live challenges, solve counts, the viewer's statuses, point values. */
export const listChallenges = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  const now = new Date()
  const me = await viewer()
  const [list, points] = await Promise.all([
    challenges.listLiveChallenges(db, now, me?.id),
    getSetting(db, 'points'),
  ])
  return {
    ...list,
    points: { easy: points.easy, medium: points.medium, hard: points.hard },
  }
})

/** /challenges/$id: null (404) for drafts and scheduled ones unless an officer asks. */
export const getChallenge = createServerFn({ method: 'GET' })
  .validator(challengeIdSchema)
  .handler(async ({ data }) => {
    const me = await viewer()
    return challenges.getChallengeForViewer(getDb(), data.id, me, new Date())
  })

/** Members (not guests) submit or resubmit a solution link. */
export const submitSolution = createServerFn({ method: 'POST' })
  .middleware([requireMember])
  .validator(submitSolutionSchema)
  .handler(({ data, context }) =>
    challenges.submitSolution(getDb(), context.user.id, data),
  )

// ---------- Officers: challenges ----------

export const listAdminChallenges = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .handler(() => challenges.listChallengesForAdmin(getDb()))

export const getAdminChallenge = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(challengeIdSchema)
  .handler(async ({ data }) => {
    const db = getDb()
    const [row, list] = await Promise.all([
      challenges.getChallengeForAdmin(db, data.id),
      challenges.listChallengesForAdmin(db),
    ])
    return { challenge: row, points: list.points, nextWeekNo: list.nextWeekNo }
  })

/** Create or edit. Going live from here announces right away (once). */
export const saveChallenge = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(challengeFormSchema)
  .handler(async ({ data, context }) => {
    const db = getDb()
    const result = await challenges.saveChallenge(db, data, context.user.id)
    const announcement = result.wentLive
      ? await challenges.announceChallenges(db, new Date())
      : null
    return { ...result, announced: (announcement?.announced ?? 0) > 0 }
  })

export const publishChallenge = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(publishChallengeSchema)
  .handler(async ({ data }) => {
    const db = getDb()
    const result = await challenges.setChallengePublished(db, data.id, data.mode)
    const announcement = result.wentLive
      ? await challenges.announceChallenges(db, new Date())
      : null
    return { ...result, announced: (announcement?.announced ?? 0) > 0 }
  })

export const deleteChallenge = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(challengeIdSchema)
  .handler(({ data, context }) =>
    challenges.deleteChallenge(getDb(), data.id, context.user.id),
  )

// ---------- Officers: submissions ----------

export const listSubmissions = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(submissionFilterSchema)
  .handler(async ({ data }) => {
    const db = getDb()
    const [rows, list] = await Promise.all([
      challenges.listSubmissionsForReview(db, data),
      challenges.listChallengesForAdmin(db),
    ])
    return {
      submissions: rows,
      challenges: list.challenges.map((ch) => ({
        id: ch.id,
        title: ch.title,
        weekNo: ch.weekNo,
        pending: ch.pending,
      })),
    }
  })

export const getSubmission = createServerFn({ method: 'GET' })
  .middleware([requireOfficer])
  .validator(challengeIdSchema)
  .handler(({ data }) => challenges.getSubmissionDetail(getDb(), data.id))

/** Pass, fail, or reopen. Returns badges the member just earned. */
export const reviewSubmission = createServerFn({ method: 'POST' })
  .middleware([requireOfficer])
  .validator(reviewSubmissionSchema)
  .handler(({ data, context }) =>
    challenges.reviewSubmission(getDb(), { ...data, reviewerId: context.user.id }),
  )
