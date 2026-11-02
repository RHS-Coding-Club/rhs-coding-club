import { z } from 'zod'

// Learning resources: the schemas shared by the suggest/edit forms and the
// server functions, plus small pure helpers. Ships to the browser.

export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type Level = (typeof LEVELS)[number]

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const LEVEL_BLURB: Record<Level, string> = {
  beginner: 'Never written code? Start here.',
  intermediate: 'You can build a small app. Go deeper.',
  advanced: 'Algorithms, systems, and competition prep.',
}

export const MAX_TAGS = 6

const httpUrl = z
  .string()
  .trim()
  .min(1, 'Paste a link.')
  .max(500, 'That link is too long.')
  .refine(isHttpUrl, 'Use a full link that starts with https://')

const tag = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(24, 'Tags are 24 characters at most.')

export const resourceFields = {
  title: z
    .string()
    .trim()
    .min(3, 'Give it a title (3+ characters).')
    .max(120, 'Keep the title under 120 characters.'),
  description: z
    .string()
    .trim()
    .min(10, 'Say what it is in a sentence (10+ characters).')
    .max(500, 'Keep the description under 500 characters.'),
  url: httpUrl,
  level: z.enum(LEVELS, 'Pick a level.'),
  tags: z.array(tag).max(MAX_TAGS, `Up to ${MAX_TAGS} tags.`),
}

/** A member's suggestion. Lands unapproved. */
export const suggestResourceSchema = z.object(resourceFields)
export type SuggestResourceInput = z.infer<typeof suggestResourceSchema>

/** Officer create or edit. */
export const saveResourceSchema = z.object({
  id: z.string().min(1).optional(),
  ...resourceFields,
  approved: z.boolean(),
})
export type SaveResourceInput = z.infer<typeof saveResourceSchema>

export const resourceIdSchema = z.object({ id: z.string().min(1) })

export const approveResourceSchema = z.object({
  id: z.string().min(1),
  approved: z.boolean(),
})

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

/** "https://www.freecodecamp.org/learn" -> "freecodecamp.org" */
export function resourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** "Python, web,  python ,," -> ["python", "web"] */
export function parseTags(input: string): string[] {
  const seen = new Set<string>()
  for (const raw of input.split(',')) {
    const t = raw.trim().toLowerCase()
    if (t) seen.add(t)
  }
  return [...seen]
}

/** Search across title, description, domain, and tags. Case-insensitive. */
export function matchesQuery(
  r: { title: string; description: string; url: string; tags: string[] },
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [r.title, r.description, resourceDomain(r.url), ...r.tags].some((s) =>
    s.toLowerCase().includes(q),
  )
}
