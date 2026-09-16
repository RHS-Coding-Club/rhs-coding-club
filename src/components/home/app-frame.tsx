import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'
import { Logo } from '#/components/logo'

/**
 * Window chrome around real product UI. The children are live components fed
 * by the route loader, never screenshots, so the frame is only a border, a
 * title bar, and a tinted shadow.
 */
export function AppFrame({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border bg-card text-card-foreground overflow-hidden rounded-2xl border text-left shadow-[0_40px_120px_-40px_rgba(31,79,138,0.55)]',
        className,
      )}
    >
      <div className="border-border flex h-10 items-center border-b px-4">
        <div className="flex w-14 gap-1.5" aria-hidden="true">
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
        </div>
        <div className="text-muted-foreground mx-auto flex items-center gap-2 font-mono text-xs">
          <Logo className="size-3.5" />
          {title}
        </div>
        <div className="w-14" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}
