import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { ArrowRight } from '#/components/icons/arrow-right'
import { cn } from '#/lib/utils'

/** A small "label →" link for a dashboard card's header. */
export function CardLink({
  to,
  params,
  children,
  className,
}: {
  to: LinkProps['to']
  params?: LinkProps['params']
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        'text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-md text-sm transition-colors',
        className,
      )}
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  )
}
