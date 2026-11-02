import { useMemo } from 'react'
import { encode } from 'uqr'
import { cn } from '#/lib/utils'

/**
 * A QR code as one crisp SVG path (uqr does the encoding). Dark modules on a
 * white quiet zone, whatever the theme: scanners want contrast, not style.
 */
export function QrCode({
  value,
  label,
  className,
  color = '#101826',
}: {
  value: string
  /** Accessible name, e.g. "QR code to check in". */
  label: string
  className?: string
  color?: string
}) {
  const { size, path } = useMemo(() => {
    const qr = encode(value, { ecc: 'M', border: 2 })
    let d = ''
    qr.data.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) d += `M${x} ${y}h1v1h-1z`
      }),
    )
    return { size: qr.size, path: d }
  }, [value])

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={cn('block bg-white', className)}
    >
      <rect width={size} height={size} fill="#ffffff" />
      <path d={path} fill={color} />
    </svg>
  )
}
