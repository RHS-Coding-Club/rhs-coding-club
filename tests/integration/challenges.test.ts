import { beforeAll, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import {
  announceChallenges,
  deleteChallenge,
  getChallengeForViewer,
  listChallengesForAdmin,
  listLiveChallenges,
  listSubmissionsForReview,
  reviewSubmission,
  saveChallenge,
  setChallengePublished,
  submitSolution,
} from '#/services/challenges'
import { pointsFor } from '#/services/points'

const db = getDb()
const now = new Date(Date.UTC(2026, 9, 29, 19, 0)) // Thu Oct 29, 12:00 PDT
const day = 24 * 60 * 60 * 1000
const at = (offsetDays: number) => new Date(now.getTime() + offsetDays * day)
const prompt = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Solve it.' }] }],
})

const base = {
  description: 'A one-line summary.',
  prompt,
  sampleInput: null,
  sampleOutput: null,
}

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'off', name: 'Olive Officer', email: 'off@test.local', role: 'officer' },
    { id: 'm1', name: 'Max Member', email: 'm1@test.local', role: 'member' },
    { id: 'm2', name: 'Priya N', email: 'm2@test.local', role: 'member' },
    { id: 'g1', name: 'Gus Guest', email: 'g1@test.local', role: 'guest' },
  ])
  await db.insert(schema.badge).values({
    id: 'first',
    name: 'First Blood',
    description: 'Passed your first challenge.',
    rarity: 'common',
    criteriaType: 'challenges',
    threshold: 1,
    autoAward: true,
  })
  await db.insert(schema.challenge).values([
    {
      ...base,
      id: 'live1',
      title: 'Old one',
      difficulty: 'easy',
      points: 50,
      weekNo: 1,
      publishedAt: at(-14),
      announcedAt: at(-14),
    },
    {
      ...base,
      id: 'live2',
      title: 'This week',
      difficulty: 'medium',
      points: 100,
      weekNo: 2,
      publishedAt: at(-1),
    },
    {
      ...base,
      id: 'sched',
      title: 'Next week',
      difficulty: 'hard',
      points: 200,
      weekNo: 3,
      publishedAt: at(5),
    },
    {
      ...base,
      id: 'draft',
      title: 'Unfinished',
      difficulty: 'easy',
      points: 50,
      weekNo: 4,
      publishedAt: null,
    },
  ])
})

describe('listing', () => {
  it('shows only live challenges to the public, newest week first', async () => {
    const { challenges, featured } = await listLiveChallenges(db, now)
    expect(challenges.map((c) => c.id)).toEqual(['live2', 'live1'])
    expect(featured?.id).toBe('live2')
  })

  it('hides drafts and scheduled challenges from members and guests', async () => {
    for (const viewer of [
      null,
      { id: 'm1', role: 'member' as const },
      { id: 'g1', role: 'guest' as const },
    ]) {
      expect(await getChallengeForViewer(db, 'draft', viewer, now)).toBeNull()
      expect(await getChallengeForViewer(db, 'sched', viewer, now)).toBeNull()
    }
    expect(await getChallengeForViewer(db, 'missing', null, now)).toBeNull()
  })

  it('lets officers preview drafts and scheduled challenges', async () => {
    const officer = { id: 'off', role: 'officer' as const }
    const draft = await getChallengeForViewer(db, 'draft', officer, now)
    expect(draft).toMatchObject({ state: 'draft', preview: true })
    const sched = await getChallengeForViewer(db, 'sched', officer, now)
    expect(sched).toMatchObject({ state: 'scheduled', preview: true })
    const live = await getChallengeForViewer(db, 'live2', null, now)
    expect(live).toMatchObject({ state: 'live', preview: false, solves: 0, mine: null })
  })

  it('lists everything for officers with the next week number', async () => {
    const { challenges, nextWeekNo, points } = await listChallengesForAdmin(db)
    expect(challenges).toHaveLength(4)
    expect(nextWeekNo).toBe(5)
    expect(points).toEqual({ easy: 50, medium: 100, hard: 200 })
  })
})

describe('submitting', () => {
  const input = {
    challengeId: 'live2',
    language: 'Python' as const,
    platform: 'GitHub' as const,
    url: 'https://github.com/max/week2',
  }

  it('rejects drafts and scheduled challenges', async () => {
    await expect(
      submitSolution(db, 'm1', { ...input, challengeId: 'draft' }, now),
    ).rejects.toThrow(/not open/)
    await expect(
      submitSolution(db, 'm1', { ...input, challengeId: 'sched' }, now),
    ).rejects.toThrow(/not open/)
  })

  it('creates one row per member and updates it on resubmit', async () => {
    const first = await submitSolution(db, 'm1', input, now)
    expect(first).toMatchObject({ status: 'pending', resubmitted: false })
    const again = await submitSolution(
      db,
      'm1',
      { ...input, url: 'https://github.com/max/week2-v2', code: 'print(1)' },
      new Date(now.getTime() + 1000),
    )
    expect(again).toMatchObject({ id: first.id, status: 'pending', resubmitted: true })
    const rows = await db
      .select()
      .from(schema.submission)
      .where(
        and(
          eq(schema.submission.challengeId, 'live2'),
          eq(schema.submission.userId, 'm1'),
        ),
      )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      url: 'https://github.com/max/week2-v2',
      code: 'print(1)',
    })
  })

  it('resets a failed submission to pending and clears the feedback', async () => {
    const sub = await submitSolution(db, 'm2', input, now)
    await reviewSubmission(
      db,
      { id: sub.id, status: 'fail', feedback: 'Off by one.', reviewerId: 'off' },
      now,
    )
    await submitSolution(
      db,
      'm2',
      { ...input, url: 'https://github.com/priya/fixed' },
      now,
    )
    const row = await db.query.submission.findFirst({
      where: eq(schema.submission.id, sub.id),
    })
    expect(row).toMatchObject({
      status: 'pending',
      feedback: null,
      reviewedBy: null,
      reviewedAt: null,
    })
  })

  it('locks a passed submission', async () => {
    const sub = await submitSolution(db, 'm2', { ...input, challengeId: 'live1' }, now)
    await reviewSubmission(db, { id: sub.id, status: 'pass', reviewerId: 'off' }, now)
    await expect(
      submitSolution(
        db,
        'm2',
        { ...input, challengeId: 'live1', url: 'https://x.dev/new' },
        now,
      ),
    ).rejects.toThrow(/already passed/)
    const row = await db.query.submission.findFirst({
      where: eq(schema.submission.id, sub.id),
    })
    expect(row?.status).toBe('pass')
  })
})

describe('reviewing', () => {
  it('settles points on pass, reverses on fail, and awards badges once', async () => {
    const sub = await submitSolution(
      db,
      'm1',
      {
        challengeId: 'live1',
        language: 'Go',
        platform: 'Replit',
        url: 'https://replit.com/@max/w1',
      },
      now,
    )
    const before = await pointsFor(db, 'm1')

    const pass = await reviewSubmission(
      db,
      { id: sub.id, status: 'pass', feedback: 'Nice.', reviewerId: 'off' },
      now,
    )
    expect(pass.delta).toBe(50)
    expect(pass.awarded.map((b) => b.id)).toEqual(['first'])
    expect(await pointsFor(db, 'm1')).toBe(before + 50)

    const again = await reviewSubmission(
      db,
      { id: sub.id, status: 'pass', reviewerId: 'off' },
      now,
    )
    expect(again.delta).toBe(0)
    expect(again.awarded).toEqual([])

    const fail = await reviewSubmission(
      db,
      { id: sub.id, status: 'fail', feedback: 'Wait, no.', reviewerId: 'off' },
      now,
    )
    expect(fail.delta).toBe(-50)
    expect(await pointsFor(db, 'm1')).toBe(before)

    const reopened = await reviewSubmission(
      db,
      { id: sub.id, status: 'pending', reviewerId: 'off' },
      now,
    )
    expect(reopened.delta).toBe(0)
    const row = await db.query.submission.findFirst({
      where: eq(schema.submission.id, sub.id),
    })
    expect(row).toMatchObject({ status: 'pending', reviewedBy: null })
  })

  it('does not re-settle past passes when the challenge points change', async () => {
    const before = await pointsFor(db, 'm2') // m2 passed live1 at 50 above
    await db
      .update(schema.challenge)
      .set({ points: 75 })
      .where(eq(schema.challenge.id, 'live1'))
    expect(await pointsFor(db, 'm2')).toBe(before)
  })

  it('orders the review queue pending first', async () => {
    const rows = await listSubmissionsForReview(db)
    const firstNonPending = rows.findIndex((r) => r.status !== 'pending')
    expect(rows.slice(0, firstNonPending).every((r) => r.status === 'pending')).toBe(true)
    expect(rows.slice(firstNonPending).every((r) => r.status !== 'pending')).toBe(true)
    const passed = await listSubmissionsForReview(db, { status: 'pass' })
    expect(passed.every((r) => r.status === 'pass')).toBe(true)
  })
})

describe('authoring', () => {
  it('saves drafts, schedules in club time, and reports going live', async () => {
    const form = {
      title: 'Authored',
      description: 'Written through the form.',
      prompt,
      difficulty: 'medium' as const,
      points: 100,
      weekNo: 9,
      sampleInput: '',
      sampleOutput: '',
    }
    const draft = await saveChallenge(db, { ...form, publishMode: 'draft' }, 'off', now)
    expect(draft).toMatchObject({ state: 'draft', wentLive: false })

    const scheduled = await saveChallenge(
      db,
      { ...form, id: draft.id, publishMode: 'schedule', publishAt: '2026-11-02T07:00' },
      'off',
      now,
    )
    expect(scheduled.state).toBe('scheduled')
    const row = await db.query.challenge.findFirst({
      where: eq(schema.challenge.id, draft.id),
    })
    // Nov 2 is after the DST change: 7:00 PST is 15:00 UTC.
    expect(row?.publishedAt?.toISOString()).toBe('2026-11-02T15:00:00.000Z')
    expect(row?.sampleInput).toBeNull()

    const live = await setChallengePublished(db, draft.id, 'now', now)
    expect(live).toMatchObject({ state: 'live', wentLive: true })
    const stillLive = await setChallengePublished(
      db,
      draft.id,
      'now',
      new Date(now.getTime() + day),
    )
    expect(stillLive.wentLive).toBe(false)
    const kept = await db.query.challenge.findFirst({
      where: eq(schema.challenge.id, draft.id),
    })
    expect(kept?.publishedAt?.getTime()).toBe(now.getTime())

    await setChallengePublished(db, draft.id, 'draft', now)
    const back = await db.query.challenge.findFirst({
      where: eq(schema.challenge.id, draft.id),
    })
    expect(back?.publishedAt).toBeNull()
    await db.delete(schema.challenge).where(eq(schema.challenge.id, draft.id))
  })
})

describe('announceChallenges', () => {
  it('announces each live challenge once, never drafts, scheduled, or stale ones', async () => {
    await db.insert(schema.challenge).values({
      ...base,
      id: 'stale',
      title: 'Ancient',
      difficulty: 'easy',
      points: 50,
      weekNo: 0,
      publishedAt: at(-30),
    })
    const first = await announceChallenges(db, now)
    expect(first.announced).toBe(1) // live2 only
    // m1 and m2 are members; the officer counts too; the guest does not.
    expect(first.emails).toBe(3)
    const row = await db.query.challenge.findFirst({
      where: eq(schema.challenge.id, 'live2'),
    })
    expect(row?.announcedAt?.getTime()).toBe(now.getTime())

    expect(await announceChallenges(db, now)).toEqual({ announced: 0, emails: 0 })

    // The scheduled one goes out once its time comes.
    const later = await announceChallenges(db, at(6))
    expect(later.announced).toBe(1)
    const stale = await db.query.challenge.findFirst({
      where: eq(schema.challenge.id, 'stale'),
    })
    expect(stale?.announcedAt).toBeNull()
  })
})

describe('deleting', () => {
  it('cascades submissions and reverses points from passes', async () => {
    const before = await pointsFor(db, 'm2')
    const res = await deleteChallenge(db, 'live1', 'off')
    expect(res.reversed).toBe(1)
    expect(await pointsFor(db, 'm2')).toBe(before - 50)
    const left = await db
      .select()
      .from(schema.submission)
      .where(eq(schema.submission.challengeId, 'live1'))
    expect(left).toEqual([])
  })
})
