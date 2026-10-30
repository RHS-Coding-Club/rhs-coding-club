import { lazy, Suspense } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { avatarUrl } from '#/lib/files'
import { initialsPortrait } from './portrait'

const ProfileCard = lazy(() => import('#/components/bits/ProfileCard'))

/**
 * React Bits Profile Card: the holographic member card that tilts and
 * catches light under the cursor. Client-only (it measures and animates);
 * the server renders a same-size placeholder so the layout never jumps.
 */
export function MemberProfileCard({
  user,
  title,
  dark,
}: {
  user: {
    name: string
    image: string | null
    avatarKey: string | null
    githubUsername: string | null
  }
  title: string
  dark: boolean
}) {
  const photo = avatarUrl(user) ?? initialsPortrait(user.name)
  const fallback = (
    <div
      aria-hidden="true"
      className="aspect-[4/5.6] w-[340px] max-w-full rounded-[34px] bg-[var(--bits-glass)]"
    />
  )
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <ProfileCard
          avatarUrl={photo}
          miniAvatarUrl={photo}
          name={user.name}
          title={title}
          handle={user.githubUsername ?? undefined}
          status="RHS Coding Club"
          contactText={user.githubUsername ? 'GitHub' : ''}
          onContactClick={() => {
            if (user.githubUsername)
              window.open(
                `https://github.com/${user.githubUsername}`,
                '_blank',
                'noopener',
              )
          }}
          showUserInfo
          theme={dark ? 'dark' : 'light'}
          radius={24}
          holo={0.9}
          glare={0.7}
          enableTilt
          enableMobileTilt={false}
          intro
        />
      </Suspense>
    </ClientOnly>
  )
}
