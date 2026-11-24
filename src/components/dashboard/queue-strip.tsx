import { Link } from '@tanstack/react-router'
import { FadeUp } from '#/components/motion'
import { CardLink } from './card-link'
import type { MemberDash } from './season'

const QUEUES = [
  {
    key: 'pendingApplications',
    label: ['application', 'applications'],
    to: '/admin/applications',
  },
  {
    key: 'pendingSubmissions',
    label: ['submission', 'submissions'],
    to: '/admin/submissions',
  },
  { key: 'pendingProjects', label: ['project', 'projects'], to: '/admin/projects' },
  {
    key: 'pendingGithubRequests',
    label: ['GitHub request', 'GitHub requests'],
    to: '/admin/github',
  },
  { key: 'unreadMessages', label: ['message', 'messages'], to: '/admin/messages' },
] as const

/** Officers: one line saying what's waiting, each queue a chip into admin. */
export function QueueStrip({ queues }: { queues: NonNullable<MemberDash['queues']> }) {
  const waiting = QUEUES.filter((q) => queues[q.key] > 0)
  const total = waiting.reduce((s, q) => s + queues[q.key], 0)
  return (
    <FadeUp>
      <div
        className="ring-border/70 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-3xl px-5 py-4 ring-1 sm:px-6"
        style={{ background: 'var(--bits-surface)' }}
      >
        <p className="font-medium">
          {total === 0
            ? 'Officer queues are all clear.'
            : `${total} waiting for officers`}
        </p>
        <ul className="flex flex-1 flex-wrap gap-2">
          {waiting.map((q) => (
            <li key={q.key}>
              <Link
                to={q.to}
                className="bg-muted/60 hover:bg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors"
              >
                <span className="font-mono font-medium tabular-nums">
                  {queues[q.key]}
                </span>
                {queues[q.key] === 1 ? q.label[0] : q.label[1]}
              </Link>
            </li>
          ))}
        </ul>
        <CardLink to="/admin">Open admin</CardLink>
      </div>
    </FadeUp>
  )
}
