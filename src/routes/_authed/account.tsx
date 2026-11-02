import { createFileRoute } from '@tanstack/react-router'
import { KeyRound, Mail, Trash2, UserRound } from 'lucide-react'
import { DangerZone } from '#/components/account/danger-zone'
import { EmailPrefs } from '#/components/account/email-prefs'
import { ProfileForm } from '#/components/account/profile-form'
import { SignInMethods } from '#/components/account/sign-in-methods'
import { FadeUp } from '#/components/motion'
import { OutlineMenu } from '#/components/outline-menu'
import type { OutlineSection } from '#/components/outline-menu'
import { expandPrefs } from '#/lib/schemas/account'
import { ROLE_LABEL } from '#/lib/schemas/users'
import { cn } from '#/lib/utils'
import { getMyAccount } from '#/server/account'

export const Route = createFileRoute('/_authed/account')({
  loader: () => getMyAccount(),
  head: () => ({
    meta: [
      { title: 'Account settings · RHS Coding Club' },
      { name: 'description', content: 'Your profile, email, and sign-in settings.' },
    ],
  }),
  component: AccountPage,
})

const OUTLINE: OutlineSection[] = [
  { id: 'profile', label: 'Profile', icon: <UserRound className="size-3.5" /> },
  { id: 'email', label: 'Email', icon: <Mail className="size-3.5" /> },
  { id: 'sign-in', label: 'Sign-in methods', icon: <KeyRound className="size-3.5" /> },
  { id: 'danger', label: 'Delete account', icon: <Trash2 className="size-3.5" /> },
]

function AccountPage() {
  const { user, accounts, providers } = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-6xl px-(--gutter) pt-10 pb-16 sm:pt-16 sm:pb-24">
      <FadeUp>
        <h1 className="text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.045em]">
          Account settings
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Signed in as <span className="text-foreground">{user.email}</span> ·{' '}
          {ROLE_LABEL[user.role]}
        </p>
      </FadeUp>

      <div className="mt-12 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <OutlineMenu
            sections={OUTLINE}
            title="Settings"
            startActive
            className="sticky top-32"
          />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            id="profile"
            title="Profile"
            description="Shown on your public profile and the leaderboard."
          >
            <ProfileForm
              initial={{
                name: user.name,
                bio: user.bio,
                gradYear: user.gradYear,
                skills: user.skills,
                githubUsername: user.githubUsername,
                avatarKey: user.avatarKey,
                image: user.image,
              }}
            />
          </Panel>
          <Panel
            id="email"
            title="Email"
            description="Pick what the club emails you about. The newsletter has its own unsubscribe link."
            delay={0.05}
          >
            <EmailPrefs initial={expandPrefs(user.emailPrefs)} />
          </Panel>
          <Panel
            id="sign-in"
            title="Sign-in methods"
            description="Ways you can sign in. Keep at least one."
            delay={0.05}
          >
            <SignInMethods accounts={accounts} providers={providers} email={user.email} />
          </Panel>
          <Panel id="danger" title="Delete account" danger delay={0.05}>
            <DangerZone
              hasPassword={accounts.some((a) => a.providerId === 'credential')}
            />
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Panel({
  id,
  title,
  description,
  danger,
  delay,
  children,
}: {
  id: string
  title: string
  description?: string
  danger?: boolean
  delay?: number
  children: React.ReactNode
}) {
  return (
    <FadeUp delay={delay}>
      <section
        id={id}
        aria-labelledby={`${id}-title`}
        className={cn(
          'bg-card scroll-mt-32 rounded-3xl p-6 ring-1 sm:p-8',
          danger ? 'ring-destructive/30' : 'ring-border/70',
        )}
      >
        <h2
          id={`${id}-title`}
          className={cn(
            'text-2xl font-semibold tracking-[-0.03em]',
            danger && 'text-destructive',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </section>
    </FadeUp>
  )
}
