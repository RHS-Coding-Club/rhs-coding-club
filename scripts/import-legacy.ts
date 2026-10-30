/**
 * Imports the old Firebase site's data (exported by the one-off tool kept
 * outside this repo) into D1, and its images into R2.
 *
 *   bun scripts/import-legacy.ts <export-dir>            local D1 + local R2
 *   bun scripts/import-legacy.ts <export-dir> --remote   the deployed site
 *   bun scripts/import-legacy.ts <export-dir> --dry-run  write the SQL, run nothing
 *
 * <export-dir> holds export.json (Firestore collections, timestamps in ms,
 * plus the Auth user list without password hashes) and files/ (every
 * Firebase Storage image the data referenced).
 *
 * Idempotent and safe to re-run: every imported row has a stable `lg_` id
 * and is inserted only if missing, so nothing is duplicated, overwritten,
 * or deleted (logins members claim and work they add afterwards survive). A legacy member whose email already has an account here (you
 * signed up on the new site first) is merged into that account instead,
 * and only ever gains role. No login accounts are created: imported members
 * claim theirs with "Forgot password" or Google sign-in, which prove they
 * own the email.
 */
import { createHash, randomUUID } from 'node:crypto'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { q } from './seed/util'
import { markdownToDoc } from './legacy/markdown'
import { clubInfoSchema, socialSchema } from '../src/lib/settings'

const DB = 'rhs-coding-club'
const BUCKET = 'rhs-coding-club-files'
const HOUR = 60 * 60 * 1000
const ROLES = ['guest', 'member', 'officer', 'admin'] as const
type Role = (typeof ROLES)[number]
const rank = (r: Role) => ROLES.indexOf(r)
const asRole = (v: unknown): Role =>
  ROLES.includes(v as Role) ? (v as Role) : v === 'Admin' ? 'admin' : 'guest'

/** Throwaway accounts from testing the old site; dropped unless they own content. */
const TEST_EMAILS = new Set(['test@email.com', 'test@gmail.com'])

type Doc = Record<string, any> & { id: string }
interface Export {
  exportedAt: number
  collections: Record<string, Doc[]>
  auth: {
    uid: string
    email: string | null
    emailVerified: boolean
    displayName: string | null
    photoURL: string | null
    providers: string[]
    createdAt: number
  }[]
  files: Record<string, { file: string; type: string; bytes: number }>
}

const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--'))
const remote = args.includes('--remote')
const dryRun = args.includes('--dry-run')
if (!dir) {
  console.error('Usage: bun scripts/import-legacy.ts <export-dir> [--remote] [--dry-run]')
  process.exit(1)
}

const data = JSON.parse(readFileSync(join(dir, 'export.json'), 'utf8')) as Export
const col = (name: string) => data.collections[name] ?? []
const lg = (id: string) => `lg_${id}`
const ms = (v: unknown, fallback: number) => (typeof v === 'number' ? v : fallback)
const json = (v: unknown) => q(JSON.stringify(v))
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

function wrangler(argv: string[], capture = false) {
  const r = spawnSync('bunx', ['wrangler', ...argv], {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  })
  if (r.status !== 0) {
    console.error(`wrangler ${argv.slice(0, 3).join(' ')} failed`)
    process.exit(r.status ?? 1)
  }
  return r.stdout
}

// ---------- Files: Firebase Storage URL -> R2 key ----------

const uploads = new Map<string, { key: string; path: string; type: string }>()
const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

/** R2 key for an old image, `<purpose>/<uuid>.<ext>` with the uuid derived from its bytes. */
function fileKey(url: unknown, purpose: string): string | null {
  if (typeof url !== 'string') return null
  const f = data.files[url] as Export['files'][string] | undefined
  const ext = f && EXT[f.type]
  if (!f || !ext) return null
  const h = createHash('sha256').update(`${purpose}:${f.file}`).digest('hex')
  const uuid = `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`
  const key = `${purpose}/${uuid}.${ext}`
  uploads.set(key, { key, path: join(dir!, 'files', f.file), type: f.type })
  return key
}

// ---------- Users ----------

const existing = new Map<string, { id: string; role: Role }>()
if (!dryRun) {
  const out = wrangler(
    [
      'd1',
      'execute',
      DB,
      remote ? '--remote' : '--local',
      '--json',
      '--command',
      "SELECT id, email, role FROM user WHERE id NOT LIKE 'lg_%'",
    ],
    true,
  )
  const rows = (
    JSON.parse(out) as { results: { id: string; email: string; role: Role }[] }[]
  )[0].results
  for (const r of rows) existing.set(r.email.toLowerCase(), { id: r.id, role: r.role })
}

const profiles = new Map(col('users').map((u) => [u.id, u]))
const authById = new Map(data.auth.map((a) => [a.uid, a]))
const uids = new Set([...profiles.keys(), ...authById.keys()])

/** uids that own something, so test accounts with content are kept. */
const owners = new Set<string>([
  ...col('posts').map((p) => p.authorId),
  ...col('projects').map((p) => p.authorId),
  ...col('submissions').map((s) => s.userId),
  ...col('challenges').map((c) => c.createdBy),
])

interface Person {
  uid: string
  email: string
  name: string
  role: Role
  createdAt: number
  photo: string | null
  verified: boolean
}
const people: Person[] = []
for (const uid of uids) {
  const p = profiles.get(uid)
  const a = authById.get(uid)
  const email = (str(p?.email) ?? a?.email ?? '').toLowerCase()
  if (!email) continue
  if (TEST_EMAILS.has(email) && !owners.has(uid)) continue
  people.push({
    uid,
    email,
    name: str(p?.displayName) ?? str(p?.name) ?? a?.displayName ?? email.split('@')[0],
    role: asRole(p?.role ?? 'guest'),
    createdAt: ms(p?.createdAt, a?.createdAt ?? data.exportedAt),
    photo: str(p?.photoURL) ?? a?.photoURL ?? null,
    verified: Boolean(a?.emailVerified || a?.providers.includes('google.com')),
  })
}

// One account per email: the highest role wins, then whoever owns content.
const byEmail = new Map<string, Person[]>()
for (const p of people) byEmail.set(p.email, [...(byEmail.get(p.email) ?? []), p])
/** legacy uid -> user id on the new site */
const userId = new Map<string, string>()
const lines: string[] = ['PRAGMA foreign_keys = ON;']
const roleUpdates: string[] = []
let newUsers = 0
let merged = 0

const githubNames = new Map<string, string>()
for (const r of [...col('membershipApplications'), ...col('githubMembershipRequests')])
  if (str(r.githubUsername)) githubNames.set(r.userId, r.githubUsername.trim())

const userRows: string[] = []
for (const [email, group] of byEmail) {
  group.sort(
    (a, b) =>
      rank(b.role) - rank(a.role) ||
      Number(owners.has(b.uid)) - Number(owners.has(a.uid)) ||
      a.createdAt - b.createdAt,
  )
  const primary = group[0]
  const role = group.reduce<Role>(
    (r, p) => (rank(p.role) > rank(r) ? p.role : r),
    'guest',
  )
  const here = existing.get(email)
  const id = here?.id ?? lg(primary.uid)
  for (const p of group) userId.set(p.uid, id)

  if (here) {
    merged++
    if (rank(role) > rank(here.role))
      roleUpdates.push(`UPDATE user SET role = ${q(role)} WHERE id = ${q(here.id)};`)
    continue
  }
  newUsers++
  const photo = group.map((p) => p.photo).find(Boolean) ?? null
  const avatarKey = photo?.startsWith('https://firebasestorage.')
    ? fileKey(photo, 'avatar')
    : null
  const image = photo && !avatarKey && photo.startsWith('https://') ? photo : null
  const github = group.map((p) => githubNames.get(p.uid)).find(Boolean) ?? null
  userRows.push(
    `INSERT OR IGNORE INTO user (id, name, email, email_verified, image, created_at, updated_at, role, bio, grad_year, skills, avatar_key, github_username, email_prefs) VALUES (${q(id)}, ${q(primary.name)}, ${q(email)}, ${q(group.some((p) => p.verified))}, ${q(image)}, ${primary.createdAt}, ${data.exportedAt}, ${q(role)}, NULL, NULL, '[]', ${q(avatarKey)}, ${q(github)}, '{}');`,
  )
}
const who = (uid: unknown) => (typeof uid === 'string' ? (userId.get(uid) ?? null) : null)

// Insert-if-missing everywhere: a re-run adds anything new and never
// deletes or overwrites, so logins claimed and work done since are safe.
lines.push(...userRows, ...roleUpdates)

// ---------- Content ----------

const skipped: string[] = []
const now = data.exportedAt

for (const c of col('challenges')) {
  const created = ms(c.createdAt, now)
  lines.push(
    `INSERT OR IGNORE INTO challenge (id, title, description, prompt, difficulty, sample_input, sample_output, points, week_no, published_at, announced_at, created_by, legacy_author_email, created_at, updated_at) VALUES (${q(lg(c.id))}, ${q(c.title)}, ${q(c.description ?? '')}, ${json(markdownToDoc(c.prompt ?? ''))}, ${q(['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium')}, ${q(str(c.sampleInput))}, ${q(str(c.sampleOutput))}, ${Number(c.points) || 0}, ${Number(c.weekNo) || 0}, ${c.published ? created : 'NULL'}, ${c.published ? created : 'NULL'}, ${q(who(c.createdBy))}, NULL, ${created}, ${ms(c.updatedAt, created)});`,
  )
}

const challengeIds = new Set(col('challenges').map((c) => c.id))
const LANG: Record<string, string> = {
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
  c: 'C',
  other: 'Other',
}
for (const s of col('submissions')) {
  const uid = who(s.userId)
  if (!uid || !challengeIds.has(s.challengeId)) {
    skipped.push(`submission ${s.id} (missing member or challenge)`)
    continue
  }
  const at = ms(s.submittedAt, now)
  const status = ['pass', 'fail', 'pending'].includes(s.status) ? s.status : 'pending'
  lines.push(
    `INSERT OR IGNORE INTO submission (id, challenge_id, user_id, language, platform, url, code, status, feedback, reviewed_by, reviewed_at, submitted_at, created_at, updated_at) VALUES (${q(lg(s.id))}, ${q(lg(s.challengeId))}, ${q(uid)}, ${q(LANG[String(s.language).toLowerCase()] ?? 'Other')}, 'Other', '', ${q(str(s.code)?.slice(0, 20_000) ?? null)}, ${q(status)}, ${q(str(s.feedback))}, ${q(who(s.reviewedBy))}, ${s.reviewedAt ?? 'NULL'}, ${at}, ${at}, ${ms(s.reviewedAt, at)});`,
  )
  if (status === 'pass' && Number(s.points) > 0)
    lines.push(
      `INSERT OR IGNORE INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) VALUES (${q(lg(`pe_${s.id}`))}, ${q(uid)}, ${Number(s.points)}, 'submission', ${q(lg(s.id))}, NULL, ${q(who(s.reviewedBy))}, ${ms(s.reviewedAt, at)});`,
    )
}

// Old totals: whatever passed submissions don't explain becomes one entry.
const itemized = new Map<string, number>()
for (const s of col('submissions'))
  if (s.status === 'pass' && who(s.userId))
    itemized.set(
      who(s.userId)!,
      (itemized.get(who(s.userId)!) ?? 0) + (Number(s.points) || 0),
    )
const totals = new Map<string, number>()
for (const u of col('users')) {
  const id = who(u.id)
  if (id) totals.set(id, (totals.get(id) ?? 0) + (Number(u.points) || 0))
}
for (const [id, total] of totals) {
  const rest = total - (itemized.get(id) ?? 0)
  if (rest !== 0)
    lines.push(
      `INSERT OR IGNORE INTO point_entry (id, user_id, delta, source, source_id, note, created_by, created_at) VALUES (${q(lg(`pe_old_${id}`))}, ${q(id)}, ${rest}, 'manual', NULL, 'Points from the old site', NULL, ${now});`,
    )
}

const eventIds = new Set(col('events').map((e) => e.id))
for (const e of col('events')) {
  const start = ms(e.date, now)
  lines.push(
    `INSERT OR IGNORE INTO event (id, title, description, starts_at, ends_at, location, tags, cover_key, check_in_code, check_in_open, reminder_sent_at, created_by, created_at, updated_at) VALUES (${q(lg(e.id))}, ${q(e.title)}, ${q(e.description ?? '')}, ${start}, ${start + HOUR}, ${q(str(e.location) ?? "Mr. Derrick's classroom")}, ${json(e.tags ?? [])}, NULL, NULL, 0, ${start}, ${q(who(e.createdBy))}, ${start}, ${start});`,
  )
}
for (const r of col('rsvps')) {
  const uid = who(r.userId)
  if (!uid || !eventIds.has(r.eventId)) continue
  const status = String(r.status).toLowerCase()
  lines.push(
    `INSERT OR IGNORE INTO rsvp (id, event_id, user_id, status, created_at, updated_at) VALUES (${q(lg(r.id))}, ${q(lg(r.eventId))}, ${q(uid)}, ${q(['yes', 'no', 'maybe'].includes(status) ? status : 'yes')}, ${now}, ${now});`,
  )
}

const byName = new Map(people.map((p) => [p.name.toLowerCase(), p.uid]))
for (const p of col('posts')) {
  const author = who(p.authorId) ?? who(byName.get(String(p.author).toLowerCase()))
  const created = ms(p.createdAt, now)
  lines.push(
    `INSERT OR IGNORE INTO post (id, title, slug, summary, content, tags, author_id, legacy_author_email, published_at, created_at, updated_at) VALUES (${q(lg(p.id))}, ${q(p.title)}, ${q(p.slug)}, ${q(p.summary ?? '')}, ${json(markdownToDoc(p.content ?? ''))}, ${json(p.tags ?? [])}, ${q(author)}, NULL, ${p.published ? created : 'NULL'}, ${created}, ${ms(p.updatedAt, created)});`,
  )
}

for (const p of col('projects')) {
  const author = who(p.authorId)
  if (!author) {
    skipped.push(`project ${p.title} (missing author)`)
    continue
  }
  const created = ms(p.createdAt, now)
  const images = (p.images ?? [])
    .map((u: string) => fileKey(u, 'project'))
    .filter(Boolean)
  lines.push(
    `INSERT OR IGNORE INTO project (id, title, description, tech, repo_url, demo_url, image_keys, author_id, status, rejection_reason, featured, year, reviewed_by, reviewed_at, created_at, updated_at) VALUES (${q(lg(p.id))}, ${q(p.title)}, ${q(p.description ?? '')}, ${json(p.tech ?? [])}, ${q(str(p.repoUrl))}, ${q(str(p.demoUrl))}, ${json(images)}, ${q(author)}, ${q(p.approved ? 'approved' : 'pending')}, NULL, ${q(Boolean(p.featured))}, ${Number(p.year) || 'NULL'}, NULL, ${p.approved ? created : 'NULL'}, ${created}, ${ms(p.updatedAt, created)});`,
    `INSERT OR IGNORE INTO project_member (id, project_id, user_id, created_at) VALUES (${q(lg(`pm_${p.id}`))}, ${q(lg(p.id))}, ${q(author)}, ${created});`,
  )
}

const resourceIds = new Set<string>()
for (const r of col('resources')) {
  if (!str(r.url)) continue
  resourceIds.add(r.id)
  const created = ms(r.createdAt, now)
  lines.push(
    `INSERT OR IGNORE INTO resource (id, title, description, url, tags, level, approved, added_by, created_at, updated_at) VALUES (${q(lg(r.id))}, ${q(r.title)}, ${q(r.description ?? '')}, ${q(r.url)}, ${json(r.tags ?? [])}, ${q(['beginner', 'intermediate', 'advanced'].includes(r.level) ? r.level : 'beginner')}, 1, ${q(who(r.addedBy))}, ${created}, ${ms(r.updatedAt, created)});`,
  )
}
for (const b of col('bookmarks')) {
  const uid = who(b.userId)
  if (!uid || !resourceIds.has(b.resourceId)) continue
  lines.push(
    `INSERT OR IGNORE INTO resource_bookmark (id, user_id, resource_id, created_at) VALUES (${q(lg(`bm_${b.userId}_${b.id}`))}, ${q(uid)}, ${q(lg(b.resourceId))}, ${ms(b.createdAt, now)});`,
  )
}

for (const o of col('officers')) {
  lines.push(
    `INSERT OR IGNORE INTO officer (id, name, title, bio, email, github_url, image_key, sort_order, is_active, created_at, updated_at) VALUES (${q(lg(o.id))}, ${q(o.name)}, ${q(o.role ?? 'Officer')}, ${q(o.bio ?? '')}, ${q(str(o.email))}, ${q(str(o.githubUrl))}, ${q(fileKey(o.imageUrl, 'officer'))}, ${Number(o.order) || 0}, ${q(o.isActive !== false)}, ${ms(o.createdAt, now)}, ${ms(o.updatedAt, now)});`,
  )
}

const badgeIds = new Set<string>()
for (const b of col('badges')) {
  badgeIds.add(b.id)
  const criteria = ['points', 'challenges', 'events', 'projects'].includes(
    b.criteria?.type,
  )
    ? b.criteria.type
    : 'custom'
  lines.push(
    `INSERT OR IGNORE INTO badge (id, name, description, image_key, rarity, criteria_type, threshold, auto_award, sort_order, is_active, created_at, updated_at) VALUES (${q(lg(b.id))}, ${q(b.name)}, ${q(b.description ?? '')}, ${q(fileKey(b.imageUrl, 'badge'))}, ${q(['common', 'rare', 'epic', 'legendary'].includes(b.rarity) ? b.rarity : 'common')}, ${q(criteria)}, ${Number(b.criteria?.threshold) || 'NULL'}, ${q(criteria !== 'custom' && Boolean(b.autoAward))}, ${Number(b.displayOrder) || 0}, ${q(b.isActive !== false)}, ${ms(b.createdAt, now)}, ${ms(b.updatedAt, now)});`,
  )
}
for (const ub of col('user-badges')) {
  const uid = who(ub.userId)
  if (!uid || !badgeIds.has(ub.badgeId)) continue
  lines.push(
    `INSERT OR IGNORE INTO user_badge (id, user_id, badge_id, awarded_by, awarded_at) VALUES (${q(lg(ub.id))}, ${q(uid)}, ${q(lg(ub.badgeId))}, ${q(who(ub.awardedBy))}, ${ms(ub.awardedAt, now)});`,
  )
}

for (const a of col('membershipApplications')) {
  const uid = who(a.userId)
  if (!uid) continue
  const at = ms(a.submittedAt, now)
  const status = ['pending', 'approved', 'rejected'].includes(a.status)
    ? a.status
    : 'pending'
  lines.push(
    `INSERT OR IGNORE INTO membership_application (id, user_id, grade, experience, languages, interests, goals, why_join, availability, github_username, status, review_note, reviewed_by, reviewed_at, created_at, updated_at) VALUES (${q(lg(a.id))}, ${q(uid)}, ${q(String(a.grade ?? ''))}, ${q(String(a.experience ?? ''))}, ${json(a.programmingLanguages ?? [])}, ${json(a.interests ?? [])}, ${q(a.goals ?? '')}, ${q(a.whyJoin ?? '')}, ${q(a.availability ?? '')}, ${q(str(a.githubUsername))}, ${q(status)}, NULL, NULL, ${a.approvedAt ?? 'NULL'}, ${at}, ${ms(a.approvedAt, at)});`,
  )
}

for (const g of col('githubMembershipRequests')) {
  const uid = who(g.userId)
  if (!uid || !str(g.githubUsername)) continue
  const at = ms(g.createdAt, now)
  lines.push(
    `INSERT OR IGNORE INTO github_membership_request (id, user_id, github_username, github_id, note, status, admin_note, reviewed_by, reviewed_at, invite_sent_at, invite_error, joined_at, created_at, updated_at) VALUES (${q(lg(g.id))}, ${q(uid)}, ${q(g.githubUsername)}, ${Number(g.githubId) || 'NULL'}, ${q(str(g.note))}, ${q(g.status)}, ${q(str(g.adminNotes))}, ${q(who(g.reviewedBy))}, ${g.reviewedAt ?? 'NULL'}, ${g.inviteSentAt ?? 'NULL'}, NULL, ${g.joinedAt ?? 'NULL'}, ${at}, ${ms(g.updatedAt, at)});`,
  )
}

// Old messages were already handled on the old site, so they arrive read.
for (const m of col('contacts')) {
  lines.push(
    `INSERT OR IGNORE INTO contact_message (id, name, email, subject, message, read_at, created_at) VALUES (${q(lg(m.id))}, ${q(m.name ?? 'Unknown')}, ${q(m.email ?? '')}, ${q(str(m.subject) ?? 'Message from the old site')}, ${q(m.message ?? '')}, ${now}, ${ms(m.submittedAt, now)});`,
  )
}

for (const s of col('newsletterSubscribers')) {
  const email = str(s.email)?.toLowerCase()
  if (!email) continue
  lines.push(
    `INSERT OR IGNORE INTO newsletter_subscriber (id, email, unsubscribe_token, subscribed_at, unsubscribed_at) VALUES (${q(lg(s.id))}, ${q(email)}, ${q(randomUUID())}, ${ms(s.subscribedAt, now)}, NULL);`,
  )
}

// ---------- Settings: the old site's club info and social links ----------

// Replace missing rows and the sample seed's defaults, never a group an admin
// has since saved on the new site.
const KEEP_EDITED = "setting.updated_by IS NULL OR setting.updated_by = 'u_admin'"

const settings = new Map(col('settings').map((s) => [s.id, s]))
const oldInfo = settings.get('club-info')
if (oldInfo) {
  const parsed = clubInfoSchema.safeParse(
    Object.fromEntries(
      [
        'clubName',
        'tagline',
        'description',
        'missionStatement',
        'contactEmail',
        'meetingLocation',
        'meetingSchedule',
      ]
        .map((k) => [k, str(oldInfo[k])])
        .filter(([, v]) => v),
    ),
  )
  if (parsed.success)
    lines.push(
      `INSERT INTO setting (key, value, updated_by, updated_at) VALUES ('club-info', ${json(parsed.data)}, NULL, ${now}) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at WHERE ${KEEP_EDITED};`,
    )
  else skipped.push(`club-info settings (${parsed.error.issues[0]?.message})`)
}
const oldSocial = settings.get('social-media')
if (oldSocial) {
  const links = [
    ...(oldSocial.customLinks ?? []),
    ...(['twitter', 'linkedin'] as const)
      .filter((k) => str(oldSocial[k]))
      .map((k) => ({
        label: k === 'twitter' ? 'X (Twitter)' : 'LinkedIn',
        url: oldSocial[k],
      })),
  ]
  const parsed = socialSchema.safeParse({
    instagram: str(oldSocial.instagram) ?? '',
    github: str(oldSocial.github) ?? '',
    discord: str(oldSocial.discord) ?? '',
    youtube: str(oldSocial.youtube) ?? '',
    customLinks: links.slice(0, 6),
  })
  if (parsed.success)
    lines.push(
      `INSERT INTO setting (key, value, updated_by, updated_at) VALUES ('social', ${json(parsed.data)}, NULL, ${now}) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at WHERE ${KEEP_EDITED};`,
    )
  else skipped.push(`social settings (${parsed.error.issues[0]?.message})`)
}

// ---------- Run ----------

const sqlFile = join(mkdtempSync(join(tmpdir(), 'rhs-legacy-')), 'import.sql')
writeFileSync(sqlFile, lines.join('\n'))

const summary = {
  members: `${newUsers} new, ${merged} merged into existing accounts`,
  challenges: col('challenges').length,
  submissions: col('submissions').length,
  events: col('events').length,
  posts: col('posts').length,
  projects: col('projects').length,
  resources: resourceIds.size,
  officers: col('officers').length,
  images: uploads.size,
}

if (dryRun) {
  console.log('Dry run. SQL written to', sqlFile, summary)
  process.exit(0)
}

for (const u of uploads.values()) {
  wrangler([
    'r2',
    'object',
    'put',
    `${BUCKET}/${u.key}`,
    remote ? '--remote' : '--local',
    '--file',
    u.path,
    '--content-type',
    u.type,
    '--cache-control',
    'public, max-age=31536000, immutable',
  ])
}
wrangler(['d1', 'execute', DB, remote ? '--remote' : '--local', '--file', sqlFile])

console.log(
  `Imported the old site into the ${remote ? 'deployed' : 'local'} database:`,
  summary,
)
if (skipped.length) console.log('Skipped:', skipped)
