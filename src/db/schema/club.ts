import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { user } from './auth'
import { id, timestamps, jsonStringArray } from './helpers'

// ---------- Membership ----------

export const APPLICATION_STATUSES = ['pending', 'approved', 'rejected'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const membershipApplication = sqliteTable(
  'membership_application',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    grade: text('grade').notNull(),
    experience: text('experience').notNull(),
    languages: jsonStringArray('languages'),
    interests: jsonStringArray('interests'),
    goals: text('goals').notNull(),
    whyJoin: text('why_join').notNull(),
    availability: text('availability').notNull(),
    githubUsername: text('github_username'),
    status: text('status', { enum: APPLICATION_STATUSES }).default('pending').notNull(),
    reviewNote: text('review_note'),
    reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (t) => [index('membership_application_user_idx').on(t.userId, t.createdAt)],
)

export const officer = sqliteTable('officer', {
  id: id(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  bio: text('bio').notNull(),
  email: text('email'),
  githubUrl: text('github_url'),
  imageKey: text('image_key'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  ...timestamps,
})

// ---------- Challenges, submissions, points ----------

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const challenge = sqliteTable(
  'challenge',
  {
    id: id(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    prompt: text('prompt').notNull(),
    difficulty: text('difficulty', { enum: DIFFICULTIES }).notNull(),
    sampleInput: text('sample_input'),
    sampleOutput: text('sample_output'),
    points: integer('points').notNull(),
    weekNo: integer('week_no').notNull(),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    legacyAuthorEmail: text('legacy_author_email'),
    ...timestamps,
  },
  (t) => [index('challenge_published_idx').on(t.publishedAt, t.weekNo)],
)

export const SUBMISSION_STATUSES = ['pending', 'pass', 'fail'] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export const submission = sqliteTable(
  'submission',
  {
    id: id(),
    challengeId: text('challenge_id')
      .notNull()
      .references(() => challenge.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    language: text('language').notNull(),
    platform: text('platform').notNull(),
    url: text('url').notNull(),
    code: text('code'),
    status: text('status', { enum: SUBMISSION_STATUSES }).default('pending').notNull(),
    feedback: text('feedback'),
    reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp_ms' }),
    submittedAt: integer('submitted_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('submission_challenge_user_uidx').on(t.challengeId, t.userId),
    index('submission_status_idx').on(t.status, t.submittedAt),
  ],
)

export const POINT_SOURCES = ['submission', 'project', 'attendance', 'manual'] as const
export type PointSource = (typeof POINT_SOURCES)[number]

/** Append-only ledger. A user's score is the sum of their deltas. */
export const pointEntry = sqliteTable(
  'point_entry',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    delta: integer('delta').notNull(),
    source: text('source', { enum: POINT_SOURCES }).notNull(),
    sourceId: text('source_id'),
    note: text('note'),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('point_entry_user_idx').on(t.userId, t.createdAt),
    index('point_entry_source_idx').on(t.source, t.sourceId),
  ],
)

// ---------- Events ----------

export const event = sqliteTable(
  'event',
  {
    id: id(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
    endsAt: integer('ends_at', { mode: 'timestamp_ms' }).notNull(),
    location: text('location').notNull(),
    tags: jsonStringArray('tags'),
    coverKey: text('cover_key'),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [index('event_starts_idx').on(t.startsAt)],
)

export const RSVP_STATUSES = ['yes', 'no', 'maybe'] as const
export type RsvpStatus = (typeof RSVP_STATUSES)[number]

export const rsvp = sqliteTable(
  'rsvp',
  {
    id: id(),
    eventId: text('event_id')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: text('status', { enum: RSVP_STATUSES }).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex('rsvp_event_user_uidx').on(t.eventId, t.userId)],
)

export const attendance = sqliteTable(
  'attendance',
  {
    id: id(),
    eventId: text('event_id')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    markedBy: text('marked_by').references(() => user.id, { onDelete: 'set null' }),
    markedAt: integer('marked_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex('attendance_event_user_uidx').on(t.eventId, t.userId)],
)

// ---------- Projects ----------

export const PROJECT_STATUSES = ['pending', 'approved', 'rejected'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const project = sqliteTable(
  'project',
  {
    id: id(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    tech: jsonStringArray('tech'),
    repoUrl: text('repo_url'),
    demoUrl: text('demo_url'),
    imageKeys: jsonStringArray('image_keys'),
    authorId: text('author_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: text('status', { enum: PROJECT_STATUSES }).default('pending').notNull(),
    rejectionReason: text('rejection_reason'),
    featured: integer('featured', { mode: 'boolean' }).default(false).notNull(),
    year: integer('year'),
    reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (t) => [
    index('project_status_idx').on(t.status, t.featured, t.createdAt),
    index('project_author_idx').on(t.authorId),
  ],
)

// ---------- Blog ----------

export const post = sqliteTable(
  'post',
  {
    id: id(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    summary: text('summary').notNull(),
    content: text('content').notNull(),
    tags: jsonStringArray('tags'),
    authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
    legacyAuthorEmail: text('legacy_author_email'),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (t) => [index('post_published_idx').on(t.publishedAt)],
)

// ---------- Resources ----------

export const RESOURCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type ResourceLevel = (typeof RESOURCE_LEVELS)[number]

export const resource = sqliteTable(
  'resource',
  {
    id: id(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    url: text('url').notNull(),
    tags: jsonStringArray('tags'),
    level: text('level', { enum: RESOURCE_LEVELS }).notNull(),
    approved: integer('approved', { mode: 'boolean' }).default(false).notNull(),
    addedBy: text('added_by').references(() => user.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [index('resource_approved_idx').on(t.approved, t.level)],
)

export const resourceBookmark = sqliteTable(
  'resource_bookmark',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    resourceId: text('resource_id')
      .notNull()
      .references(() => resource.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex('resource_bookmark_uidx').on(t.userId, t.resourceId)],
)

// ---------- Badges ----------

export const BADGE_RARITIES = ['common', 'rare', 'epic', 'legendary'] as const
export type BadgeRarity = (typeof BADGE_RARITIES)[number]

export const BADGE_CRITERIA = [
  'points',
  'challenges',
  'events',
  'projects',
  'custom',
] as const
export type BadgeCriteria = (typeof BADGE_CRITERIA)[number]

export const badge = sqliteTable('badge', {
  id: id(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageKey: text('image_key'),
  rarity: text('rarity', { enum: BADGE_RARITIES }).notNull(),
  criteriaType: text('criteria_type', { enum: BADGE_CRITERIA }).notNull(),
  threshold: integer('threshold'),
  autoAward: integer('auto_award', { mode: 'boolean' }).default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  ...timestamps,
})

export const userBadge = sqliteTable(
  'user_badge',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    badgeId: text('badge_id')
      .notNull()
      .references(() => badge.id, { onDelete: 'cascade' }),
    /** null means awarded automatically by the badge engine */
    awardedBy: text('awarded_by').references(() => user.id, { onDelete: 'set null' }),
    awardedAt: integer('awarded_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('user_badge_uidx').on(t.userId, t.badgeId),
    index('user_badge_awarded_idx').on(t.awardedAt),
  ],
)

// ---------- GitHub org membership ----------

export const GITHUB_REQUEST_STATUSES = [
  'pending',
  'approved',
  'denied',
  'invite-sent',
  'already-member',
  'already-invited',
  'joined',
] as const
export type GithubRequestStatus = (typeof GITHUB_REQUEST_STATUSES)[number]

export const githubMembershipRequest = sqliteTable(
  'github_membership_request',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    githubUsername: text('github_username').notNull(),
    githubId: integer('github_id'),
    note: text('note'),
    status: text('status', { enum: GITHUB_REQUEST_STATUSES })
      .default('pending')
      .notNull(),
    adminNote: text('admin_note'),
    reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp_ms' }),
    inviteSentAt: integer('invite_sent_at', { mode: 'timestamp_ms' }),
    inviteError: text('invite_error'),
    joinedAt: integer('joined_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (t) => [index('github_request_user_idx').on(t.userId, t.status)],
)

// ---------- Newsletter and contact ----------

export const newsletterSubscriber = sqliteTable('newsletter_subscriber', {
  id: id(),
  email: text('email').notNull().unique(),
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  subscribedAt: integer('subscribed_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  unsubscribedAt: integer('unsubscribed_at', { mode: 'timestamp_ms' }),
})

export const contactMessage = sqliteTable('contact_message', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  readAt: integer('read_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// ---------- Settings ----------

/** One row per settings group; `value` is validated by the group's Zod schema. */
export const setting = sqliteTable('setting', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<unknown>().notNull(),
  updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})
