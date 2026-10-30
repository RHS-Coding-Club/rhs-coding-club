import { initials } from '#/lib/format'

/**
 * A portrait for members without a photo: their initials, large, on the
 * club gradient. An SVG data URL so React Bits Profile Card can treat it
 * like any other image.
 */
export function initialsPortrait(name: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f4f8a"/><stop offset="1" stop-color="#5fb2ee"/></linearGradient><radialGradient id="h" cx="0.5" cy="0" r="0.9"><stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="400" height="500" fill="url(#g)"/><rect width="400" height="500" fill="url(#h)"/><text x="200" y="245" text-anchor="middle" dominant-baseline="middle" font-family="Geist, -apple-system, Helvetica, Arial, sans-serif" font-size="150" font-weight="600" letter-spacing="-8" fill="#ffffff" fill-opacity="0.92">${escapeXml(initials(name))}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`)
}
