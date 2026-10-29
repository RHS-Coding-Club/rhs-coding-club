import { ArrowUpRight, Bookmark, BookmarkCheck, Clock } from 'lucide-react'
import ClickSpark from '#/components/bits/ClickSpark'
import { LEVEL_LABEL, resourceDomain } from '#/lib/schemas/resources'
import type { Level } from '#/lib/schemas/resources'
import { cn } from '#/lib/utils'

export interface ResourceCardData {
  id: string
  title: string
  description: string
  url: string
  tags: string[]
  level: Level
  approved: boolean
  saved: boolean
}

const LEVEL_DOT: Record<Level, string> = {
  beginner: 'bg-[#5fb2ee]',
  intermediate: 'bg-[#2a7fc4]',
  advanced: 'bg-[#1f4f8a] dark:bg-[#9ccbf2]',
}

/**
 * One resource: level and domain, the title as the link (new tab), a line
 * of description, and tags. Signed-in visitors get a bookmark toggle that
 * throws sparks when it saves.
 */
export function ResourceCard({
  resource,
  canSave,
  onToggleSave,
  onTag,
  busy,
}: {
  resource: ResourceCardData
  canSave: boolean
  onToggleSave: () => void
  onTag: (tag: string) => void
  busy?: boolean
}) {
  const r = resource
  const domain = resourceDomain(r.url)
  return (
    <article
      className={cn(
        'group bg-card relative flex h-full flex-col rounded-3xl p-6 ring-1 transition-[box-shadow,transform] duration-300 hover:shadow-[var(--bits-shadow)]',
        r.approved ? 'ring-border/70' : 'border-brand-sky/55 border border-dashed ring-0',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-foreground/80 inline-flex items-center gap-1.5 font-medium">
            <span
              aria-hidden="true"
              className={cn('size-2 rounded-full', LEVEL_DOT[r.level])}
            />
            {LEVEL_LABEL[r.level]}
          </span>
          <span className="truncate font-mono">{domain}</span>
        </div>
        {canSave && (
          <ClickSpark
            sparkColor={['#5fb2ee', '#9ccbf2', '#2a7fc4']}
            sparkCount={10}
            sparkRadius={22}
            sparkSize={7}
            duration={450}
            disabled={r.saved}
            className="z-[2] -mt-1.5 -mr-1.5 size-9! shrink-0"
          >
            <button
              type="button"
              onClick={onToggleSave}
              disabled={busy}
              aria-pressed={r.saved}
              aria-label={r.saved ? `Remove ${r.title} from saved` : `Save ${r.title}`}
              className={cn(
                'focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-3 disabled:opacity-60',
                r.saved
                  ? 'text-brand-sky bg-brand-sky/12'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {r.saved ? (
                <BookmarkCheck className="size-[18px]" aria-hidden="true" />
              ) : (
                <Bookmark className="size-[18px]" aria-hidden="true" />
              )}
            </button>
          </ClickSpark>
        )}
      </div>

      <h3 className="mt-4 text-xl leading-snug font-semibold tracking-[-0.02em]">
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-visible:ring-ring/50 rounded-md outline-none after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:ring-3"
        >
          {r.title}
          <ArrowUpRight
            className="text-muted-foreground group-hover:text-brand-sky ml-1 inline size-4 -translate-y-px transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </h3>
      <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
        {r.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
        {!r.approved && (
          <span className="bg-brand-sky/12 text-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
            <Clock className="size-3" aria-hidden="true" />
            Pending review
          </span>
        )}
        {r.tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTag(t)}
            className="bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative z-[2] rounded-full px-2.5 py-1 font-mono text-xs transition-colors outline-none focus-visible:ring-3"
          >
            #{t}
          </button>
        ))}
      </div>
    </article>
  )
}
