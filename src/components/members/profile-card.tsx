import { lazy, Suspense } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { avatarUrl } from '#/lib/files'
import { initialsPortrait } from './portrait'
import { PROFILE_CARD_VARS } from '#/components/bits-theme'

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
  // The card is 340px wide; 960 stays sharp on high-density screens.
  const photo = avatarUrl(user, 960) ?? initialsPortrait(user.name)
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
          statusColor="var(--success)"
          style={PROFILE_CARD_VARS}
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
