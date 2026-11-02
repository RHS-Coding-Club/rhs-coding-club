import { Link, useRouter } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import {
  Code2,
  FolderPlus,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { signOut } from '#/lib/auth-client'
import { avatarUrl } from '#/lib/files'
import { initials } from '#/lib/format'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import { cn } from '#/lib/utils'
import type { SessionUser } from '#/server/auth'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

const ROLE: Record<Role, { label: string; tone: string }> = {
  guest: {
    label: 'Awaiting approval',
    tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  member: { label: 'Member', tone: 'bg-brand-sky/15 text-brand-navy dark:text-sky-200' },
  officer: {
    label: 'Officer',
    tone: 'bg-brand-sky/25 text-brand-navy dark:text-sky-100',
  },
  admin: { label: 'Admin', tone: 'bg-foreground text-background' },
}

/**
 * The avatar menu in the header. Opens into a glass card in the same
 * language as Card Nav: who you are up top (avatar, name, email, role),
 * then the places you go most as tiles, then sign out. Guests get "Apply
 * to join" in place of their profile.
 */
export function AccountMenu({ user }: { user: SessionUser }) {
  const router = useRouter()
  const isMember = hasRole(user.role, 'member')
  const isOfficer = hasRole(user.role, 'officer')
  const role = ROLE[user.role]

  async function handleSignOut() {
    await signOut()
    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group focus-visible:ring-ring mr-1 rounded-full outline-none focus-visible:ring-2"
          aria-label="Account menu"
        >
          <Avatar className="ring-border group-hover:ring-foreground/30 group-data-[state=open]:ring-brand-sky size-9 ring-2 ring-offset-2 ring-offset-transparent transition-shadow">
            <AvatarImage src={avatarUrl(user)} alt="" />
            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={18}
        className="w-[19rem] rounded-3xl border-0 p-2 shadow-[var(--bits-shadow)] ring-1 ring-[color:var(--bits-edge)] backdrop-blur-xl backdrop-saturate-150"
        style={{ background: 'var(--bits-glass)' }}
      >
        <div className="relative overflow-hidden rounded-2xl p-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(90%_120%_at_100%_0%,rgba(95,178,238,0.35)_0%,transparent_60%)] dark:bg-[radial-gradient(90%_120%_at_100%_0%,rgba(95,178,238,0.25)_0%,transparent_60%)]"
          />
          <div className="relative flex items-center gap-3">
            <Avatar className="size-12 rounded-2xl">
              <AvatarImage src={avatarUrl(user)} alt="" className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl text-sm">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold tracking-[-0.01em]">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user.email}</p>
              <span
                className={cn(
                  'mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium',
                  role.tone,
                )}
              >
                {role.label}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuGroup className="mt-1 grid grid-cols-2 gap-1">
          <Tile to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          {isMember ? (
            <Tile
              to="/members/$id"
              params={{ id: user.id }}
              icon={UserRound}
              label="Profile"
            />
          ) : (
            <Tile to="/join" icon={Sparkles} label="Apply to join" />
          )}
          <Tile to="/account" icon={UserCog} label="Settings" />
          {isOfficer ? (
            <Tile to="/admin" icon={ShieldCheck} label="Admin" />
          ) : isMember ? (
            <Tile to="/projects/new" icon={FolderPlus} label="New project" />
          ) : (
            <Tile to="/challenges" icon={Code2} label="Challenges" />
          )}
        </DropdownMenuGroup>

        <div className="bg-border/70 mx-2 my-2 h-px" />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="text-muted-foreground focus:text-foreground rounded-xl px-3 py-2.5"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Tile({
  to,
  params,
  icon: Icon,
  label,
}: {
  to: LinkProps['to']
  params?: LinkProps['params']
  icon: LucideIcon
  label: string
}) {
  return (
    <DropdownMenuItem
      asChild
      className="focus:bg-foreground/[0.06] flex h-auto flex-col items-start gap-3 rounded-2xl p-3"
    >
      <Link to={to} params={params}>
        <span className="bg-foreground/[0.06] grid size-8 place-items-center rounded-xl">
          <Icon className="text-foreground size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
