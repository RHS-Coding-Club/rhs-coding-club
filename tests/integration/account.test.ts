import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { profileSchema } from '#/lib/schemas/account'
import { recipientById, recipientsFor } from '#/services/email'
import { getSetting, setSetting } from '#/services/settings'
import { getAccount, updateEmailPrefs, updateProfile } from '#/services/members'

const db = getDb()

beforeAll(async () => {
  await db.insert(schema.user).values([
    {
      id: 'm1',
      name: 'Max',
      email: 'max@test.local',
      role: 'member',
      emailPrefs: { newsletter: false },
    },
    { id: 'm2', name: 'Bo', email: 'bo@test.local', role: 'member' },
  ])
})

describe('updateProfile', () => {
  it('saves cleaned profile fields', async () => {
    const input = profileSchema.parse({
      name: '  Max Member ',
      bio: 'I like trees.',
      gradYear: 2028,
      skills: ['Python', ' python ', 'React'],
      githubUsername: 'https://github.com/maxm',
      avatarKey: 'avatars/abc.png',
    })
    await updateProfile(db, 'm1', input)
    const { user } = await getAccount(db, 'm1')
    expect(user).toMatchObject({
      name: 'Max Member',
      bio: 'I like trees.',
      gradYear: 2028,
      skills: ['Python', 'React'],
      githubUsername: 'maxm',
      avatarKey: 'avatars/abc.png',
    })
  })

  it('rejects bad GitHub usernames and too many skills', () => {
    const base = { name: 'X', bio: '', gradYear: null, skills: [], avatarKey: null }
    expect(
      profileSchema.safeParse({ ...base, githubUsername: 'bad name!' }).success,
    ).toBe(false)
    expect(
      profileSchema.safeParse({
        ...base,
        githubUsername: '',
        skills: Array.from({ length: 11 }, (_, i) => `s${i}`),
      }).success,
    ).toBe(false)
    expect(
      profileSchema.safeParse({ ...base, githubUsername: '' }).data?.githubUsername,
    ).toBe(null)
  })
})

describe('email preferences', () => {
  it('persists opt-outs and keeps the newsletter flag', async () => {
    await setSetting(
      db,
      'email',
      {
        ...(await getSetting(db, 'email')),
        notifications: {
          newChallenge: true,
          eventReminder: true,
          weeklyDigest: true,
          projectDecision: true,
          applicationDecision: true,
        },
      },
      'm1',
    )
    const stored = await updateEmailPrefs(db, 'm1', {
      newChallenge: true,
      eventReminder: false,
      weeklyDigest: false,
      projectDecision: true,
      applicationDecision: true,
    })
    expect(stored).toEqual({
      newsletter: false,
      eventReminder: false,
      weeklyDigest: false,
    })
    const { user } = await getAccount(db, 'm1')
    expect(user.emailPrefs).toEqual(stored)

    // The email service honors them.
    expect((await recipientsFor(db, 'weeklyDigest')).map((u) => u.id)).toEqual(['m2'])
    expect(await recipientById(db, 'm1', 'eventReminder')).toBeNull()
    expect((await recipientById(db, 'm1', 'newChallenge'))?.id).toBe('m1')

    // Turning everything back on clears the opt-outs.
    const back = await updateEmailPrefs(db, 'm1', {
      newChallenge: true,
      eventReminder: true,
      weeklyDigest: true,
      projectDecision: true,
      applicationDecision: true,
    })
    expect(back).toEqual({ newsletter: false })
  })

  it('lists linked sign-in accounts', async () => {
    await db.insert(schema.account).values({
      id: 'acc1',
      accountId: 'm2',
      providerId: 'credential',
      userId: 'm2',
    })
    const { accounts } = await getAccount(db, 'm2')
    expect(accounts.map((a) => a.providerId)).toEqual(['credential'])
  })
})
