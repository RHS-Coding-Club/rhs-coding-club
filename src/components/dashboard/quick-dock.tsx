import { useRouter } from '@tanstack/react-router'
import {
  CalendarDays,
  Code2,
  FolderPlus,
  Github,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import Dock from '#/components/bits/Dock'
import type { DockItemData } from '#/components/bits/Dock'

/**
 * React Bits Dock as the dashboard's quick actions: icons magnify under the
 * cursor and name themselves on hover; arrow keys move between them.
 */
export function QuickDock({
  dark,
  isMember,
  isOfficer,
}: {
  dark: boolean
  isMember: boolean
  isOfficer: boolean
}) {
  const router = useRouter()
  const go = (path: string) => () => router.history.push(path)
  const icon = (Icon: typeof Code2) => <Icon className="size-[45%]" strokeWidth={1.8} />
  const items: DockItemData[] = [
    { label: 'Challenges', icon: icon(Code2), onClick: go('/challenges') },
    { label: 'Events', icon: icon(CalendarDays), onClick: go('/events') },
    ...(isMember
      ? [
          {
            label: 'Submit a project',
            icon: icon(FolderPlus),
            onClick: go('/projects/new'),
          },
        ]
      : []),
    { label: 'GitHub org', icon: icon(Github), onClick: go('/github') },
    { separator: true },
    { label: 'Account', icon: icon(UserCog), onClick: go('/account') },
    ...(isOfficer
      ? [{ label: 'Admin', icon: icon(ShieldCheck), onClick: go('/admin') }]
      : []),
  ]
  return (
    <nav aria-label="Quick actions" className="relative mx-auto h-[104px] w-full">
      <Dock
        items={items}
        theme={dark ? 'dark' : 'light'}
        position="bottom"
        baseItemSize={48}
        magnification={68}
        panelHeight={64}
        distance={160}
        accentColor="#5fb2ee"
        showIndicators={false}
        className="bottom-2!"
      />
    </nav>
  )
}
