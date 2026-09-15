import { Link } from '@tanstack/react-router'
import {
  Award,
  BookOpen,
  CalendarDays,
  Code2,
  FileText,
  Github,
  Inbox,
  LayoutDashboard,
  Library,
  Mail,
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
  { to: '/admin/applications', label: 'Applications', icon: UserCheck },
  { to: '/admin/submissions', label: 'Submissions', icon: Code2 },
  { to: '/admin/challenges', label: 'Challenges', icon: FileText },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/projects', label: 'Projects', icon: Library },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen },
  { to: '/admin/resources', label: 'Resources', icon: Library },
  { to: '/admin/badges', label: 'Badges', icon: Award },
  { to: '/admin/github', label: 'GitHub org', icon: Github },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/users', label: 'Users', icon: Users, minRole: 'admin' },
  { to: '/admin/officers', label: 'Officers', icon: ShieldCheck, minRole: 'admin' },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
] as const

export function AdminNav({
  role,
  onNavigate,
  className,
}: {
  role: Role
  onNavigate?: () => void
  className?: string
}) {
  return (
    <nav aria-label="Admin" className={cn('flex flex-col gap-0.5', className)}>
      {ADMIN_NAV.map((item) => {
        const locked = 'minRole' in item && !hasRole(role, item.minRole)
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: 'exact' in item && item.exact }}
            className={cn(
              'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm',
              locked && 'pointer-events-none opacity-40',
            )}
            activeProps={{ className: 'bg-sidebar-accent text-foreground font-medium' }}
            aria-disabled={locked || undefined}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
