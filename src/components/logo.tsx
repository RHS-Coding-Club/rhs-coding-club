import { cn } from '#/lib/utils'

/**
 * Placeholder mark: frosted disc with three sky-blue droplets, echoing the
 * club's Instagram logo. Replace with the real SVG when it lands in /public.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="31" fill="#e6edf5" />
      <circle cx="32" cy="32" r="31" fill="none" stroke="#b8c7d8" strokeWidth="1.5" />
      <Drop x={22} y={20} />
      <Drop x={42} y={20} />
      <Drop x={32} y={38} />
    </svg>
  )
}

function Drop({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 8} C ${x + 6} ${y}, ${x + 6} ${y + 6}, ${x} ${y + 6} C ${x - 6} ${y + 6}, ${x - 6} ${y}, ${x} ${y - 8} Z`}
      fill="#5fb2ee"
    />
  )
}
