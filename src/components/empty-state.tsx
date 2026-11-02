import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

/** The dashed box shown when a list has nothing in it yet. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border flex flex-col items-center rounded-3xl border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="text-muted-foreground mb-4 [&_svg]:size-7" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-lg font-medium">{title}</p>
      {children && (
        <div className="text-muted-foreground mt-1.5 max-w-md text-sm">{children}</div>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
