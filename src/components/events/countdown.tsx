import { memo, useEffect, useRef, useState } from 'react'
import BitsCounter from '#/components/bits/Counter'
import { countdownParts } from '#/lib/events'
import { cn } from '#/lib/utils'

/** Skips re-rendering a unit whose number didn't change this second. */
const Counter = memo(BitsCounter)

/**
 * Live countdown. Days, hours and minutes are React Bits Counter odometers
 * that roll when they change; seconds are plain tabular digits (a roll every
 * second is constant motion for no information). The first render uses the
 * server's clock so the server HTML and hydration agree; the browser clock
 * takes over on mount. The clock only ticks while the countdown is on screen
 * and the tab is visible.
 */
export function Countdown({
  target,
  serverNow,
  onDone,
  className,
}: {
  target: Date | number | string
  serverNow: number
  onDone?: () => void
  className?: string
}) {
  const end = new Date(target).getTime()
  const [now, setNow] = useState(serverNow)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    let timer = 0
    let onScreen = true
    const sync = () => {
      const run = onScreen && document.visibilityState === 'visible'
      if (run && !timer) {
        setNow(Date.now())
        timer = window.setInterval(() => setNow(Date.now()), 1000)
      } else if (!run && timer) {
        window.clearInterval(timer)
        timer = 0
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    if (root) observer.observe(root)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.clearInterval(timer)
    }
  }, [])

  const left = end - now
  const done = left <= 0
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  useEffect(() => {
    if (done) onDoneRef.current?.()
  }, [done])

  const p = countdownParts(left)
  const units = [
    { n: p.days, label: p.days === 1 ? 'day' : 'days', roll: true },
    { n: p.hours, label: 'hrs', roll: true },
    { n: p.minutes, label: 'min', roll: true },
    { n: p.seconds, label: 'sec', roll: false },
  ]

  return (
    <div ref={rootRef} className={cn('w-full', className)}>
      <p className="sr-only">
        Starts in {p.days} days, {p.hours} hours, and {p.minutes} minutes.
      </p>
      <dl aria-hidden="true" className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center rounded-2xl bg-white/8 px-1 py-3 ring-1 ring-white/10 sm:py-4"
          >
            <dt className="order-2 mt-1 font-mono text-[11px] tracking-[0.12em] text-white uppercase">
              {u.label}
            </dt>
            <dd className="order-1">
              {u.roll ? (
                <Counter
                  value={u.n}
                  minDigits={2}
                  fontSize="clamp(2rem, 4.2vw, 3.25rem)"
                  fontWeight={600}
                  stagger={0.03}
                  duration={0.55}
                  intro={false}
                  motionBlur={false}
                  className="tracking-[-0.04em]"
                />
              ) : (
                <span className="block text-[clamp(2rem,4.2vw,3.25rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                  {String(u.n).padStart(2, '0')}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
