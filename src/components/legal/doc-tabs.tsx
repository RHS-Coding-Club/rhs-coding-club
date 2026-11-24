import { Link } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import { DOC_TABS } from './types'
import type { LegalDoc } from './types'

/** Privacy and Terms as two halves of one pill, the current one raised. */
export function DocTabs({ kind }: { kind: LegalDoc['kind'] }) {
  return (
    <nav aria-label="Legal documents" data-print-hide>
      <ul className="inline-flex rounded-full bg-muted p-1 ring-1 ring-border">
        {DOC_TABS.map((t) => {
          const current = t.kind === kind
          return (
            <li key={t.kind}>
              <Link
                to={t.to}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'block rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  current
                    ? 'bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_1px_var(--border)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
