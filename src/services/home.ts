import { and, count, desc, eq, gte, inArray, isNotNull, lt, sql } from 'drizzle-orm'
import type { Db } from '#/db'
import { schema } from '#/db'
import { semesterStart } from '#/lib/dates'
import { getSetting } from './settings'

export async function getHomeData(db: Db, now = new Date()) {
  const [club, nextEvent, memberCount, eventCount, projectCount] = await Promise.all([
    getSetting(db, 'club-info'),
    db.query.event.findFirst({
      where: gte(schema.event.startsAt, now),
      orderBy: schema.event.startsAt,
      columns: { id: true, title: true, startsAt: true, endsAt: true, location: true },
    }),
    db
      .select({ n: count() })
      .from(schema.user)
      .where(inArray(schema.user.role, ['member', 'officer', 'admin'])),
    db
      .select({ n: count() })
      .from(schema.event)
      .where(
        and(
          gte(schema.event.startsAt, semesterStart(now)),
          lt(schema.event.startsAt, now),
        ),
      ),
    db
      .select({ n: count() })
      .from(schema.project)
      .where(eq(schema.project.status, 'approved')),
  ])

  const [featuredProjects, latestPosts, recentAwards] = await Promise.all([
    db
      .select({
        id: schema.project.id,
        title: schema.project.title,
        description: schema.project.description,
        tech: schema.project.tech,
        imageKeys: schema.project.imageKeys,
        authorName: schema.user.name,
      })
      .from(schema.project)
      .innerJoin(schema.user, eq(schema.user.id, schema.project.authorId))
      .where(eq(schema.project.status, 'approved'))
      .orderBy(desc(schema.project.featured), desc(schema.project.createdAt))
      .limit(3),
    db
      .select({
        id: schema.post.id,
        title: schema.post.title,
        slug: schema.post.slug,
        summary: schema.post.summary,
        publishedAt: schema.post.publishedAt,
      })
      .from(schema.post)
      .where(isNotNull(schema.post.publishedAt))
      .orderBy(desc(schema.post.publishedAt))
      .limit(3),
    db
      .select({
        id: schema.userBadge.id,
        awardedAt: schema.userBadge.awardedAt,
        userId: schema.user.id,
        userName: schema.user.name,
        userImage: schema.user.image,
        badgeName: schema.badge.name,
        rarity: schema.badge.rarity,
      })
      .from(schema.userBadge)
      .innerJoin(schema.user, eq(schema.user.id, schema.userBadge.userId))
      .innerJoin(schema.badge, eq(schema.badge.id, schema.userBadge.badgeId))
      .where(eq(schema.badge.isActive, true))
      .orderBy(desc(schema.userBadge.awardedAt))
      .limit(6),
  ])

  return {
    club,
    nextEvent: nextEvent ?? null,
    stats: {
      members: memberCount[0]?.n ?? 0,
      eventsThisSemester: eventCount[0]?.n ?? 0,
      projects: projectCount[0]?.n ?? 0,
    },
    featuredProjects,
    latestPosts,
    recentAwards,
  }
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>

export async function getAboutData(db: Db) {
  const [club, social, officers] = await Promise.all([
    getSetting(db, 'club-info'),
    getSetting(db, 'social'),
    db.query.officer.findMany({
      where: eq(schema.officer.isActive, true),
      orderBy: [schema.officer.sortOrder, schema.officer.name],
      columns: {
        id: true,
        name: true,
        title: true,
        bio: true,
        githubUrl: true,
        imageKey: true,
      },
    }),
  ])
  return { club, social, officers }
}

export type AboutData = Awaited<ReturnType<typeof getAboutData>>

export async function getAdminOverview(db: Db) {
  const [applications, submissions, projects, github, messages] = await Promise.all([
    db
      .select({ n: count() })
      .from(schema.membershipApplication)
      .where(eq(schema.membershipApplication.status, 'pending')),
    db
      .select({ n: count() })
      .from(schema.submission)
      .where(eq(schema.submission.status, 'pending')),
    db
      .select({ n: count() })
      .from(schema.project)
      .where(eq(schema.project.status, 'pending')),
    db
      .select({ n: count() })
      .from(schema.githubMembershipRequest)
      .where(eq(schema.githubMembershipRequest.status, 'pending')),
    db
      .select({ n: count() })
      .from(schema.contactMessage)
      .where(sql`${schema.contactMessage.readAt} IS NULL`),
  ])
  return {
    pendingApplications: applications[0]?.n ?? 0,
    pendingSubmissions: submissions[0]?.n ?? 0,
    pendingProjects: projects[0]?.n ?? 0,
    pendingGithubRequests: github[0]?.n ?? 0,
    unreadMessages: messages[0]?.n ?? 0,
  }
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>
