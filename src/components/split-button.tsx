import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { ArrowDownRight } from 'lucide-react'
import { cn } from '#/lib/utils'

/**
 * The template's signature control: a pill whose label sits on a
 * foreground-colored body with an attached sky tile holding an arrow.
 * `size="lg"` is the hero CTA; the default fits the navbar.
 */
export function SplitButton({
  to,
  children,
  size = 'md',
  className,
}: {
  to: LinkProps['to']
  children: React.ReactNode
  size?: 'md' | 'lg'
  className?: string
}) {
  const lg = size === 'lg'
  return (
    <Link
      to={to}
      className={cn(
        'group focus-visible:ring-ring focus-visible:ring-offset-background inline-flex shrink-0 items-stretch overflow-hidden rounded-full font-medium shadow-sm transition-[transform,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
        lg ? 'text-base' : 'text-sm',
        className,
      )}
    >
      <span
        className={cn(
          'bg-foreground text-background group-hover:bg-foreground/90 flex items-center transition-colors',
          lg ? 'h-12 pr-5 pl-6' : 'h-10 pr-4 pl-5',
        )}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'bg-brand-sky flex items-center justify-center text-[#0b0f15] transition-colors group-hover:bg-[#7ec1f2]',
          lg ? 'w-12' : 'w-10',
        )}
      >
        <ArrowDownRight
          className={cn(
            'transition-transform duration-200 group-hover:-rotate-45',
            lg ? 'size-5' : 'size-4',
          )}
        />
      </span>
    </Link>
  )
}
