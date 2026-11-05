import { cn } from '#/lib/utils'

/**
 * The club mark: the circular "RHS Coding Club" disc with sky droplets and
 * 0/1 digits. Source is public/logo.jpg; public/logo.png is the same image
 * with the square canvas masked to a transparent circle, and public/logo-128.webp
 * is that at 128px (it never renders above 36px), a twentieth of the bytes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo-128.webp"
      alt=""
      width={128}
      height={128}
      decoding="async"
      className={cn('shrink-0 rounded-full', className)}
    />
  )
}
