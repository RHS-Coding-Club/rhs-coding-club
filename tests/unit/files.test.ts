import { describe, expect, it } from 'vitest'
import { avatarUrl, fileSrcSet, fileUrl, keyFromFileUrl } from '#/lib/files'

const KEY = 'project/11111111-1111-4111-a111-111111111111.png'

describe('file URLs', () => {
  it('asks for a resized copy only when given a width', () => {
    expect(fileUrl(KEY)).toBe(`/files/${KEY}`)
    expect(fileUrl(KEY, 640)).toBe(`/files/${KEY}?w=640`)
    expect(fileUrl(null, 640)).toBeUndefined()
  })

  it('lists each width once in a srcSet', () => {
    expect(fileSrcSet(KEY, [384, 640])).toBe(
      `/files/${KEY}?w=384 384w, /files/${KEY}?w=640 640w`,
    )
    expect(fileSrcSet(undefined)).toBeUndefined()
  })

  it('sizes uploaded avatars but leaves provider images alone', () => {
    expect(avatarUrl({ avatarKey: KEY })).toBe(`/files/${KEY}?w=128`)
    expect(avatarUrl({ avatarKey: KEY }, 960)).toBe(`/files/${KEY}?w=960`)
    expect(avatarUrl({ image: 'https://example.com/a.png' })).toBe(
      'https://example.com/a.png',
    )
  })

  it('reads the key back out of a plain upload URL only', () => {
    expect(keyFromFileUrl(`/files/${KEY}`)).toBe(KEY)
    expect(keyFromFileUrl(`/files/${KEY}?w=640`)).toBeNull()
    expect(keyFromFileUrl('https://example.com/a.png')).toBeNull()
    expect(keyFromFileUrl('/files/../secret')).toBeNull()
  })
})
