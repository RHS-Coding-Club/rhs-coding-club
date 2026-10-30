import { Link } from '@tanstack/react-router'
import {
  Award,
  BookOpen,
  CalendarDays,
  Code2,
  FileText,
  FolderGit2,
  Github,
  Inbox,
  LayoutDashboard,
  Library,
  Mail,
  RotateCcw,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import { cn } from '#/lib/utils'

export const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  {
    to: '/admin/applications',
    label: 'Applications',
    icon: UserCheck,
    queue: 'pendingApplications',
  },
  {
    to: '/admin/submissions',
    label: 'Submissions',
    icon: Code2,
    queue: 'pendingSubmissions',
  },
  { to: '/admin/challenges', label: 'Challenges', icon: FileText },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  {
    to: '/admin/projects',
    label: 'Projects',
    icon: FolderGit2,
    queue: 'pendingProjects',
  },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen },
  { to: '/admin/resources', label: 'Resources', icon: Library },
  { to: '/admin/badges', label: 'Badges', icon: Award },
  {
    to: '/admin/github',
    label: 'GitHub org',
    icon: Github,
    queue: 'pendingGithubRequests',
  },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { to: '/admin/messages', label: 'Messages', icon: Inbox, queue: 'unreadMessages' },
  { to: '/admin/users', label: 'Users', icon: Users, minRole: 'admin' },
  { to: '/admin/officers', label: 'Officers', icon: ShieldCheck, minRole: 'admin' },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/reset', label: 'Reset data', icon: RotateCcw, minRole: 'admin' },
] as const

/** Overview counts that badge a nav item (see `getAdminOverview`). */
export type AdminQueueKey =
  | 'pendingApplications'
  | 'pendingSubmissions'
  | 'pendingProjects'
  | 'pendingGithubRequests'
  | 'unreadMessages'

/** The full admin page list, used in the dock's "More" sheet on phones. */
export function AdminNav({
  role,
  counts,
  onNavigate,
  className,
}: {
  role: Role
  counts?: Partial<Record<AdminQueueKey, number>>
  onNavigate?: () => void
  className?: string
}) {
  return (
    <nav aria-label="Admin" className={cn('flex flex-col gap-0.5', className)}>
      {ADMIN_NAV.map((item) => {
        const locked = 'minRole' in item && !hasRole(role, item.minRole)
        const Icon = item.icon
        const n = 'queue' in item ? (counts?.[item.queue] ?? 0) : 0
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: 'exact' in item && item.exact }}
            className={cn(
              'text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm',
              locked && 'pointer-events-none opacity-40',
            )}
            activeProps={{ className: 'bg-muted text-foreground font-medium' }}
            aria-disabled={locked || undefined}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
            {n > 0 && (
              <span className="tabular ml-auto rounded-full bg-[#e5484d] px-1.5 py-0.5 font-mono text-[11px] leading-none text-white">
                {n}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
