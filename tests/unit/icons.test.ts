import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type * as CreateIcon from '#/components/icons/create-icon'
import type { IconNode, Move } from '#/components/icons/create-icon'

// Hand the test each icon's nodes instead of a component.
vi.mock('#/components/icons/create-icon', () => ({
  createIcon: (name: string, nodes: readonly IconNode[]) => ({ name, nodes }),
}))
const { createIcon, longestMs } = await vi.importActual<typeof CreateIcon>(
  '#/components/icons/create-icon',
)

interface IconSource {
  name: string
  nodes: readonly IconNode[]
}
const files = import.meta.glob<Record<string, IconSource>>(
  '../../src/components/icons/*.ts',
  { eager: true },
)
const icons = Object.entries(files)
  .filter(([path]) => !/\/(moves|play)\.ts$/.test(path))
  .map(([path, exported]) => ({ path, exported, icon: Object.values(exported)[0] }))

const walk = (nodes: readonly IconNode[]): IconNode[] =>
  nodes.flatMap((node) => (node[0] === 'g' ? [node, ...walk(node[1])] : [node]))

const REST: Record<string, number> = { scale: 1, scaleX: 1, scaleY: 1, opacity: 1 }
REST.strokeWidth = 2

/** What every keyframe list must end on. Turns of 90° and up end on a lookalike. */
function endsAtRest(key: string, keyframes: number[]) {
  const last = keyframes.at(-1)
  if (key === 'rotate') return last !== undefined && last % 90 === 0
  return last === (REST[key] ?? 0)
}

const keyframesOf = (move: Move) => Object.entries(move.animate) as [string, number[]][]

describe('icons', () => {
  it('finds them all', () => {
    expect(icons.length).toBeGreaterThan(100)
  })

  for (const { path, exported, icon } of icons) {
    describe(icon.name, () => {
      const moves = walk(icon.nodes).filter((node) => node[2])

      it('is the only export of the file named after it', () => {
        expect(Object.keys(exported)).toEqual([icon.name])
        const slug = path.slice(path.lastIndexOf('/') + 1, -'.ts'.length)
        const pascal = slug.replace(/(?:^|-)(\w)/g, (_, c: string) => c.toUpperCase())
        expect(icon.name).toBe(pascal)
      })

      it('is fully drawn at rest', () => {
        const html = renderToStaticMarkup(
          createElement(createIcon(icon.name, icon.nodes), { className: 'size-4' }),
        )
        expect(html).toMatch(/^<svg [^>]*aria-hidden="true"/)
        expect(html).toContain('size-4"')
        expect(html).not.toMatch(/opacity|dash|transform|style/)
        const drawn = icon.nodes.filter(([, , move]) => !move?.extra)
        for (const [tag, shape] of walk(drawn)) {
          if (tag === 'path') expect(html).toContain(`d="${shape.d}"`)
        }
      })

      it('moves and comes back to rest', () => {
        for (const [, , move, pivot] of moves) {
          if (!move) continue
          expect('strokeDashoffset' in move.animate).toBe(move.dash !== undefined)
          const keys = Object.keys(move.animate).join()
          if (/scale|rotate|skew/.test(keys)) expect(pivot).toBeDefined()
          for (const [key, keyframes] of keyframesOf(move)) {
            if (!move.extra)
              expect([key, endsAtRest(key, keyframes)]).toEqual([key, true])
            const own = (move.transition as Record<string, unknown>)[key]
            const { times } = (own ?? move.transition) as { times?: number[] }
            if (times) expect(times).toHaveLength(keyframes.length)
          }
        }
        expect(longestMs(icon.nodes)).toBeLessThanOrEqual(1200)
      })
    })
  }
})

describe('createIcon', () => {
  const Icon = createIcon('Dot', [['circle', { cx: 12, cy: 12, r: 1 }]])
  const render = (props: object) => renderToStaticMarkup(createElement(Icon, props))

  it('passes SVG props through and is hidden unless labelled', () => {
    expect(render({ strokeWidth: 1.5 })).toContain('stroke-width="1.5"')
    expect(render({ 'aria-label': 'Dot' })).not.toContain('aria-hidden')
    expect(render({ role: 'img' })).not.toContain('aria-hidden')
  })

  it('times the slowest move, counting its delay', () => {
    const move = (transition: Move['transition']): Move => ({
      animate: { y: [0, 1, 0], opacity: [0, 1] },
      transition,
    })
    const shape = { d: 'M0 0' }
    expect(longestMs([['path', shape]])).toBe(0)
    expect(longestMs([['path', shape, move({ duration: 0.5, delay: 0.25 })]])).toBe(750)
    expect(
      longestMs([
        [
          'g',
          [
            [
              'path',
              shape,
              move({ duration: 0.1, opacity: { duration: 0.5, delay: 1 } }),
            ],
          ],
        ],
      ]),
    ).toBe(1500)
  })
})
