import { useEffect, useState } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import Folder from '#/components/bits/Folder'
import { LEVELS, LEVEL_BLURB, LEVEL_LABEL, resourceDomain } from '#/lib/schemas/resources'
import type { Level } from '#/lib/schemas/resources'
import { cn } from '#/lib/utils'

/** Folder tint per level: light sky for beginners down to deep navy. */
const LEVEL_COLOR: Record<Level, string> = {
  beginner: '#5fb2ee',
  intermediate: '#2a7fc4',
  advanced: '#1f4f8a',
}

function useWide() {
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const read = () => setWide(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])
  return wide
}

/**
 * The level filter: three React Bits folders, one per level. Opening a
 * folder selects that level (the others close); closing it shows every
 * level again. Each folder holds the first few resources of its level as
 * papers that fan out when it opens.
 */
export function LevelFolders({
  selected,
  onSelect,
  counts,
  previews,
  dark,
}: {
  selected: Level | null
  onSelect: (level: Level | null) => void
  counts: Record<Level, number>
  previews: Record<Level, { title: string; url: string }[]>
  dark: boolean
}) {
  return (
    <div
      role="group"
      aria-label="Filter by level"
      className="grid grid-cols-3 items-start gap-2 sm:gap-6"
    >
      {LEVELS.map((level) => {
        const open = selected === level
        return (
          <div key={level} className="flex flex-col items-center text-center">
            <div className="flex h-[128px] items-end justify-center pt-8 md:h-[260px] md:pt-16">
              <ClientOnly fallback={<FolderFallback level={level} />}>
                <LevelFolder
                  level={level}
                  open={open}
                  onOpenChange={(next) => onSelect(next ? level : null)}
                  papers={previews[level]}
                  dark={dark}
                />
              </ClientOnly>
            </div>
            <button
              type="button"
              onClick={() => onSelect(open ? null : level)}
              aria-pressed={open}
              className={cn(
                'mt-3 rounded-2xl px-2 py-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:mt-5 sm:px-4',
                open ? 'bg-brand-sky/12' : 'hover:bg-muted/70',
              )}
            >
              <span className="block text-base font-semibold tracking-[-0.02em] sm:text-2xl">
                {LEVEL_LABEL[level]}
              </span>
              <span className="text-muted-foreground tabular mt-0.5 block font-mono text-xs sm:text-sm">
                {counts[level]} {counts[level] === 1 ? 'link' : 'links'}
              </span>
              <span className="text-muted-foreground mt-2 hidden max-w-[16rem] text-sm text-balance md:block">
                {LEVEL_BLURB[level]}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function LevelFolder({
  level,
  open,
  onOpenChange,
  papers,
  dark,
}: {
  level: Level
  open: boolean
  onOpenChange: (open: boolean) => void
  papers: { title: string; url: string }[]
  dark: boolean
}) {
  const wide = useWide()
  const items =
    papers.length > 0
      ? papers.slice(0, 3).map((p) => ({
          content: <Paper title={p.title} domain={resourceDomain(p.url)} />,
        }))
      : [{ content: <Paper title="Coming soon" domain="" /> }]
  return (
    <Folder
      label={LEVEL_LABEL[level]}
      items={items}
      color={LEVEL_COLOR[level]}
      paperColor={dark ? '#e8eef6' : '#ffffff'}
      theme={dark ? 'dark' : 'light'}
      size={wide ? 1 : 0.46}
      open={open}
      onOpenChange={onOpenChange}
      onItemClick={(_item, index) => {
        const url = papers[index]?.url
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
      }}
      layout={wide ? 'spread' : 'stack'}
      draggable={false}
      zoomOnClick={false}
      closeOnOutsideClick={false}
      tilt={0.6}
    />
  )
}

/** Same footprint as the folder, while the client chunk mounts. */
function FolderFallback({ level }: { level: Level }) {
  return (
    <div
      aria-hidden="true"
      className="h-[90px] w-[103px] rounded-[6px] opacity-80 md:h-[196px] md:w-[224px] md:rounded-xl"
      style={{ background: LEVEL_COLOR[level] }}
    />
  )
}

/** A resource as a sheet of paper inside the folder: title, site, and ruled lines. */
function Paper({ title, domain }: { title: string; domain: string }) {
  const u = (px: number) => `calc(${px}px * var(--folder-scale))`
  return (
    <div
      className="flex h-full flex-col text-left"
      style={{
        padding: `${u(12)} ${u(11)}`,
        gap: u(5),
        color: 'var(--folder-paper-text)',
      }}
    >
      <span
        className="line-clamp-3 leading-[1.15] font-semibold tracking-[-0.01em]"
        style={{ fontSize: u(12) }}
      >
        {title}
      </span>
      {domain && (
        <span
          className="truncate font-mono"
          style={{ fontSize: u(8), color: 'var(--folder-paper-ink-strong)' }}
        >
          {domain}
        </span>
      )}
      <span className="mt-auto flex flex-col" style={{ gap: u(5) }} aria-hidden="true">
        {[92, 84, 88, 70].map((w) => (
          <span
            key={w}
            className="block rounded-full"
            style={{
              width: `${w}%`,
              height: u(4),
              background: 'var(--folder-paper-ink)',
            }}
          />
        ))}
      </span>
    </div>
  )
}
