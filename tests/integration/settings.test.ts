import { beforeAll, describe, expect, it } from 'vitest'
import { getDb, schema } from '#/db'
import { getSetting } from '#/services/settings'
import {
  SettingsPermissionError,
  saveSettingAs,
  settingsOverview,
} from '#/services/settings-admin'

const db = getDb()

beforeAll(async () => {
  await db.insert(schema.user).values([
    { id: 'u_admin', name: 'Ada Admin', email: 'admin@test.local', role: 'admin' },
    { id: 'u_off', name: 'Olive', email: 'olive@test.local', role: 'officer' },
  ])
})

describe('saveSettingAs', () => {
  it('refuses officers and members', async () => {
    const points = await getSetting(db, 'points')
    await expect(
      saveSettingAs(db, { id: 'u_off', role: 'officer' }, 'points', {
        ...points,
        easy: 1,
      }),
    ).rejects.toBeInstanceOf(SettingsPermissionError)
    await expect(
      saveSettingAs(db, { id: 'u_off', role: 'member' }, 'points', points),
    ).rejects.toThrow(/Only admins/)
    expect((await getSetting(db, 'points')).easy).toBe(50)
  })

  it('lets an admin save and records who did it', async () => {
    const club = await getSetting(db, 'club-info')
    const saved = await saveSettingAs(db, { id: 'u_admin', role: 'admin' }, 'club-info', {
      ...club,
      meetingSchedule: 'Tuesdays at lunch',
    })
    expect(saved.value.meetingSchedule).toBe('Tuesdays at lunch')
    const overview = await settingsOverview(db)
    expect(overview.values['club-info'].meetingSchedule).toBe('Tuesdays at lunch')
    expect(overview.meta['club-info']?.updatedByName).toBe('Ada Admin')
    // Groups never saved fall back to defaults with no metadata.
    expect(overview.values.points.easy).toBe(50)
    expect(overview.meta.points).toBeUndefined()
  })
})
