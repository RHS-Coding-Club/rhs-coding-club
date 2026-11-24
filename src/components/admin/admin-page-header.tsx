import { cn } from '#/lib/utils'

/**
 * The title block every admin page opens with. `eyebrow` is optional context
 * that says something the title doesn't (the challenge's week, the event a
 * page belongs to); a bare section name adds nothing, so leave it out.
 */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-muted-foreground mb-1.5 text-sm font-medium">{eyebrow}</p>
        )}
        <h1 className="text-3xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2.5 max-w-prose text-sm text-pretty sm:text-[0.9375rem]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
