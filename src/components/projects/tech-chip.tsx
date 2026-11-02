import { cn } from '#/lib/utils'

/** A mono tag pill for a technology or a blog tag. */
export function TechChip({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'bg-muted/70 text-foreground/80 ring-border/70 inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] whitespace-nowrap ring-1',
        className,
      )}
    >
      {children}
    </span>
  )
}
