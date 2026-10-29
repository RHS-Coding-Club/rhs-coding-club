import { z } from 'zod'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import type { ProjectStatus } from '#/db/schema'

// Shared between the submit/edit form and the project server functions, plus
// the small pure rules (who may see or edit a project) both sides agree on.

export const PROJECT_LIMITS = {
  title: 80,
  description: 2000,
  tech: 8,
  techLength: 24,
  images: 6,
  teammates: 6,
} as const

/** Years a project can be credited to: the club's first year through next year. */
export function projectYears(now = new Date()) {
  const last = now.getFullYear() + 1
  const years: number[] = []
  for (let y = last; y >= 2018; y--) years.push(y)
  return years
}

const httpsUrl = z
  .string()
  .trim()
  .max(300, 'That link is too long.')
  .refine((v) => {
    try {
      const url = new URL(v)
      return url.protocol === 'https:' && url.hostname.includes('.')
    } catch {
      return false
    }
  }, 'Use a full https:// link.')

/** Empty string means "no link"; anything else must be https. */
const optionalUrl = z
  .union([z.literal(''), httpsUrl])
  .nullish()
  .transform((v) => v || null)

/** "  react " -> "React"-ish tidy: trims, collapses spaces. Case is the member's. */
export function normalizeTech(tag: string) {
  return tag.trim().replace(/\s+/g, ' ')
}

/** Dedupes tags case-insensitively, keeping the first spelling. */
export function dedupeTags(tags: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags) {
    const tag = normalizeTech(raw)
    const key = tag.toLowerCase()
    if (!tag || seen.has(key)) continue
    seen.add(key)
    out.push(tag)
  }
  return out
}

export const imageKeySchema = z
  .string()
  .regex(/^project\/[0-9a-f-]{36}\.[a-z]{3,4}$/, 'Unknown image.')

export const projectInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Give the project a name.')
    .max(PROJECT_LIMITS.title, `Keep the name under ${PROJECT_LIMITS.title} characters.`),
  description: z
    .string()
    .trim()
    .min(20, 'Describe it in at least a sentence or two.')
    .max(
      PROJECT_LIMITS.description,
      `Keep it under ${PROJECT_LIMITS.description} characters.`,
    ),
  tech: z
    .array(z.string().trim().min(1).max(PROJECT_LIMITS.techLength, 'Tag too long.'))
    .max(PROJECT_LIMITS.tech, `Up to ${PROJECT_LIMITS.tech} tags.`)
    .transform(dedupeTags),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  year: z.number().int().min(2018).max(2100).nullable(),
  imageKeys: z
    .array(imageKeySchema)
    .max(PROJECT_LIMITS.images, `Up to ${PROJECT_LIMITS.images} screenshots.`)
    .transform((keys) => [...new Set(keys)]),
  /** Other members on the team; the submitter is always included. */
  teammateIds: z
    .array(z.string().min(1).max(64))
    .max(PROJECT_LIMITS.teammates, `Up to ${PROJECT_LIMITS.teammates} teammates.`)
    .transform((ids) => [...new Set(ids)]),
})

export type ProjectInput = z.input<typeof projectInputSchema>
export type ProjectData = z.output<typeof projectInputSchema>

export const projectIdSchema = z.object({ id: z.string().min(1).max(64) })

export const updateProjectSchema = projectInputSchema.extend({
  id: z.string().min(1).max(64),
})

export const teammateSearchSchema = z.object({
  q: z.string().trim().max(60),
  exclude: z.array(z.string().max(64)).max(20).default([]),
})

export const PROJECT_DECISIONS = ['approve', 'reject', 'unapprove'] as const
export type ProjectDecision = (typeof PROJECT_DECISIONS)[number]

export const reviewProjectSchema = z
  .object({
    id: z.string().min(1).max(64),
    decision: z.enum(PROJECT_DECISIONS),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.decision !== 'reject' || (v.reason?.length ?? 0) >= 3, {
    message: 'Tell the team why so they can fix it.',
    path: ['reason'],
  })

export const featureProjectSchema = z.object({
  id: z.string().min(1).max(64),
  featured: z.boolean(),
})

// ---------- Access rules ----------

interface Viewer {
  id: string
  role: Role
}

interface ProjectAccess {
  status: ProjectStatus
  authorId: string
  memberIds: string[]
}

const isTeam = (p: ProjectAccess, viewer: Viewer) =>
  p.authorId === viewer.id || p.memberIds.includes(viewer.id)

/** Approved projects are public; the rest only to their team and officers. */
export function canViewProject(p: ProjectAccess, viewer: Viewer | null) {
  if (p.status === 'approved') return true
  if (!viewer) return false
  return hasRole(viewer.role, 'officer') || isTeam(p, viewer)
}

/**
 * Officers edit anything. Teammates (members) edit until it's approved; after
 * that an officer has to make the change.
 */
export function canEditProject(p: ProjectAccess, viewer: Viewer | null) {
  if (!viewer) return false
  if (hasRole(viewer.role, 'officer')) return true
  return hasRole(viewer.role, 'member') && isTeam(p, viewer) && p.status !== 'approved'
}

/** Only the submitter (or an officer) changes who's on the team. */
export function canChangeTeam(p: ProjectAccess, viewer: Viewer | null) {
  if (!viewer) return false
  return hasRole(viewer.role, 'officer') || p.authorId === viewer.id
}

/** Submitters can withdraw a project that isn't live; officers can delete any. */
export function canDeleteProject(p: ProjectAccess, viewer: Viewer | null) {
  if (!viewer) return false
  if (hasRole(viewer.role, 'officer')) return true
  return p.authorId === viewer.id && p.status !== 'approved'
}
