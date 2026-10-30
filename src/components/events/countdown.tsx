import { useEffect, useRef, useState } from 'react'
import Counter from '#/components/bits/Counter'
import { countdownParts } from '#/lib/events'
import { cn } from '#/lib/utils'

/**
 * Live countdown on React Bits Counter: each unit is an odometer that rolls
 * as the seconds tick. The first render uses the server's clock so the
 * server HTML and hydration agree; the browser clock takes over on mount.
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

  useEffect(() => {
    setNow(Date.now())
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
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
    { n: p.days, label: p.days === 1 ? 'day' : 'days' },
    { n: p.hours, label: 'hrs' },
    { n: p.minutes, label: 'min' },
    { n: p.seconds, label: 'sec' },
  ]

  return (
    <div className={cn('w-full', className)}>
      <p className="sr-only">
        Starts in {p.days} days, {p.hours} hours, and {p.minutes} minutes.
      </p>
      <dl aria-hidden="true" className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center rounded-2xl bg-white/8 px-1 py-3 ring-1 ring-white/10 sm:py-4"
          >
            <dt className="order-2 mt-1 font-mono text-[11px] tracking-[0.12em] uppercase opacity-70">
              {u.label}
            </dt>
            <dd className="order-1">
              <Counter
                value={u.n}
                minDigits={2}
                fontSize="clamp(2rem, 4.2vw, 3.25rem)"
                fontWeight={600}
                stagger={0.03}
                duration={0.55}
                motionBlur
                className="tracking-[-0.04em]"
              />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
