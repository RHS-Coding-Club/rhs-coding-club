import { useCallback, useState } from 'react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { PresenceContext, motion } from 'motion/react'
import type { TargetAndTransition, Transition } from 'motion/react'
import { watchIcon } from './play'

export type IconProps = SVGProps<SVGSVGElement>
export type IconComponent = ComponentType<IconProps>

/** One element's animation. Every move ends where it started (or at a turn that looks the same). */
export interface Move {
  animate: Omit<TargetAndTransition, 'transition' | 'transitionEnd'>
  transition: Transition
  /** `stroke-dasharray` while playing, for moves that draw a line with `strokeDashoffset`. */
  dash?: string
  /** Drawn only while the icon plays. */
  extra?: boolean
}

/** The point an element turns or scales around, in viewBox units. */
type Pivot = readonly [x: number, y: number]

type Shape = 'path' | 'rect' | 'circle' | 'ellipse' | 'line' | 'polyline'

/** `[tag, attributes, move, pivot]`, or `['g', children, move, pivot]`. */
export type IconNode =
  | readonly [
      tag: Shape,
      attributes: Record<string, string | number>,
      move?: Move,
      pivot?: Pivot,
    ]
  | readonly [tag: 'g', children: readonly IconNode[], move?: Move, pivot?: Pivot]

/**
 * Builds an icon that renders lucide's plain markup at rest. Motion's elements replace its
 * children only while it plays, so an idle icon has nothing animating or subscribed. `clip`
 * is for moves that leave through the icon's edge and come back.
 */
export function createIcon(
  name: string,
  nodes: readonly IconNode[],
  { clip = false }: { clip?: boolean } = {},
): IconComponent {
  let still: ReactNode
  let playMs = 0

  function AnimatedIcon({ ref, className, children, ...props }: IconProps) {
    const [playing, setPlaying] = useState(false)

    const attach = useCallback(
      (svg: SVGSVGElement | null) => {
        if (!svg) return
        let busy = false
        const unwatch = watchIcon(svg, () => {
          playMs ||= longestMs(nodes)
          if (busy || playMs === 0) return
          busy = true
          setPlaying(true)
          setTimeout(() => {
            busy = false
            setPlaying(false)
          }, playMs + SLACK_MS)
        })
        const cleanUp = typeof ref === 'function' ? ref(svg) : undefined
        if (ref && typeof ref === 'object') ref.current = svg
        return () => {
          unwatch()
          if (cleanUp) cleanUp()
          else if (typeof ref === 'function') ref(null)
          else if (ref) ref.current = null
        }
      },
      [ref],
    )

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        overflow={playing && !clip ? 'visible' : undefined}
        aria-hidden={children || isLabelled(props) ? undefined : true}
        {...props}
        ref={attach}
        // Playing swaps the children, and a press that starts on a removed element never
        // becomes a click, so the pointer only ever lands on the <svg>.
        className={className ? `${POINTER_CLASS} ${className}` : POINTER_CLASS}
      >
        {playing ? (
          // An enclosing <AnimatePresence initial={false}> would skip the moves.
          <PresenceContext.Provider value={null}>
            {nodes.map(drawMoving)}
          </PresenceContext.Provider>
        ) : (
          (still ??= nodes.map(drawStill))
        )}
        {children}
      </svg>
    )
  }
  AnimatedIcon.displayName = name
  return AnimatedIcon
}

const POINTER_CLASS = '*:pointer-events-none'
/** Motion starts a frame or two after mounting; don't cut off the last frames. */
const SLACK_MS = 100

function drawStill([Tag, shape, move]: IconNode, key: number): ReactNode {
  if (move?.extra) return null
  if (isGroup(shape)) return <g key={key}>{shape.map(drawStill)}</g>
  return <Tag key={key} {...shape} />
}

function drawMoving(node: IconNode, key: number): ReactNode {
  const [Tag, shape, move, pivot] = node
  const inner = isGroup(shape) ? { children: shape.map(drawMoving) } : shape
  if (!move) return <Tag key={key} {...inner} />
  const MotionTag = motion[Tag]
  return (
    <MotionTag
      key={key}
      {...inner}
      {...(move.dash && { strokeDasharray: move.dash, strokeDashoffset: 0 })}
      animate={move.animate}
      transition={move.transition}
      style={
        pivot && {
          transformBox: 'view-box',
          originX: `${pivot[0]}px`,
          originY: `${pivot[1]}px`,
        }
      }
    />
  )
}

function isGroup(shape: IconNode[1]): shape is readonly IconNode[] {
  return Array.isArray(shape)
}

function isLabelled(props: IconProps) {
  return Object.keys(props).some(
    (key) => key.startsWith('aria-') || key === 'role' || key === 'title',
  )
}

/** How long the icon's slowest move takes, counting its delay. */
export function longestMs(nodes: readonly IconNode[]): number {
  const timing = (t: Transition) => (Number(t.duration) || 0) + (Number(t.delay) || 0)
  return Math.max(
    0,
    ...nodes.map(([, shape, move]) => {
      const own = move
        ? Object.keys(move.animate).map((key) => {
            const transition = move.transition as Record<string, Transition | undefined>
            return timing(transition[key] ?? move.transition) * 1000
          })
        : []
      return Math.max(0, ...own, isGroup(shape) ? longestMs(shape) : 0)
    }),
  )
}
