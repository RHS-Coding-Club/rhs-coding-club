import type { CSSProperties } from 'react'

const PATH_COUNT = 36

/**
 * Flowing lines from Efferd UI's auth-5 block (`floating-paths`), kept as
 * written: CSS keyframes (`floating-path` in styles.css) sweep each path's
 * dash and stroke alpha, so there's no JS loop and no SVG opacity layers.
 * Timing is deterministic, so SSR and hydration agree. `position` mirrors
 * the set (1 and -1 make the crossed pair). Color comes from `currentColor`.
 */
export function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: PATH_COUNT }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    opacity: (0.06 + i * 0.018).toFixed(3),
    duration: 20 + (i % 6) * 2,
    delay: -(i * 0.7),
  }))

  return (
    <div className="pointer-events-none absolute inset-0 isolate contain-strict">
      <svg
        // The paths run well past the viewBox; let them, so they fill a tall panel.
        className="h-full w-full overflow-visible"
        fill="none"
        viewBox="0 0 696 316"
        aria-hidden="true"
      >
        {paths.map((path) => (
          <path
            key={path.id}
            className="motion-safe:animate-[floating-path_var(--duration)_linear_infinite]"
            d={path.d}
            pathLength={1}
            stroke="currentColor"
            strokeDasharray="1 1"
            strokeOpacity={path.opacity}
            strokeWidth={path.width}
            style={
              {
                '--duration': `${path.duration}s`,
                '--stroke-opacity': path.opacity,
                animationDelay: `${path.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </div>
  )
}
