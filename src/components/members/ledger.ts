import type { PointSource } from '#/db/schema'

// Pure formatting for point-ledger rows, shared by the dashboard, the admin
// user detail, and unit tests. Rows come from `describedHistory` with a
// resolved `ref` (the challenge, event, or project behind the entry).

export type LedgerRefLike =
  | { kind: 'challenge'; id: string; title: string; weekNo: number }
  | { kind: 'event'; id: string; title: string }
  | { kind: 'project'; id: string; title: string }
  | null

export interface LedgerEntryLike {
  delta: number
  source: PointSource
  note: string | null
  ref: LedgerRefLike
}

/** "Passed Week 3: Reverse a linked list", "Attended: First Meeting", or the officer's note. */
export function ledgerLabel(e: LedgerEntryLike): string {
  const reversed = e.delta < 0
  switch (e.source) {
    case 'submission': {
      const what =
        e.ref?.kind === 'challenge' ? `Week ${e.ref.weekNo}: ${e.ref.title}` : null
      if (reversed) return what ? `Solve reversed, ${what}` : 'Challenge points reversed'
      return what ? `Passed ${what}` : 'Passed a weekly challenge'
    }
    case 'project': {
      const what = e.ref?.kind === 'project' ? e.ref.title : null
      if (reversed)
        return what ? `Project points reversed, ${what}` : 'Project points reversed'
      return what ? `Project approved: ${what}` : 'Project approved'
    }
    case 'attendance': {
      const what = e.ref?.kind === 'event' ? e.ref.title : null
      if (reversed) return what ? `Check-in removed, ${what}` : 'Check-in removed'
      return what ? `Attended: ${what}` : 'Attended an event'
    }
    case 'manual':
      return e.note?.trim() || (reversed ? 'Points correction' : 'Bonus from an officer')
  }
}

/** "+100", "-25", "0" with a real minus sign for screen readers and type. */
export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta.toLocaleString('en-US')}`
  if (delta < 0) return `−${Math.abs(delta).toLocaleString('en-US')}`
  return '0'
}

export const SOURCE_LABEL: Record<PointSource, string> = {
  submission: 'Challenge',
  project: 'Project',
  attendance: 'Event',
  manual: 'Manual',
}
