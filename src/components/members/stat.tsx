import CountUp from '#/components/bits/CountUp'
import { cn } from '#/lib/utils'

/**
 * One number with a label, counted up with React Bits Count Up the first
 * time it scrolls into view. `prefix` is for ranks ("#3").
 */
export function Stat({
  value,
  label,
  prefix,
  empty = '·',
  className,
}: {
  value: number | null
  label: string
  prefix?: string
  /** Shown instead of a number when `value` is null (e.g. unranked). */
  empty?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <dt className="text-muted-foreground order-2 text-sm">{label}</dt>
      <dd className="order-1 text-4xl leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-5xl">
        {value === null ? (
          <span className="text-muted-foreground">{empty}</span>
        ) : (
          <>
            <span className="sr-only">
              {prefix}
              {value.toLocaleString('en-US')}
            </span>
            <span aria-hidden="true">
              <CountUp to={value} prefix={prefix} separator="," duration={1.6} />
            </span>
          </>
        )}
      </dd>
    </div>
  )
}
