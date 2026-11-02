// A branded cover for projects without screenshots: an SVG "poster" built
// from the project's tech stack and team, in the club's sky/navy palette.
// Pure and deterministic (same project, same art) so it is unit-testable and
// renders identically on every visit. Used as a data: URL image.

/** FNV-1a: a small stable hash so each project gets its own variation. */
export function hashString(s: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Tile heights for a 600px-wide cover; varied so the masonry has rhythm. */
const HEIGHTS = [480, 600, 720, 540, 660] as const

export function coverHeight(id: string) {
  return HEIGHTS[hashString(id) % HEIGHTS.length]
}

const DARK = [
  { from: '#0f1a2b', to: '#1f4f8a', accent: '#5fb2ee', ink: '#e6edf5', line: '#5fb2ee' },
  { from: '#121924', to: '#1b2f4d', accent: '#8ccaf4', ink: '#e6edf5', line: '#5fb2ee' },
  { from: '#0b2440', to: '#123a66', accent: '#a9d4f5', ink: '#f3f6fb', line: '#a9d4f5' },
  { from: '#5fb2ee', to: '#a9d4f5', accent: '#101826', ink: '#101826', line: '#1f4f8a' },
  { from: '#101826', to: '#0e3b66', accent: '#5fb2ee', ink: '#e6edf5', line: '#1f4f8a' },
] as const

const LIGHT = [
  { from: '#e6f1fb', to: '#bcdcf6', accent: '#1f4f8a', ink: '#101826', line: '#5fb2ee' },
  { from: '#f3f6fb', to: '#d6e8f8', accent: '#1f4f8a', ink: '#101826', line: '#1f4f8a' },
  { from: '#dcecfa', to: '#f3f6fb', accent: '#174070', ink: '#101826', line: '#5fb2ee' },
  { from: '#1f4f8a', to: '#5fb2ee', accent: '#ffffff', ink: '#f3f6fb', line: '#a9d4f5' },
  { from: '#eaf2fb', to: '#c7e2f8', accent: '#1f4f8a', ink: '#101826', line: '#1f4f8a' },
] as const

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

export interface CoverInput {
  id: string
  title: string
  tech: string[]
  /** Team initials, submitter first. */
  initials: string[]
  year?: number | null
  featured?: boolean
  dark: boolean
  /** Override the size (defaults to 600 wide, height from `coverHeight`). */
  width?: number
  /** Override the height (e.g. 450 for a 4:3 card). */
  height?: number
  /** Leave the bottom free for an overlaid caption. */
  captionSpace?: boolean
}

/** The cover as an SVG string (600 wide, height from `coverHeight`). */
export function projectCoverSvg(p: CoverInput) {
  const W = p.width ?? 600
  const H = p.height ?? coverHeight(p.id)
  const seed = hashString(p.id)
  const palettes = p.dark ? DARK : LIGHT
  const palette = palettes[seed % palettes.length]
  const angle = 18 + (seed % 5) * 6
  const mono =
    "ui-monospace, SFMono-Regular, 'Geist Mono', Menlo, Consolas, 'Liberation Mono', monospace"
  const sans =
    "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

  // Diagonal beams, like the hero background, offset per project.
  const beams = Array.from({ length: Math.ceil(W / 85) }, (_, i) => {
    const x = -200 + i * 130 + (seed % 60)
    const w = 26 + ((seed >> (i + 2)) % 5) * 10
    const o = (0.07 + ((seed >> i) % 4) * 0.035).toFixed(3)
    return `<rect x="${x}" y="-300" width="${w}" height="${H + 600}" fill="${palette.line}" opacity="${o}" />`
  }).join('')

  // The stack, big and stacked like a poster. Sized to fit the width.
  const words = (p.tech.length ? p.tech : [p.title]).slice(0, 4)
  const longest = Math.max(...words.map((w) => w.length), 4)
  // Centered in the band between the label row and the caption area.
  const bandTop = 100
  const bandBottom = H - (p.captionSpace ? 120 : 48)
  const fitWidth = Math.floor((W - 80) / (longest * 0.62))
  const fitHeight = Math.floor((bandBottom - bandTop) / (words.length * 1.08))
  const size = Math.max(
    26,
    Math.min(Math.round(68 * Math.sqrt(W / 600)), fitWidth, fitHeight),
  )
  const lineH = Math.round(size * 1.08)
  const block = lineH * (words.length - 1) + size * 0.8
  const stackTop = Math.round(
    Math.max(
      bandTop + size * 0.8,
      bandTop + (bandBottom - bandTop - block) / 2 + size * 0.8,
    ),
  )
  const stack = words
    .map(
      (w, i) =>
        `<text x="40" y="${stackTop + i * lineH}" font-family="${mono}" font-size="${size}" font-weight="500" letter-spacing="-1" fill="${i === 0 ? palette.accent : palette.ink}" fill-opacity="${i === 0 ? 1 : 0.86 - i * 0.12}">${esc(w)}</text>`,
    )
    .join('')

  // Team initials as overlapping discs, top right.
  const team = p.initials.slice(0, 4)
  const discs = team
    .map((ini, i) => {
      const cx = W - 52 - (team.length - 1 - i) * 30
      return `<g><circle cx="${cx}" cy="56" r="21" fill="${palette.from}" stroke="${palette.accent}" stroke-width="2" /><text x="${cx}" y="61" text-anchor="middle" font-family="${sans}" font-size="14" font-weight="600" fill="${palette.ink}">${esc(ini)}</text></g>`
    })
    .join('')

  const label = [p.featured ? 'FEATURED' : null, p.year ? String(p.year) : null]
    .filter(Boolean)
    .join(' / ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.from}"/><stop offset="1" stop-color="${palette.to}"/></linearGradient><radialGradient id="r" cx="0.85" cy="0.1" r="0.8"><stop offset="0" stop-color="${palette.accent}" stop-opacity="0.35"/><stop offset="1" stop-color="${palette.accent}" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#r)"/><g transform="rotate(${angle} ${W / 2} ${H / 2})">${beams}</g>${label ? `<text x="40" y="62" font-family="${mono}" font-size="15" letter-spacing="2" fill="${palette.ink}" fill-opacity="0.7">${esc(label)}</text>` : ''}${discs}${stack}</svg>`
}

export function projectCoverUrl(p: CoverInput) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(projectCoverSvg(p))}`
}
