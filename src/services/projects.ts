import { and, asc, desc, eq, inArray, notInArray, sql } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import type { ProjectStatus } from '#/db/schema'
import type { Role } from '#/lib/roles'
import {
  canChangeTeam,
  canDeleteProject,
  canEditProject,
  canViewProject,
} from '#/lib/schemas/projects'
import type { ProjectData, ProjectDecision } from '#/lib/schemas/projects'
import { prefsFooter, renderEmail, siteUrl } from './email-templates'
import { recipientById, sendEmails } from './email'
import type { EmailMessage } from './email'
import { settlePoints } from './points'
import { getSetting } from './settings'

// Team projects. The submitter (`project.authorId`) always has a
// `project_member` row; teammates are the other rows. Approval settles the
// configured project points for every teammate; rejecting, un-approving, or
// dropping someone from an approved team settles them back to zero.

export interface Viewer {
  id: string
  role: Role
}

export class ProjectError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID' = 'INVALID',
  ) {
    super(message)
    this.name = 'ProjectError'
  }
}

const MEMBER_ROLES = ['member', 'officer', 'admin'] as const

export interface TeamMember {
  id: string
  name: string
  image: string | null
  avatarKey: string | null
}

/** Teams for many projects at once, submitter first, then in the order added. */
async function teamsFor(db: Db, projectIds: string[]) {
  const teams = new Map<string, TeamMember[]>()
  if (projectIds.length === 0) return teams
  const rows = await db
    .select({
      projectId: schema.projectMember.projectId,
      id: schema.user.id,
      name: schema.user.name,
      image: schema.user.image,
      avatarKey: schema.user.avatarKey,
    })
    .from(schema.projectMember)
    .innerJoin(schema.user, eq(schema.user.id, schema.projectMember.userId))
    .innerJoin(schema.project, eq(schema.project.id, schema.projectMember.projectId))
    .where(inArray(schema.projectMember.projectId, projectIds))
    .orderBy(
      desc(sql`${schema.project.authorId} = ${schema.user.id}`),
      asc(schema.projectMember.createdAt),
      asc(schema.user.name),
    )
  for (const { projectId, ...member } of rows) {
    const list = teams.get(projectId) ?? []
    list.push(member)
    teams.set(projectId, list)
  }
  return teams
}

const cardColumns = {
  id: schema.project.id,
  title: schema.project.title,
  description: schema.project.description,
  tech: schema.project.tech,
  imageKeys: schema.project.imageKeys,
  featured: schema.project.featured,
  year: schema.project.year,
  repoUrl: schema.project.repoUrl,
  demoUrl: schema.project.demoUrl,
  createdAt: schema.project.createdAt,
}

/** The public showcase: approved projects, featured first, newest next. */
export async function listApprovedProjects(db: Db) {
  const rows = await db
    .select(cardColumns)
    .from(schema.project)
    .where(eq(schema.project.status, 'approved'))
    .orderBy(desc(schema.project.featured), desc(schema.project.createdAt))
  const teams = await teamsFor(
    db,
    rows.map((r) => r.id),
  )
  return rows.map((r) => ({ ...r, team: teams.get(r.id) ?? [] }))
}

export type ProjectCard = Awaited<ReturnType<typeof listApprovedProjects>>[number]

async function loadProject(db: Db, id: string) {
  const row = await db.query.project.findFirst({ where: eq(schema.project.id, id) })
  if (!row) return null
  const team = (await teamsFor(db, [id])).get(id) ?? []
  return { ...row, team, memberIds: team.map((m) => m.id) }
}

/**
 * One project for its page, or null when it doesn't exist or the viewer may
 * not see it (pending and rejected projects are team- and officer-only).
 */
export async function getProjectView(db: Db, id: string, viewer: Viewer | null) {
  const p = await loadProject(db, id)
  if (!p || !canViewProject(p, viewer)) return null
  const { memberIds: _, ...project } = p
  const isPublic = p.status === 'approved'
  return {
    project: {
      ...project,
      // Review notes are for the team and officers only.
      rejectionReason: isPublic ? null : project.rejectionReason,
    },
    canEdit: canEditProject(p, viewer),
    canDelete: canDeleteProject(p, viewer),
  }
}

export type ProjectView = NonNullable<Awaited<ReturnType<typeof getProjectView>>>

/** A project with everything the edit form needs. Throws when not allowed. */
export async function getProjectForEdit(db: Db, id: string, viewer: Viewer) {
  const p = await loadProject(db, id)
  if (!p || !canViewProject(p, viewer)) throw new ProjectError('Not found.', 'NOT_FOUND')
  if (!canEditProject(p, viewer)) {
    throw new ProjectError(
      p.status === 'approved'
        ? 'This project is live. Ask an officer to make changes.'
        : 'Only the team can edit this project.',
      'FORBIDDEN',
    )
  }
  const { memberIds: _, ...project } = p
  return {
    project,
    canChangeTeam: canChangeTeam(p, viewer),
    canDelete: canDeleteProject(p, viewer),
  }
}

export type ProjectEdit = Awaited<ReturnType<typeof getProjectForEdit>>

/** Members (not guests) whose names match, for the teammate picker. */
export async function searchTeammates(
  db: Db,
  query: string,
  exclude: string[] = [],
  limit = 8,
) {
  const q = query.trim()
  if (!q) return []
  const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
  return db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      image: schema.user.image,
      avatarKey: schema.user.avatarKey,
    })
    .from(schema.user)
    .where(
      and(
        inArray(schema.user.role, MEMBER_ROLES),
        sql`${schema.user.name} LIKE ${pattern} ESCAPE '\\'`,
        exclude.length ? notInArray(schema.user.id, exclude) : undefined,
      ),
    )
    .orderBy(asc(schema.user.name))
    .limit(limit)
}

/** Throws unless every id is an existing member (guests can't be credited). */
async function assertMembers(db: Db, ids: string[]) {
  if (ids.length === 0) return
  const rows = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(and(inArray(schema.user.id, ids), inArray(schema.user.role, MEMBER_ROLES)))
  if (rows.length !== ids.length) {
    throw new ProjectError('Teammates must be club members. Remove anyone who is not.')
  }
}

/** Makes the team exactly `authorId` + `teammateIds`. Returns who left and joined. */
async function syncTeam(
  db: Db,
  projectId: string,
  authorId: string,
  teammateIds: string[],
) {
  const desired = [...new Set([authorId, ...teammateIds])]
  const current = (
    await db
      .select({ userId: schema.projectMember.userId })
      .from(schema.projectMember)
      .where(eq(schema.projectMember.projectId, projectId))
  ).map((r) => r.userId)
  const removed = current.filter((id) => !desired.includes(id))
  const added = desired.filter((id) => !current.includes(id))
  if (removed.length) {
    await db
      .delete(schema.projectMember)
      .where(
        and(
          eq(schema.projectMember.projectId, projectId),
          inArray(schema.projectMember.userId, removed),
        ),
      )
  }
  if (added.length) {
    await db
      .insert(schema.projectMember)
      .values(added.map((userId) => ({ projectId, userId })))
      .onConflictDoNothing()
  }
  return { removed, added, members: desired }
}

async function settleTeam(
  db: Db,
  projectId: string,
  userIds: string[],
  amount: number,
  createdBy: string | null,
  note: string,
) {
  for (const userId of userIds) {
    await settlePoints(db, {
      userId,
      source: 'project',
      sourceId: projectId,
      amount,
      note,
      createdBy,
    })
  }
}

export async function createProject(db: Db, user: Viewer, data: ProjectData) {
  const teammateIds = data.teammateIds.filter((id) => id !== user.id)
  await assertMembers(db, teammateIds)
  const [row] = await db
    .insert(schema.project)
    .values({
      title: data.title,
      description: data.description,
      tech: data.tech,
      repoUrl: data.repoUrl,
      demoUrl: data.demoUrl,
      year: data.year,
      imageKeys: data.imageKeys,
      authorId: user.id,
      status: 'pending',
    })
    .returning({ id: schema.project.id })
  await syncTeam(db, row.id, user.id, teammateIds)
  return { id: row.id }
}

/**
 * Saves an edit. Members' edits send the project back to review; officers'
 * edits keep its status. Returns the screenshot keys no longer used so the
 * caller can delete them from R2.
 */
export async function updateProject(db: Db, user: Viewer, id: string, data: ProjectData) {
  const p = await loadProject(db, id)
  if (!p || !canViewProject(p, user)) throw new ProjectError('Not found.', 'NOT_FOUND')
  if (!canEditProject(p, user)) {
    throw new ProjectError(
      p.status === 'approved'
        ? 'This project is live. Ask an officer to make changes.'
        : 'Only the team can edit this project.',
      'FORBIDDEN',
    )
  }
  const isOfficerEdit = user.role === 'officer' || user.role === 'admin'
  const status: ProjectStatus = isOfficerEdit ? p.status : 'pending'

  await db
    .update(schema.project)
    .set({
      title: data.title,
      description: data.description,
      tech: data.tech,
      repoUrl: data.repoUrl,
      demoUrl: data.demoUrl,
      year: data.year,
      imageKeys: data.imageKeys,
      status,
      ...(status === p.status
        ? {}
        : { rejectionReason: null, reviewedBy: null, reviewedAt: null }),
    })
    .where(eq(schema.project.id, id))

  let removed: string[] = []
  let added: string[] = []
  if (canChangeTeam(p, user)) {
    const teammateIds = data.teammateIds.filter((m) => m !== p.authorId)
    // Anyone already on the team stays valid even if their role changed since.
    await assertMembers(
      db,
      teammateIds.filter((m) => !p.memberIds.includes(m)),
    )
    ;({ removed, added } = await syncTeam(db, id, p.authorId, teammateIds))
  }

  if (removed.length) {
    await settleTeam(db, id, removed, 0, user.id, 'Removed from project team')
  }
  if (added.length && status === 'approved') {
    const { project: amount } = await getSetting(db, 'points')
    await settleTeam(db, id, added, amount, user.id, `Project: ${data.title}`)
  }

  const unusedKeys = p.imageKeys.filter((k) => !data.imageKeys.includes(k))
  return { id, status, unusedKeys }
}

/** Deletes a project after settling every teammate's project points to zero. */
export async function deleteProject(db: Db, user: Viewer, id: string) {
  const p = await loadProject(db, id)
  if (!p || !canViewProject(p, user)) throw new ProjectError('Not found.', 'NOT_FOUND')
  if (!canDeleteProject(p, user)) {
    throw new ProjectError(
      'Live projects can only be removed by an officer.',
      'FORBIDDEN',
    )
  }
  await settleTeam(db, id, p.memberIds, 0, user.id, 'Project deleted')
  await db.delete(schema.project).where(eq(schema.project.id, id))
  return { imageKeys: p.imageKeys }
}

// ---------- Officer review ----------

/** Every project for the review queue: pending first, then newest. */
export async function listProjectQueue(db: Db) {
  const rows = await db
    .select({
      ...cardColumns,
      status: schema.project.status,
      rejectionReason: schema.project.rejectionReason,
      authorId: schema.project.authorId,
      reviewedAt: schema.project.reviewedAt,
      updatedAt: schema.project.updatedAt,
    })
    .from(schema.project)
    .orderBy(
      sql`case ${schema.project.status} when 'pending' then 0 when 'rejected' then 1 else 2 end`,
      desc(schema.project.updatedAt),
    )
  const teams = await teamsFor(
    db,
    rows.map((r) => r.id),
  )
  return rows.map((r) => ({ ...r, team: teams.get(r.id) ?? [] }))
}

export type QueueProject = Awaited<ReturnType<typeof listProjectQueue>>[number]

const DECISION_STATUS: Record<ProjectDecision, ProjectStatus> = {
  approve: 'approved',
  reject: 'rejected',
  unapprove: 'pending',
}

/**
 * Approve, reject, or un-approve. Points settle for every teammate (the
 * configured amount on approve, zero otherwise), then each teammate who
 * wants project emails gets one.
 */
export async function reviewProject(
  db: Db,
  officer: Viewer,
  input: { id: string; decision: ProjectDecision; reason?: string },
) {
  const p = await loadProject(db, input.id)
  if (!p) throw new ProjectError('Not found.', 'NOT_FOUND')
  const status = DECISION_STATUS[input.decision]
  const reason = input.decision === 'reject' ? (input.reason ?? '').trim() : null
  if (input.decision === 'reject' && !reason) {
    throw new ProjectError('Tell the team why so they can fix it.')
  }

  // Status first: the badge engine counts approved projects when points settle.
  await db
    .update(schema.project)
    .set({
      status,
      rejectionReason: reason,
      reviewedBy: officer.id,
      reviewedAt: new Date(),
      ...(status === 'approved' ? {} : { featured: false }),
    })
    .where(eq(schema.project.id, p.id))

  const { project: amount } = await getSetting(db, 'points')
  await settleTeam(
    db,
    p.id,
    p.memberIds,
    status === 'approved' ? amount : 0,
    officer.id,
    `Project: ${p.title}`,
  )

  const email = await notifyTeam(db, p, input.decision, reason, amount)
  return { status, points: status === 'approved' ? amount : 0, email }
}

async function notifyTeam(
  db: Db,
  p: { id: string; title: string; memberIds: string[] },
  decision: ProjectDecision,
  reason: string | null,
  amount: number,
) {
  const messages: EmailMessage[] = []
  for (const userId of p.memberIds) {
    const to = await recipientById(db, userId, 'projectDecision')
    if (!to) continue
    const first = to.name.split(/\s+/)[0] || to.name
    const content =
      decision === 'approve'
        ? {
            subject: `${p.title} is live on the showcase`,
            heading: 'Your project was approved',
            paragraphs: [
              `Nice work, ${first}. An officer approved "${p.title}" and it is now on the public projects page.`,
              amount > 0
                ? `Everyone on the team earned ${amount} points.`
                : 'It now counts toward your project badges.',
            ],
            cta: { label: 'See it live', href: siteUrl(`/projects/${p.id}`) },
          }
        : decision === 'reject'
          ? {
              subject: `Changes needed on ${p.title}`,
              heading: 'Your project needs a few changes',
              paragraphs: [
                `Hi ${first}, an officer reviewed "${p.title}" and asked for changes before it goes on the showcase.`,
                `Their note: ${reason}`,
                'Edit the project and save it to send it back for review.',
              ],
              cta: { label: 'Edit the project', href: siteUrl(`/projects/${p.id}/edit`) },
            }
          : {
              subject: `${p.title} is back in review`,
              heading: 'Your project is back in review',
              paragraphs: [
                `Hi ${first}, an officer took "${p.title}" off the public showcase for another look. Its project points are on hold until it is approved again.`,
              ],
              cta: { label: 'View the project', href: siteUrl(`/projects/${p.id}`) },
            }
    const { subject, ...body } = content
    const rendered = renderEmail({ preheader: subject, ...body, ...prefsFooter() })
    messages.push({ to: to.email, subject, ...rendered })
  }
  return sendEmails(db, messages)
}

export async function setProjectFeatured(db: Db, id: string, featured: boolean) {
  const p = await db.query.project.findFirst({
    where: eq(schema.project.id, id),
    columns: { id: true, status: true },
  })
  if (!p) throw new ProjectError('Not found.', 'NOT_FOUND')
  if (featured && p.status !== 'approved') {
    throw new ProjectError('Approve the project before featuring it.')
  }
  await db.update(schema.project).set({ featured }).where(eq(schema.project.id, id))
  return { featured }
}
