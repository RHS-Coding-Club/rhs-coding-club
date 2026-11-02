import { cn } from '#/lib/utils'

/**
 * The club mark: the circular "RHS Coding Club" disc with sky droplets and
 * 0/1 digits. Source is public/logo.jpg; public/logo.png is the same image
 * with the square canvas masked to a transparent circle.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt=""
      width={320}
      height={320}
      decoding="async"
      className={cn('shrink-0 rounded-full', className)}
    />
  )
}
