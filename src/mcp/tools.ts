import { env } from 'cloudflare:workers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '#/db'
import type { Db } from '#/db'
import { docToMarkdown, markdownToDoc } from '#/lib/markdown'
import { parseRichText, richTextField } from '#/lib/rich-text'
import { badgeIdSchema, badgeSchema, badgeUserSchema } from '#/lib/schemas/badges'
import { postIdSchema, savePostSchema } from '#/lib/schemas/blog'
import {
  challengeFormSchema,
  challengeIdSchema,
  publishChallengeSchema,
  reviewSubmissionSchema,
  submissionFilterSchema,
} from '#/lib/schemas/challenges'
import { markMessageSchema, messageIdSchema } from '#/lib/schemas/contact'
import {
  eventIdSchema,
  markAttendanceSchema,
  saveEventSchema,
  setCheckInSchema,
} from '#/lib/schemas/events'
import { denyRequestSchema, requestIdSchema } from '#/lib/schemas/github'
import {
  applicationFilterSchema,
  reviewApplicationSchema,
} from '#/lib/schemas/membership'
import { issueIdSchema, issueSchema, maskEmail } from '#/lib/schemas/newsletter'
import { moveOfficerSchema, officerIdSchema, officerSchema } from '#/lib/schemas/officers'
import {
  featureProjectSchema,
  projectIdSchema,
  reviewProjectSchema,
  updateProjectSchema,
} from '#/lib/schemas/projects'
import {
  approveResourceSchema,
  resourceIdSchema,
  saveResourceSchema,
} from '#/lib/schemas/resources'
import { saveSettingSchema } from '#/lib/schemas/settings'
import {
  adjustPointsSchema,
  changeRoleSchema,
  listUsersSchema,
  userIdSchema,
} from '#/lib/schemas/users'
import * as badges from '#/services/badges-admin'
import * as blog from '#/services/blog'
import * as challenges from '#/services/challenges'
import * as contact from '#/services/contact'
import * as events from '#/services/events'
import { unreferencedKeys } from '#/services/file-refs'
import { UploadError, deleteFile, putImage } from '#/services/files'
import * as github from '#/services/github'
import { getAdminOverview } from '#/services/home'
import * as members from '#/services/members'
import * as membership from '#/services/membership'
import * as newsletter from '#/services/newsletter'
import * as officers from '#/services/officers'
import * as projects from '#/services/projects'
import * as resources from '#/services/resources'
import { saveSettingAs, settingsOverview } from '#/services/settings-admin'
import type { McpTool, ToolContext, ToolEffect } from './types'

// One tool per thing the admin pages can do, calling the same services and
// validating with the same schemas. The admin reset tool is left out on purpose,
// along with its backup download: it stays on the website only.

function tool<TInput extends z.ZodType>(def: {
  name: string
  title: string
  description: string
  minRole?: 'officer' | 'admin'
  effect: ToolEffect
  input: TInput
  run: (ctx: ToolContext, data: z.output<TInput>) => Promise<unknown>
  confirm?: true | ((data: z.output<TInput>) => boolean)
  preview?: (ctx: ToolContext, data: z.output<TInput>) => Promise<string>
  revealEmails?: boolean
  untrusted?: boolean
}): McpTool {
  return { minRole: 'officer', ...def } as unknown as McpTool
}

const noInput = z.object({})

/** Markdown from the AI, converted to and validated as the stored rich-text JSON. */
const markdown = (opts: { required?: boolean; message?: string }) =>
  z
    .string()
    .max(100_000, 'That is too long.')
    .transform((md) => JSON.stringify(markdownToDoc(md)))
    .pipe(richTextField(opts))
    .describe('Markdown. Headings, lists, links, code blocks, and images are kept.')

const WALL_TIME =
  "Times are the club's local wall clock, formatted like 2026-10-29T15:30, with no timezone."

/** Leads with the email: anyone can pick their own display name. */
async function account(db: Db, id: string) {
  const row = await db.query.user.findFirst({
    where: eq(schema.user.id, id),
    columns: { name: true, email: true, role: true },
  })
  return row
    ? `the account ${row.email} (named "${row.name}", now ${row.role})`
    : `unknown user ${id}`
}

async function titleOf(
  label: string,
  id: string,
  find: () => Promise<string | null | undefined>,
) {
  const title = await find()
  return title ? `${label} "${title}"` : `${label} with unknown id ${id}`
}

/** Deletes screenshots no row points at any more, as the project pages do. */
async function deleteProjectImages(db: Db, keys: string[]) {
  const orphaned = await unreferencedKeys(db, keys)
  await Promise.all(orphaned.map((k) => deleteFile(env.FILES, k).catch(() => undefined)))
}

async function announceIfLive(db: Db, result: { wentLive: boolean }) {
  const announcement = result.wentLive
    ? await challenges.announceChallenges(db, new Date())
    : null
  return { ...result, announced: (announcement?.announced ?? 0) > 0 }
}

const UPLOAD_PURPOSES = ['event', 'badge', 'officer', 'post'] as const
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Reads a download, stopping at the limit: the content-length header can lie or be absent. */
async function readCapped(res: Response, type: string) {
  const reader = res.body?.getReader()
  if (!reader) throw new UploadError('That URL returned nothing.')
  const chunks: BlobPart[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_IMAGE_BYTES) {
      await reader.cancel()
      throw new UploadError('Images must be 5 MB or smaller.')
    }
    chunks.push(new Uint8Array(value))
  }
  return new File(chunks, 'image', { type })
}

export const TOOLS: McpTool[] = [
  // ---------- Overview ----------
  tool({
    name: 'get_overview',
    title: 'Get the admin overview',
    description: 'Counts for the club, including every queue waiting on an officer.',
    effect: 'read',
    input: noInput,
    run: ({ db }) => getAdminOverview(db),
  }),

  // ---------- Blog ----------
  tool({
    name: 'list_posts',
    title: 'List blog posts',
    description: 'Every blog post, drafts included.',
    effect: 'read',
    input: noInput,
    run: ({ db }) => blog.listAllPosts(db),
  }),
  tool({
    name: 'get_post',
    title: 'Get a blog post',
    description: 'One post for editing, with its body as Markdown.',
    effect: 'read',
    input: postIdSchema,
    run: ({ db }, data) => blog.getPostForEdit(db, data.id),
  }),
  tool({
    name: 'save_post',
    title: 'Create or edit a blog post',
    description:
      'Pass id: null to create. publish is "keep", "publish", or "unpublish". Publishing puts it on the public site.',
    effect: 'write',
    input: savePostSchema.safeExtend({
      content: markdown({ required: true, message: 'The post is empty.' }),
    }),
    run: ({ db, user }, data) => blog.savePost(db, user, data),
  }),
  tool({
    name: 'set_post_published',
    title: 'Publish or unpublish a blog post',
    description: 'Moves an existing post on or off the public site.',
    effect: 'write',
    input: postIdSchema.extend({ published: z.boolean() }),
    run: ({ db }, data) => blog.setPostPublished(db, data.id, data.published),
  }),
  tool({
    name: 'delete_post',
    title: 'Delete a blog post',
    description: 'Permanently deletes a post. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: postIdSchema,
    preview: ({ db }, data) =>
      titleOf('Delete the blog post', data.id, async () => {
        const row = await db.query.post.findFirst({
          where: eq(schema.post.id, data.id),
          columns: { title: true },
        })
        return row?.title
      }),
    run: ({ db }, data) => blog.deletePost(db, data.id),
  }),

  // ---------- Challenges ----------
  tool({
    name: 'list_challenges',
    title: 'List challenges',
    description: 'Every challenge with its publish state and pending submission count.',
    effect: 'read',
    input: noInput,
    run: ({ db }) => challenges.listChallengesForAdmin(db),
  }),
  tool({
    name: 'get_challenge',
    title: 'Get a challenge',
    description: 'One challenge for editing, with its prompt as Markdown.',
    effect: 'read',
    input: challengeIdSchema,
    run: async ({ db }, data) => {
      const [row, list] = await Promise.all([
        challenges.getChallengeForAdmin(db, data.id),
        challenges.listChallengesForAdmin(db),
      ])
      return { challenge: row, points: list.points, nextWeekNo: list.nextWeekNo }
    },
  }),
  tool({
    name: 'save_challenge',
    title: 'Create or edit a challenge',
    description: `Omit id to create. publishMode is "draft", "now", or "schedule" (with publishAt). ${WALL_TIME} "now" and "schedule" email members, so they need approval on the website. Drafts save right away.`,
    effect: 'write',
    confirm: (data) => data.publishMode !== 'draft',
    input: challengeFormSchema.safeExtend({
      prompt: markdown({ required: true, message: 'Write the prompt.' }),
    }),
    preview: async (_ctx, data) =>
      data.publishMode === 'now'
        ? `Publish the challenge "${data.title}" now and email members about it`
        : `Schedule the challenge "${data.title}" for ${data.publishAt} and email members when it goes live`,
    run: async ({ db, user }, data) =>
      announceIfLive(db, await challenges.saveChallenge(db, data, user.id)),
  }),
  tool({
    name: 'set_challenge_published',
    title: 'Publish or unpublish a challenge',
    description:
      'mode "now" publishes and emails members, so it needs approval on the website. mode "draft" takes it down right away.',
    effect: 'write',
    confirm: (data) => data.mode === 'now',
    input: publishChallengeSchema,
    preview: ({ db }, data) =>
      titleOf('Publish and email members about the challenge', data.id, async () => {
        const row = await db.query.challenge.findFirst({
          where: eq(schema.challenge.id, data.id),
          columns: { title: true, description: true },
        })
        return row && `${row.title}: ${row.description}`
      }),
    run: async ({ db }, data) =>
      announceIfLive(db, await challenges.setChallengePublished(db, data.id, data.mode)),
  }),
  tool({
    name: 'delete_challenge',
    title: 'Delete a challenge',
    description: 'Permanently deletes a challenge. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: challengeIdSchema,
    preview: ({ db }, data) =>
      titleOf('Delete the challenge', data.id, async () => {
        const row = await db.query.challenge.findFirst({
          where: eq(schema.challenge.id, data.id),
          columns: { title: true },
        })
        return row?.title
      }),
    run: ({ db, user }, data) => challenges.deleteChallenge(db, data.id, user.id),
  }),
  tool({
    name: 'list_submissions',
    title: 'List challenge submissions',
    description: 'Submissions to review. Filter by status: pending, pass, or fail.',
    effect: 'read',
    untrusted: true,
    input: submissionFilterSchema,
    run: ({ db }, data) => challenges.listSubmissionsForReview(db, data),
  }),
  tool({
    name: 'get_submission',
    title: 'Get a challenge submission',
    description: 'One submission with its link and any pasted code.',
    effect: 'read',
    untrusted: true,
    input: challengeIdSchema,
    run: ({ db }, data) => challenges.getSubmissionDetail(db, data.id),
  }),
  tool({
    name: 'review_submission',
    title: 'Review a challenge submission',
    description: 'Pass, fail, or reopen a submission. Passing awards points and badges.',
    effect: 'write',
    input: reviewSubmissionSchema,
    run: ({ db, user }, data) =>
      challenges.reviewSubmission(db, { ...data, reviewerId: user.id }),
  }),

  // ---------- Events ----------
  tool({
    name: 'list_events',
    title: 'List events',
    description: 'Every event with its RSVP and attendance counts.',
    effect: 'read',
    input: noInput,
    run: ({ db }) => events.listAdminEvents(db),
  }),
  tool({
    name: 'get_event',
    title: 'Get an event',
    description: 'One event for editing.',
    effect: 'read',
    input: eventIdSchema,
    run: ({ db }, data) => events.getEventForm(db, data.eventId),
  }),
  tool({
    name: 'save_event',
    title: 'Create or edit an event',
    description: `Omit id to create. Set values.coverKey to null, or to a key from upload_image. ${WALL_TIME}`,
    effect: 'write',
    input: saveEventSchema,
    run: ({ db, user }, data) => events.saveEvent(db, { ...data, userId: user.id }),
  }),
  tool({
    name: 'delete_event',
    title: 'Delete an event',
    description:
      'Permanently deletes an event with its RSVPs and attendance. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: eventIdSchema,
    preview: ({ db }, data) =>
      titleOf(
        'Delete, with its RSVPs and attendance, the event',
        data.eventId,
        async () => {
          const row = await db.query.event.findFirst({
            where: eq(schema.event.id, data.eventId),
            columns: { title: true },
          })
          return row?.title
        },
      ),
    run: ({ db }, data) => events.deleteEvent(db, data.eventId),
  }),
  tool({
    name: 'regenerate_check_in_code',
    title: 'Regenerate an event check-in code',
    description: 'Replaces the code, so the old one and its QR code stop working.',
    effect: 'write',
    input: eventIdSchema,
    run: ({ db }, data) => events.regenerateCheckInCode(db, data.eventId),
  }),
  tool({
    name: 'set_check_in_open',
    title: 'Open or close event check-in',
    description: 'Controls whether members can check in with the code.',
    effect: 'write',
    input: setCheckInSchema,
    run: ({ db }, data) => events.setCheckInOpen(db, data.eventId, data.open),
  }),
  tool({
    name: 'get_attendance',
    title: 'Get an event attendance sheet',
    description: 'Who RSVPed and who was marked present.',
    effect: 'read',
    input: eventIdSchema,
    run: ({ db }, data) => events.getAttendanceSheet(db, data.eventId),
  }),
  tool({
    name: 'mark_attendance',
    title: 'Mark event attendance',
    description: 'Marks a member present or absent. Settles their points and badges.',
    effect: 'write',
    input: markAttendanceSchema,
    run: ({ db, user }, data) =>
      events.markAttendance(db, { ...data, markedBy: user.id }),
  }),
  tool({
    name: 'get_check_in_display',
    title: 'Get an event check-in display',
    description: 'The current check-in code and how many have checked in.',
    effect: 'read',
    input: eventIdSchema,
    run: ({ db }, data) => events.getPresentData(db, data.eventId),
  }),

  // ---------- Projects ----------
  tool({
    name: 'list_project_queue',
    title: 'List the project review queue',
    description: 'Projects waiting on review, and the ones already reviewed.',
    effect: 'read',
    untrusted: true,
    input: noInput,
    run: ({ db }) => projects.listProjectQueue(db),
  }),
  tool({
    name: 'get_project',
    title: 'Get a project',
    description: 'One project for editing, in any review state.',
    effect: 'read',
    untrusted: true,
    input: projectIdSchema,
    run: ({ db, user }, data) => projects.getProjectForEdit(db, data.id, user),
  }),
  tool({
    name: 'update_project',
    title: 'Edit a project',
    description:
      'Replaces a project. Read it with get_project first and send every field back. Keys in imageKeys come from the project, since upload_image does not make project screenshots.',
    effect: 'write',
    input: updateProjectSchema,
    run: async ({ db, user }, { id, ...input }) => {
      const result = await projects.updateProject(db, user, id, input)
      await deleteProjectImages(db, result.unusedKeys)
      return { id: result.id, status: result.status }
    },
  }),
  tool({
    name: 'delete_project',
    title: 'Delete a project',
    description:
      'Permanently deletes a project and its screenshots. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: projectIdSchema,
    preview: ({ db }, data) =>
      titleOf('Delete the project', data.id, async () => {
        const row = await db.query.project.findFirst({
          where: eq(schema.project.id, data.id),
          columns: { title: true },
        })
        return row?.title
      }),
    run: async ({ db, user }, data) => {
      const { imageKeys } = await projects.deleteProject(db, user, data.id)
      await deleteProjectImages(db, imageKeys)
      return { ok: true }
    },
  }),
  tool({
    name: 'review_project',
    title: 'Review a project',
    description:
      'Approve, reject, or unapprove. Approving awards the team points and badges. Rejecting needs a reason.',
    effect: 'write',
    input: reviewProjectSchema,
    run: async ({ db, user }, data) => {
      const { status, points } = await projects.reviewProject(db, user, data)
      return { status, points }
    },
  }),
  tool({
    name: 'set_project_featured',
    title: 'Feature a project',
    description: 'Adds or removes a project from the featured spots on the site.',
    effect: 'write',
    input: featureProjectSchema,
    run: ({ db }, data) => projects.setProjectFeatured(db, data.id, data.featured),
  }),

  // ---------- Membership ----------
  tool({
    name: 'list_applications',
    title: 'List membership applications',
    description: 'Applications by status: pending, approved, rejected, or all.',
    effect: 'read',
    untrusted: true,
    input: applicationFilterSchema,
    run: ({ db }, data) => membership.listApplications(db, { status: data.status }),
  }),
  tool({
    name: 'get_application',
    title: 'Get a membership application',
    description: 'One application with all its answers.',
    effect: 'read',
    untrusted: true,
    input: z.object({ id: z.string().min(1) }),
    run: ({ db }, data) => membership.getApplicationDetail(db, data.id),
  }),
  tool({
    name: 'review_application',
    title: 'Review a membership application',
    description:
      'Approving makes the applicant a member, so it needs approval on the website. Rejecting needs a note saying why, and runs right away. They are emailed either way.',
    effect: 'write',
    confirm: (data) => data.decision === 'approve',
    input: reviewApplicationSchema,
    preview: async ({ db }, data) => {
      const row = await db.query.membershipApplication.findFirst({
        where: eq(schema.membershipApplication.id, data.id),
        columns: { userId: true },
      })
      return row
        ? `Make ${await account(db, row.userId)} a member and email them`
        : `Approve an application with unknown id ${data.id}`
    },
    run: ({ db, user }, data) =>
      membership.reviewApplication(db, {
        id: data.id,
        reviewerId: user.id,
        decision: data.decision,
        note: data.note,
      }),
  }),

  // ---------- GitHub org ----------
  tool({
    name: 'list_github_requests',
    title: 'List GitHub org requests',
    description: 'Requests to join the GitHub organization.',
    effect: 'read',
    untrusted: true,
    input: noInput,
    run: async ({ db }) => {
      const { token, org } = github.githubConfig()
      return {
        requests: await github.listGithubRequests(db),
        org,
        tokenConfigured: token !== null,
      }
    },
  }),
  tool({
    name: 'approve_github_request',
    title: 'Approve a GitHub org request',
    description:
      'Approves the request and sends the org invite through GitHub. Needs approval on the website.',
    effect: 'write',
    confirm: true,
    input: requestIdSchema,
    preview: async ({ db }, data) => {
      const row = await db.query.githubMembershipRequest.findFirst({
        where: eq(schema.githubMembershipRequest.id, data.id),
        columns: { githubUsername: true, userId: true },
      })
      return row
        ? `Invite the GitHub user ${row.githubUsername} to the organization, for ${await account(db, row.userId)}`
        : `Approve a GitHub request with unknown id ${data.id}`
    },
    run: ({ db, user }, data) =>
      github.approveGithubRequest(db, { id: data.id, reviewerId: user.id }),
  }),
  tool({
    name: 'retry_github_invite',
    title: 'Retry a GitHub org invite',
    description: 'Sends the invite again after GitHub returned an error.',
    effect: 'write',
    input: requestIdSchema,
    run: ({ db }, data) => github.retryGithubInvite(db, data.id),
  }),
  tool({
    name: 'deny_github_request',
    title: 'Deny a GitHub org request',
    description: 'Denies the request. The note is shown to the member.',
    effect: 'write',
    input: denyRequestSchema,
    run: async ({ db, user }, data) => {
      await github.denyGithubRequest(db, {
        id: data.id,
        note: data.note,
        reviewerId: user.id,
      })
      return { ok: true }
    },
  }),

  // ---------- Resources ----------
  tool({
    name: 'list_resources',
    title: 'List resources',
    description: 'Every learning resource, including suggestions waiting on approval.',
    effect: 'read',
    untrusted: true,
    input: noInput,
    run: ({ db }) => resources.listResourcesAdmin(db),
  }),
  tool({
    name: 'save_resource',
    title: 'Create or edit a resource',
    description: 'Omit id to create. approved controls whether it shows on the site.',
    effect: 'write',
    input: saveResourceSchema,
    run: ({ db, user }, data) => resources.saveResource(db, user.id, data),
  }),
  tool({
    name: 'set_resource_approved',
    title: 'Approve or hide a resource',
    description: 'Moves a resource on or off the public resources page.',
    effect: 'write',
    input: approveResourceSchema,
    run: ({ db }, data) => resources.setResourceApproved(db, data.id, data.approved),
  }),
  tool({
    name: 'delete_resource',
    title: 'Delete a resource',
    description: 'Permanently deletes a resource. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: resourceIdSchema,
    preview: ({ db }, data) =>
      titleOf('Delete the resource', data.id, async () => {
        const row = await db.query.resource.findFirst({
          where: eq(schema.resource.id, data.id),
          columns: { title: true },
        })
        return row?.title
      }),
    run: async ({ db }, data) => {
      await resources.deleteResource(db, data.id)
      return { ok: true }
    },
  }),

  // ---------- Badges ----------
  tool({
    name: 'list_badges',
    title: 'List badges',
    description: 'Every badge with its rule and how many members hold it.',
    effect: 'read',
    input: noInput,
    run: ({ db }) => badges.listBadgesAdmin(db),
  }),
  tool({
    name: 'save_badge',
    title: 'Create or edit a badge',
    description:
      'Omit id to create. Set imageKey to null, or to a key from upload_image. Custom badges need threshold null and autoAward false.',
    effect: 'write',
    input: badgeSchema,
    run: ({ db }, data) => badges.saveBadge(db, data),
  }),
  tool({
    name: 'delete_badge',
    title: 'Delete a badge',
    description:
      'Permanently deletes a badge and every award of it. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: badgeIdSchema,
    preview: ({ db }, data) =>
      titleOf('Delete, and take back from everyone, the badge', data.id, async () => {
        const row = await db.query.badge.findFirst({
          where: eq(schema.badge.id, data.id),
          columns: { name: true },
        })
        return row?.name
      }),
    run: async ({ db }, data) => {
      await badges.deleteBadge(db, data.id)
      return { ok: true }
    },
  }),
  tool({
    name: 'list_badge_holders',
    title: 'List who holds a badge',
    description: 'Members holding a badge and when they earned it.',
    effect: 'read',
    input: badgeIdSchema,
    run: ({ db }, data) => badges.badgeHolders(db, data.id),
  }),
  tool({
    name: 'award_badge',
    title: 'Award a badge',
    description: 'Gives a member a badge. Find their id with list_users.',
    effect: 'write',
    input: badgeUserSchema,
    run: ({ db, user }, data) => badges.awardBadgeTo(db, { ...data, awardedBy: user.id }),
  }),
  tool({
    name: 'revoke_badge',
    title: 'Take back a badge',
    description: 'Removes a badge from a member.',
    effect: 'write',
    input: badgeUserSchema,
    run: async ({ db }, data) => {
      await badges.revokeBadgeFrom(db, data)
      return { ok: true }
    },
  }),

  // ---------- Newsletter ----------
  tool({
    name: 'get_newsletter',
    title: 'Get newsletter issues and subscribers',
    description: 'Every issue, subscriber counts, and subscribers with masked addresses.',
    effect: 'read',
    input: noInput,
    run: async ({ db }) => {
      const [subscribers, issues] = await Promise.all([
        newsletter.listSubscribers(db),
        newsletter.listIssues(db),
      ])
      const active = subscribers.filter((s) => s.unsubscribedAt === null).length
      return {
        issues,
        counts: { active, unsubscribed: subscribers.length - active },
        subscribers: subscribers.map((s) => ({
          ...s,
          maskedAddress: maskEmail(s.email),
          email: undefined,
        })),
      }
    },
  }),
  tool({
    name: 'save_newsletter_issue',
    title: 'Create or edit a newsletter draft',
    description: 'Omit id to create. Saving never sends anything.',
    effect: 'write',
    input: issueSchema.safeExtend({
      content: markdown({ required: true, message: 'Write the issue first.' }),
    }),
    run: ({ db, user }, data) => newsletter.saveIssueDraft(db, user.id, data),
  }),
  tool({
    name: 'delete_newsletter_issue',
    title: 'Delete a newsletter draft',
    description: 'Permanently deletes a draft. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: issueIdSchema,
    preview: ({ db }, data) =>
      titleOf('Delete the newsletter draft', data.id, async () => {
        const row = await db.query.newsletterIssue.findFirst({
          where: eq(schema.newsletterIssue.id, data.id),
          columns: { subject: true },
        })
        return row?.subject
      }),
    run: async ({ db }, data) => {
      await newsletter.deleteIssueDraft(db, data.id)
      return { ok: true }
    },
  }),
  tool({
    name: 'send_test_newsletter',
    title: 'Send yourself a test newsletter',
    description: 'Emails this draft to the signed-in officer only.',
    effect: 'write',
    input: issueSchema.safeExtend({
      content: markdown({ required: true, message: 'Write the issue first.' }),
    }),
    run: async ({ db, user }, data) => {
      const result = await newsletter.sendTestIssue(db, data, user.email)
      return result
    },
  }),
  tool({
    name: 'send_newsletter',
    title: 'Send a newsletter issue',
    description:
      'Emails an issue to every active subscriber. This can not be undone. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: issueIdSchema,
    // The whole issue, so approving covers exactly these words.
    preview: async ({ db }, data) => {
      const row = await db.query.newsletterIssue.findFirst({
        where: eq(schema.newsletterIssue.id, data.id),
        columns: { subject: true, content: true },
      })
      return row
        ? `Email every active subscriber the newsletter "${row.subject}":\n\n${docToMarkdown(parseRichText(row.content))}`
        : `Send a newsletter with unknown id ${data.id}`
    },
    run: ({ db }, data) => newsletter.sendIssue(db, data.id),
  }),

  // ---------- Contact messages ----------
  tool({
    name: 'list_messages',
    title: 'List contact messages',
    description:
      'Messages from the contact form, with the address each one can be answered at.',
    effect: 'read',
    untrusted: true,
    revealEmails: true,
    input: noInput,
    run: ({ db }) => contact.listMessages(db),
  }),
  tool({
    name: 'mark_message',
    title: 'Mark a contact message read or unread',
    description: 'Changes the read state of a message.',
    effect: 'write',
    input: markMessageSchema,
    run: ({ db }, data) => contact.setMessageRead(db, data.id, data.read),
  }),
  tool({
    name: 'delete_message',
    title: 'Delete a contact message',
    description: 'Permanently deletes a message. Needs approval on the website.',
    effect: 'destructive',
    confirm: true,
    input: messageIdSchema,
    preview: ({ db }, data) =>
      titleOf('Delete the contact message from', data.id, async () => {
        const row = await db.query.contactMessage.findFirst({
          where: eq(schema.contactMessage.id, data.id),
          columns: { name: true },
        })
        return row?.name
      }),
    run: async ({ db }, data) => {
      await contact.deleteMessage(db, data.id)
      return { ok: true }
    },
  }),

  // ---------- Images ----------
  tool({
    name: 'upload_image',
    title: 'Upload an image from a URL',
    description: `Copies an https image into the site's storage, up to 5 MB. Returns a key for an event cover, badge, or officer photo, and a path to use in post Markdown as ![alt](path).`,
    effect: 'write',
    input: z.object({
      url: z.url({ protocol: /^https$/ }).max(2000),
      purpose: z.enum(UPLOAD_PURPOSES),
    }),
    run: async (_ctx, data) => {
      const res = await fetch(data.url, {
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) throw new UploadError(`That URL returned ${res.status}.`)
      const type = (res.headers.get('content-type') ?? '').split(';')[0]?.trim() ?? ''
      const key = await putImage(env.FILES, data.purpose, await readCapped(res, type))
      return { key, path: `/files/${key}` }
    },
  }),

  // ---------- Settings ----------
  tool({
    name: 'get_settings',
    title: 'Get club settings',
    description: 'Every settings group. Only admins can change them.',
    effect: 'read',
    revealEmails: true,
    input: noInput,
    run: ({ db }) => settingsOverview(db),
  }),
  tool({
    name: 'save_settings',
    title: 'Change a settings group',
    description:
      'Replaces one group: club-info, social, points, github-org, or email. Read get_settings first and send the whole group back. Needs approval on the website.',
    minRole: 'admin',
    effect: 'destructive',
    confirm: true,
    input: z.object({
      key: z.enum(['club-info', 'social', 'points', 'github-org', 'email']),
      value: z.record(z.string(), z.unknown()),
    }),
    preview: async (_ctx, data) => `Replace the "${data.key}" settings`,
    run: ({ db, user }, data) => {
      const parsed = saveSettingSchema.parse(data)
      return saveSettingAs(db, user, parsed.key, parsed.value as never)
    },
  }),

  // ---------- Users ----------
  tool({
    name: 'list_users',
    title: 'List users',
    description:
      'Search accounts by name or email, and filter by role. Addresses are left out of the results; use get_user for one person.',
    effect: 'read',
    input: listUsersSchema,
    run: ({ db }, data) => members.listUsers(db, data),
  }),
  tool({
    name: 'get_user',
    title: 'Get a user',
    description: 'One account in detail, including its email address and point history.',
    effect: 'read',
    revealEmails: true,
    input: userIdSchema,
    run: ({ db }, data) => members.getUserDetail(db, data.userId),
  }),
  tool({
    name: 'set_user_role',
    title: 'Change a user role',
    description:
      'Sets a user to guest, member, officer, or admin. Needs approval on the website.',
    minRole: 'admin',
    effect: 'destructive',
    confirm: true,
    input: changeRoleSchema,
    preview: async ({ db }, data) =>
      `Change ${await account(db, data.userId)} to ${data.role}`,
    run: ({ db, user }, data) =>
      members.changeRole(db, { actorId: user.id, userId: data.userId, role: data.role }),
  }),
  tool({
    name: 'adjust_user_points',
    title: 'Adjust user points',
    description:
      'Adds or removes points, with a note the member sees. Needs approval on the website.',
    minRole: 'admin',
    effect: 'destructive',
    confirm: true,
    input: adjustPointsSchema,
    preview: async ({ db }, data) =>
      `${data.delta > 0 ? 'Add' : 'Remove'} ${Math.abs(data.delta)} points ${data.delta > 0 ? 'to' : 'from'} ${await account(db, data.userId)}, with the note "${data.note}"`,
    run: ({ db, user }, data) =>
      members.adjustMemberPoints(db, { ...data, createdBy: user.id }),
  }),

  // ---------- Officers ----------
  tool({
    name: 'list_officers',
    title: 'List the officer roster',
    description: 'The officers shown on the About page.',
    minRole: 'admin',
    effect: 'read',
    input: noInput,
    run: ({ db }) => officers.listOfficers(db),
  }),
  tool({
    name: 'save_officer',
    title: 'Add or edit a roster entry',
    description:
      "Omit id to create. Set imageKey to null, or to a key from upload_image. This changes the About page, not anyone's role.",
    minRole: 'admin',
    effect: 'write',
    input: officerSchema,
    run: ({ db }, data) => officers.saveOfficer(db, data),
  }),
  tool({
    name: 'delete_officer',
    title: 'Remove a roster entry',
    description: 'Removes someone from the About page. Needs approval on the website.',
    minRole: 'admin',
    effect: 'destructive',
    confirm: true,
    input: officerIdSchema,
    preview: ({ db }, data) =>
      titleOf('Remove from the About page the officer', data.id, async () => {
        const row = await db.query.officer.findFirst({
          where: eq(schema.officer.id, data.id),
          columns: { name: true },
        })
        return row?.name
      }),
    run: async ({ db }, data) => {
      await officers.deleteOfficer(db, data.id)
      return { ok: true }
    },
  }),
  tool({
    name: 'move_officer',
    title: 'Reorder the officer roster',
    description: 'Moves a roster entry up or down on the About page.',
    minRole: 'admin',
    effect: 'write',
    input: moveOfficerSchema,
    run: ({ db }, data) => officers.moveOfficer(db, data.id, data.direction),
  }),
]
