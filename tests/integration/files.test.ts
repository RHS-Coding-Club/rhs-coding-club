import { describe, expect, it } from 'vitest'
import { env } from 'cloudflare:test'
import {
  deleteFile,
  makeVariant,
  parseWidth,
  variantKey,
  withVariants,
} from '#/services/files'
import { IMAGE_WIDTHS } from '#/lib/files'

// Runs against the Images binding's offline mode, which resizes and converts
// like production does.

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (bytes: Uint8Array) => {
  let c = 0xffffffff
  for (const b of bytes) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** An RGB PNG with a gradient and some noise, so it compresses like a screenshot. */
async function png(width: number, height: number) {
  const raw = new Uint8Array((width * 3 + 1) * height)
  let seed = 1
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1)
    for (let x = 0; x < width; x++) {
      seed = (seed * 16807) % 2147483647
      const i = row + 1 + x * 3
      raw[i] = (x * 255) / width
      raw[i + 1] = (y * 255) / height
      raw[i + 2] = seed & 0x3f
    }
  }
  const zlib = new Uint8Array(
    await new Response(
      new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate')),
    ).arrayBuffer(),
  )
  const chunk = (type: string, data: Uint8Array) => {
    const out = new Uint8Array(12 + data.length)
    const view = new DataView(out.buffer)
    view.setUint32(0, data.length)
    out.set(new TextEncoder().encode(type), 4)
    out.set(data, 8)
    view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
    return out
  }
  const header = new Uint8Array(13)
  const view = new DataView(header.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  header.set([8, 2, 0, 0, 0], 8)
  const parts = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib),
    chunk('IEND', new Uint8Array()),
  ]
  return new Blob(parts).arrayBuffer()
}

const KEY = 'project/11111111-1111-4111-a111-111111111111.png'

async function putPng(width = 800, height = 400) {
  const bytes = await png(width, height)
  await env.FILES.put(KEY, bytes, { httpMetadata: { contentType: 'image/png' } })
  return bytes.byteLength
}

async function widthOf(key: string) {
  const object = await env.FILES.get(key)
  if (!object) throw new Error(`missing ${key}`)
  const info = await env.IMAGES.info(object.body)
  return { info, type: object.httpMetadata?.contentType, size: object.size }
}

describe('resized images', () => {
  it('stores a smaller WebP copy beside the upload', async () => {
    const original = await putPng()
    const made = await makeVariant(env.FILES, env.IMAGES, KEY, 256)
    expect(made?.key).toBe(variantKey(KEY, 256))
    const { info, type, size } = await widthOf(variantKey(KEY, 256))
    expect(type).toBe('image/webp')
    expect('width' in info && info.width).toBe(256)
    expect(size).toBeLessThan(original)
  })

  it('never upscales past the original', async () => {
    await putPng(300, 150)
    await makeVariant(env.FILES, env.IMAGES, KEY, 1920)
    const { info } = await widthOf(variantKey(KEY, 1920))
    expect('width' in info && info.width).toBe(300)
  })

  it('leaves GIFs and missing files to the original', async () => {
    const gif = 'badge/22222222-2222-4222-a222-222222222222.gif'
    await env.FILES.put(gif, new Uint8Array([71, 73, 70]), {
      httpMetadata: { contentType: 'image/gif' },
    })
    expect(await makeVariant(env.FILES, env.IMAGES, gif, 128)).toBeNull()
    expect(await env.FILES.head(variantKey(gif, 128))).toBeNull()
    expect(
      await makeVariant(
        env.FILES,
        env.IMAGES,
        'post/33333333-3333-4333-a333-333333333333.png',
        128,
      ),
    ).toBeNull()
  })

  it('serves the original when there is no Images binding', async () => {
    await putPng()
    expect(await makeVariant(env.FILES, undefined, KEY, 256)).toBeNull()
  })

  it('drops a copy whose upload was deleted while it was being made', async () => {
    await putPng()
    // The upload disappears the moment the copy is stored.
    const racing = new Proxy(env.FILES, {
      get(target, prop) {
        if (prop === 'put')
          return async (...args: Parameters<R2Bucket['put']>) => {
            await target.delete(KEY)
            return target.put(...args)
          }
        const value = Reflect.get(target, prop) as unknown
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
    expect(await makeVariant(racing, env.IMAGES, KEY, 256)).toBeNull()
    expect(await env.FILES.head(variantKey(KEY, 256))).toBeNull()
  })

  it('deletes the copies with the upload', async () => {
    await putPng()
    await makeVariant(env.FILES, env.IMAGES, KEY, 256)
    await makeVariant(env.FILES, env.IMAGES, KEY, 640)
    await deleteFile(env.FILES, KEY)
    for (const key of withVariants([KEY])) expect(await env.FILES.head(key)).toBeNull()
  })

  it('only accepts the listed widths', () => {
    for (const w of IMAGE_WIDTHS) expect(parseWidth(String(w))).toBe(w)
    for (const w of [null, '', '0', '100', '640.5', '-640', '1e3', 'abc'])
      expect(parseWidth(w)).toBeNull()
  })
})
