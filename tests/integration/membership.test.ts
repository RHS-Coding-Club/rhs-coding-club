import { beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { applicationSchema, reviewApplicationSchema } from '#/lib/schemas/membership'
import {
  getApplicationDetail,
  getJoinState,
  listApplications,
  reviewApplication,
  submitApplication,
} from '#/services/membership'

const db = getDb()

const answers = applicationSchema.parse({
  grade: '10',
  experience: 'some',
  languages: ['Python', 'Python', 'Not a language'],
  interests: ['Games', 'Teaching at RAP'],
  goals: 'Build a game for the H2O hackathon.',
  whyJoin: 'My friends are in it and I want to teach at RAP.',
  availability: ['Lunch meetings', 'RAP afternoons'],
  githubUsername: '@octo-cat',
})

const roleOf = async (id: string) =>
  (await db.query.user.findFirst({ where: eq(schema.user.id, id) }))?.role

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'off', name: 'Olive Officer', email: 'o@test.local', role: 'officer' },
    { id: 'g1', name: 'Gus Guest', email: 'g1@test.local', role: 'guest' },
    { id: 'g2', name: 'Gia Guest', email: 'g2@test.local', role: 'guest' },
    {
      id: 'g3',
      name: 'Has Handle',
      email: 'g3@test.local',
      role: 'guest',
      githubUsername: 'keepme',
    },
    { id: 'o2', name: 'Already Officer', email: 'o2@test.local', role: 'officer' },
  ])
})

describe('application schema', () => {
  it('cleans the answers', () => {
    expect(answers.languages).toEqual(['Python'])
    expect(answers.githubUsername).toBe('octo-cat')
  })

  it('rejects a reject without a note', () => {
    expect(
      reviewApplicationSchema.safeParse({ id: 'x', decision: 'reject', note: '  ' })
        .success,
    ).toBe(false)
    expect(
      reviewApplicationSchema.safeParse({ id: 'x', decision: 'approve', note: '' })
        .success,
    ).toBe(true)
  })
})

describe('application lifecycle', () => {
  it('signed-out, apply, pending', async () => {
    expect((await getJoinState(db, null)).kind).toBe('signed-out')
    expect((await getJoinState(db, { id: 'g1', role: 'guest' })).kind).toBe('apply')
    await submitApplication(db, { id: 'g1', role: 'guest' }, answers)
    const state = await getJoinState(db, { id: 'g1', role: 'guest' })
    expect(state.kind).toBe('pending')
  })

  it('allows one pending application at a time', async () => {
    await expect(
      submitApplication(db, { id: 'g1', role: 'guest' }, answers),
    ).rejects.toThrow(/already have an application/)
  })

  it('refuses applications from members', async () => {
    await expect(
      submitApplication(db, { id: 'off', role: 'officer' }, answers),
    ).rejects.toThrow(/already a member/)
  })

  it('lists pending first', async () => {
    await submitApplication(db, { id: 'g2', role: 'guest' }, answers)
    const rows = await listApplications(db, { status: 'pending' })
    expect(rows.map((r) => r.userId)).toEqual(['g1', 'g2'])
  })

  it('approve promotes the guest and copies the GitHub username', async () => {
    const [app] = await listApplications(db, { status: 'pending' })
    const r = await reviewApplication(db, {
      id: app.id,
      reviewerId: 'off',
      decision: 'approve',
      note: null,
    })
    expect(r).toEqual({ status: 'approved', promoted: true })
    const u = await db.query.user.findFirst({ where: eq(schema.user.id, 'g1') })
    expect(u?.role).toBe('member')
    expect(u?.githubUsername).toBe('octo-cat')
    expect((await getJoinState(db, { id: 'g1', role: 'member' })).kind).toBe('member')
    const detail = await getApplicationDetail(db, app.id)
    expect(detail?.reviewerName).toBe('Olive Officer')
  })

  it('cannot review the same application twice', async () => {
    const [app] = await listApplications(db, { status: 'approved' })
    await expect(
      reviewApplication(db, {
        id: app.id,
        reviewerId: 'off',
        decision: 'reject',
        note: 'x',
      }),
    ).rejects.toThrow(/already approved/)
  })

  it('reject keeps the guest, stores the note, and allows reapplying', async () => {
    const [app] = await listApplications(db, { status: 'pending' })
    await reviewApplication(db, {
      id: app.id,
      reviewerId: 'off',
      decision: 'reject',
      note: 'Tell us more about what you want to build.',
    })
    expect(await roleOf('g2')).toBe('guest')
    const state = await getJoinState(db, { id: 'g2', role: 'guest' })
    expect(state.kind).toBe('apply')
    if (state.kind === 'apply') expect(state.previous?.reviewNote).toMatch(/Tell us more/)
    await submitApplication(db, { id: 'g2', role: 'guest' }, answers)
    expect((await getJoinState(db, { id: 'g2', role: 'guest' })).kind).toBe('pending')
  })

  it('never demotes an officer and keeps an existing GitHub username', async () => {
    // An officer with a stray pending application (e.g. promoted by hand meanwhile).
    const [row] = await db
      .insert(schema.membershipApplication)
      .values({
        userId: 'o2',
        grade: '12',
        experience: 'advanced',
        goals: 'g',
        whyJoin: 'w',
        availability: 'Lunch meetings',
        githubUsername: 'other',
      })
      .returning()
    const r = await reviewApplication(db, {
      id: row.id,
      reviewerId: 'off',
      decision: 'approve',
      note: null,
    })
    expect(r.promoted).toBe(false)
    expect(await roleOf('o2')).toBe('officer')

    await submitApplication(db, { id: 'g3', role: 'guest' }, answers)
    const pending = await listApplications(db, { status: 'pending' })
    const mine = pending.find((p) => p.userId === 'g3')!
    await reviewApplication(db, {
      id: mine.id,
      reviewerId: 'off',
      decision: 'approve',
      note: null,
    })
    const u = await db.query.user.findFirst({ where: eq(schema.user.id, 'g3') })
    expect(u?.githubUsername).toBe('keepme')
  })
})
