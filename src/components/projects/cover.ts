// A branded cover for projects without screenshots: an SVG built from the
// project's title, stack, and team, in the club's sky/navy palette.
// Pure and deterministic (same project, same art) so it is unit-testable and
// renders identically on every visit. Used as a data: URL image.

import { BRAND } from '#/lib/static-palette'

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
  {
    from: '#0f1a2b',
    to: BRAND.navy,
    accent: BRAND.sky,
    ink: BRAND.frost,
    line: BRAND.sky,
  },
  {
    from: '#121924',
    to: '#1b2f4d',
    accent: '#8ccaf4',
    ink: BRAND.frost,
    line: BRAND.sky,
  },
  {
    from: '#0b2440',
    to: '#123a66',
    accent: BRAND.skyPale,
    ink: '#f3f6fb',
    line: BRAND.skyPale,
  },
  {
    from: BRAND.sky,
    to: BRAND.skyPale,
    accent: BRAND.ink,
    ink: BRAND.ink,
    line: BRAND.navy,
  },
  {
    from: BRAND.ink,
    to: '#0e3b66',
    accent: BRAND.sky,
    ink: BRAND.frost,
    line: BRAND.navy,
  },
]

const LIGHT = [
  { from: '#e6f1fb', to: '#bcdcf6', accent: BRAND.navy, ink: BRAND.ink, line: BRAND.sky },
  {
    from: '#f3f6fb',
    to: '#d6e8f8',
    accent: BRAND.navy,
    ink: BRAND.ink,
    line: BRAND.navy,
  },
  {
    from: '#dcecfa',
    to: '#f3f6fb',
    accent: BRAND.navyDeep,
    ink: BRAND.ink,
    line: BRAND.sky,
  },
  {
    from: BRAND.navy,
    to: BRAND.sky,
    accent: '#ffffff',
    ink: '#f3f6fb',
    line: BRAND.skyPale,
  },
  {
    from: '#eaf2fb',
    to: '#c7e2f8',
    accent: BRAND.navy,
    ink: BRAND.ink,
    line: BRAND.navy,
  },
]

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

/** File extension and run command for a project's first language. */
const LANG: [RegExp, string, string][] = [
  [/^python|flask|django/i, 'py', 'python main.py'],
  [/^typescript/i, 'ts', 'npm run dev'],
  [/^javascript|node|react|svelte|vue|next/i, 'js', 'npm run dev'],
  [/^swift/i, 'swift', 'swift run'],
  [/^java$|kotlin/i, 'java', './gradlew run'],
  [/^c\+\+|^cpp/i, 'cpp', 'make && ./app'],
  [/^go$|golang/i, 'go', 'go run .'],
  [/^rust/i, 'rs', 'cargo run'],
  [/^html|css/i, 'html', 'open index.html'],
]

function langOf(tech: string[]) {
  for (const t of tech) {
    const hit = LANG.find(([re]) => re.test(t))
    if (hit) return { ext: hit[1], run: hit[2] }
  }
  return { ext: 'md', run: 'make run' }
}

/** The title as a short file or repo name, cut at a word boundary. */
function slugOf(title: string) {
  const words = title.toLowerCase().match(/[a-z0-9]+/g) ?? []
  let out = ''
  for (const w of words) {
    const next = out ? `${out}-${w}` : w
    if (next.length > 20 && out) break
    out = next
  }
  return out.slice(0, 24) || 'project'
}

/** Deterministic 0..1 from the seed and a salt, for bar widths and dot spots. */
const rand = (seed: number, salt: number) => (hashString(`${seed}:${salt}`) % 1000) / 1000

/**
 * The cover as an SVG string (600 wide, height from `coverHeight`). Each
 * project gets one of four motifs (an editor, a terminal, a monogram, an
 * orbit), its own palette, and its own beam angle, so a wall of covers reads
 * as a set of different projects rather than one poster repeated.
 */
export function projectCoverSvg(p: CoverInput) {
  const W = p.width ?? 600
  const H = p.height ?? coverHeight(p.id)
  const seed = hashString(p.id)
  const palettes = p.dark ? DARK : LIGHT
  const palette = palettes[seed % palettes.length]
  const angle = 18 + (seed % 5) * 6
  const motif = hashString(`${p.id}:motif`) % 4
  const mono =
    "ui-monospace, SFMono-Regular, 'Geist Mono', Menlo, Consolas, 'Liberation Mono', monospace"
  const sans =
    "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
  const ink = palette.ink
  const accent = palette.accent
  const { ext, run } = langOf(p.tech)
  const slug = slugOf(p.title)
  // Room the caption or the chip row needs at the bottom.
  const foot = p.captionSpace ? 120 : 76
  const top = 96

  // Diagonal beams, quieter than before so the motif leads.
  const beams = Array.from({ length: Math.ceil(W / 85) }, (_, i) => {
    const x = -200 + i * 130 + (seed % 60)
    const w = 26 + ((seed >> (i + 2)) % 5) * 10
    const o = (0.04 + ((seed >> i) % 4) * 0.02).toFixed(3)
    return `<rect x="${x}" y="-300" width="${w}" height="${H + 600}" fill="${palette.line}" opacity="${o}" />`
  }).join('')

  // A window that bleeds off the right edge (and the bottom when a caption
  // covers it), the way a product shot is cropped.
  const panel = (fill: string, fillOpacity: number) => {
    const x = 40
    const h = p.captionSpace ? H - top + 40 : H - top - foot + 8
    return `<rect x="${x}" y="${top}" width="${W}" height="${h}" rx="18" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${ink}" stroke-opacity="0.16"/><g fill="${ink}" fill-opacity="0.28"><circle cx="${x + 22}" cy="${top + 22}" r="5"/><circle cx="${x + 40}" cy="${top + 22}" r="5"/><circle cx="${x + 58}" cy="${top + 22}" r="5"/></g>`
  }

  let art = ''
  if (motif === 0) {
    // Editor: a file tab and lines of code drawn as token bars.
    const lines = Math.max(3, Math.floor((H - top - foot - 70) / 30))
    const rows = Array.from({ length: lines }, (_, i) => {
      const y = top + 74 + i * 30
      const indent = [0, 1, 2, 2, 1, 0, 1, 2][(i + (seed % 3)) % 8] * 24
      const w1 = 40 + rand(seed, i) * 120
      const w2 = 30 + rand(seed, i + 40) * 160
      const hot = rand(seed, i + 80) > 0.6
      return `<text x="58" y="${y + 5}" font-family="${mono}" font-size="13" fill="${ink}" fill-opacity="0.3">${i + 1}</text><rect x="${92 + indent}" y="${y - 6}" width="${w1.toFixed(0)}" height="10" rx="5" fill="${hot ? accent : ink}" fill-opacity="${hot ? 0.9 : 0.34}"/><rect x="${(100 + indent + w1).toFixed(0)}" y="${y - 6}" width="${w2.toFixed(0)}" height="10" rx="5" fill="${ink}" fill-opacity="0.18"/>`
    }).join('')
    art = `${panel(palette.from, 0.55)}<rect x="110" y="${top + 8}" width="${Math.min(W - 150, 30 + (slug.length + ext.length + 1) * 9)}" height="28" rx="8" fill="${ink}" fill-opacity="0.1"/><text x="124" y="${top + 27}" font-family="${mono}" font-size="14" fill="${ink}" fill-opacity="0.85">${esc(`${slug}.${ext}`)}</text>${rows}`
  } else if (motif === 1) {
    // Terminal: clone, run, a green-light line, then request logs as bars.
    // A terminal is dark in either theme, so it uses the code-block colors.
    const fg = BRAND.codeFg
    const hot = BRAND.sky
    const ms = 200 + (seed % 700)
    const say = (y: number, text: string, color: string, opacity: number) =>
      `<text x="64" y="${y}" font-family="${mono}" font-size="17" fill="${color}" fill-opacity="${opacity}">${esc(text)}</text>`
    const logRows = Math.max(0, Math.floor((H - top - foot - 230) / 28))
    const logs = Array.from({ length: logRows }, (_, i) => {
      const y = top + 220 + i * 28
      const w = 120 + rand(seed, i + 120) * 220
      return `<rect x="64" y="${y}" width="44" height="9" rx="4.5" fill="${hot}" fill-opacity="0.5"/><rect x="118" y="${y}" width="${w.toFixed(0)}" height="9" rx="4.5" fill="${fg}" fill-opacity="0.2"/>`
    }).join('')
    const h = p.captionSpace ? H - top + 40 : H - top - foot + 8
    art = `<rect x="40" y="${top}" width="${W}" height="${h}" rx="18" fill="${BRAND.codeBg}" fill-opacity="${p.dark ? 0.6 : 0.92}" stroke="${fg}" stroke-opacity="0.12"/><g fill="${fg}" fill-opacity="0.3"><circle cx="62" cy="${top + 22}" r="5"/><circle cx="80" cy="${top + 22}" r="5"/><circle cx="98" cy="${top + 22}" r="5"/></g>${say(top + 82, `$ git clone rhs/${slug}`, fg, 0.9)}${say(top + 114, `$ ${run}`, fg, 0.9)}${say(top + 146, `ready in ${ms}ms`, hot, 1)}<rect x="64" y="${top + 166}" width="11" height="20" fill="${hot}" fill-opacity="0.85"/>${logs}`
  } else if (motif === 2) {
    // Dashboard: three stat tiles and an area chart that climbs.
    const x0 = 64
    const tileW = Math.min(150, (W - x0 - 40) / 3 - 12)
    const tiles = [0, 1, 2]
      .map((i) => {
        const x = x0 + i * (tileW + 12)
        return `<rect x="${x}" y="${top + 50}" width="${tileW}" height="64" rx="12" fill="${ink}" fill-opacity="0.07"/><rect x="${x + 14}" y="${top + 66}" width="${tileW * 0.4}" height="8" rx="4" fill="${ink}" fill-opacity="0.3"/><rect x="${x + 14}" y="${top + 86}" width="${tileW * (0.45 + rand(seed, i) * 0.3)}" height="14" rx="7" fill="${i === 0 ? accent : ink}" fill-opacity="${i === 0 ? 0.95 : 0.55}"/>`
      })
      .join('')
    const cTop = top + 140
    const cBottom = (p.captionSpace ? H : H - foot) - 16
    const n = 9
    const pts = Array.from({ length: n }, (_, i) => {
      const x = x0 + (i / (n - 1)) * (W - x0)
      const trend = i / (n - 1)
      const v = Math.min(
        1,
        Math.max(0, 0.15 + trend * 0.65 + (rand(seed, i + 200) - 0.5) * 0.3),
      )
      return [x, cBottom - v * (cBottom - cTop)] as const
    })
    const line = pts
      .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(' ')
    art = `${panel(palette.from, 0.55)}${tiles}<path d="${line} L${W} ${cBottom} L${x0} ${cBottom} Z" fill="${accent}" fill-opacity="0.18"/><path d="${line}" fill="none" stroke="${accent}" stroke-width="3" stroke-linejoin="round"/>`
  } else {
    // Orbit: rings with members as dots, the language at the center.
    const cx = W * 0.62
    const cy = top + (H - top - foot) / 2
    const radii = [70, 130, 195].map((r) => r * Math.min(1, H / 520))
    const rings = radii
      .map(
        (r) =>
          `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ink}" stroke-opacity="0.16" stroke-width="1.5"/>`,
      )
      .join('')
    const dots = radii
      .flatMap((r, ri) =>
        [0, 1].map((k) => {
          const a = rand(seed, ri * 7 + k) * Math.PI * 2
          const x = cx + Math.cos(a) * r
          const y = cy + Math.sin(a) * r
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${k ? 5 : 8}" fill="${k ? ink : accent}" fill-opacity="${k ? 0.5 : 0.95}"/>`
        }),
      )
      .join('')
    art = `${rings}${dots}<circle cx="${cx}" cy="${cy}" r="34" fill="${accent}"/><text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="${mono}" font-size="20" font-weight="600" fill="${palette.from}">${esc(ext)}</text>`
  }

  // The stack as small chips along the bottom, when no caption covers it.
  let chips = ''
  if (!p.captionSpace) {
    let x = 40
    for (const t of p.tech.slice(0, 4)) {
      const w = Math.round(t.length * 9.2 + 26)
      if (x + w > W - 40) break
      chips += `<rect x="${x}" y="${H - 58}" width="${w}" height="30" rx="15" fill="${ink}" fill-opacity="0.1" stroke="${ink}" stroke-opacity="0.16"/><text x="${x + 13}" y="${H - 38}" font-family="${mono}" font-size="15" fill="${ink}" fill-opacity="0.85">${esc(t)}</text>`
      x += w + 8
    }
  }

  // Team initials as overlapping discs, top right.
  const team = p.initials.slice(0, 4)
  const discs = team
    .map((ini, i) => {
      const cx = W - 52 - (team.length - 1 - i) * 30
      return `<g><circle cx="${cx}" cy="52" r="21" fill="${palette.from}" stroke="${accent}" stroke-width="2" /><text x="${cx}" y="57" text-anchor="middle" font-family="${sans}" font-size="14" font-weight="600" fill="${ink}">${esc(ini)}</text></g>`
    })
    .join('')

  const label = [p.featured ? 'FEATURED' : null, p.year ? String(p.year) : null]
    .filter(Boolean)
    .join(' / ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.from}"/><stop offset="1" stop-color="${palette.to}"/></linearGradient><radialGradient id="r" cx="0.85" cy="0.1" r="0.8"><stop offset="0" stop-color="${accent}" stop-opacity="0.3"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#r)"/><g transform="rotate(${angle} ${W / 2} ${H / 2})">${beams}</g>${art}${label ? `<text x="40" y="58" font-family="${mono}" font-size="14" letter-spacing="2" fill="${ink}" fill-opacity="0.7">${esc(label)}</text>` : ''}${discs}${chips}</svg>`
}

export function projectCoverUrl(p: CoverInput) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(projectCoverSvg(p))}`
}
