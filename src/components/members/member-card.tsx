import { useState } from 'react'
import { ArrowUpRight } from '#/components/icons/arrow-up-right'
import { Github } from '#/components/icons/github'
import { RotateCw } from '#/components/icons/rotate-cw'
import TiltedCard from '#/components/bits/TiltedCard'
import { avatarUrl } from '#/lib/files'
import { fmtDate, initials } from '#/lib/format'
import { ROLE_LABEL } from '#/lib/schemas/users'
import type { MemberProfile } from '#/services/members'

/**
 * A member as a collectible card in React Bits Tilted Card: it tilts toward
 * the pointer and flips on click, Enter, or the button under it.
 */
/** Front: portrait, name, role, three stats. Back: bio and skills. Click or Enter flips it. */
export function MemberCard({ p, dark }: { p: MemberProfile; dark: boolean }) {
  const [flipped, setFlipped] = useState(false)
  const { user, stats } = p
  const src = avatarUrl(user, 640)
  const frame = 'var(--brand-sky)'

  return (
    <div className="mx-auto flex w-[17.5rem] flex-col items-center gap-3 sm:w-[19rem] lg:mx-0">
      <TiltedCard
        containerHeight="26.5rem"
        containerWidth="100%"
        imageHeight="26.5rem"
        imageWidth="100%"
        rotateAmplitude={10}
        scaleOnHover={1.03}
        radius={26}
        glare={dark ? 0.5 : 0.65}
        shadow={dark ? 0.6 : 0.3}
        showTooltip={false}
        flipOnClick
        flipped={flipped}
        onFlip={setFlipped}
        captionText={`${user.name}'s member card. Press to flip.`}
        style={
          {
            '--tc-shadow-color': dark
              ? 'rgba(0,0,0,0.6)'
              : 'color-mix(in srgb, var(--brand-navy) 35%, transparent)',
          } as React.CSSProperties
        }
        backContent={
          <div className="bg-card flex h-full flex-col p-6 text-left">
            <p className="text-muted-foreground font-mono text-[11px] tracking-wide">
              No. {user.id.slice(-4).toUpperCase()} · since{' '}
              {fmtDate(user.createdAt, 'date')}
            </p>
            <p className="mt-4 text-lg leading-snug font-medium text-pretty">
              {user.bio ?? `${user.name.split(' ')[0]} hasn't written a bio yet.`}
            </p>
            {user.skills.length > 0 && (
              <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Skills">
                {user.skills.map((s) => (
                  <li key={s} className="bg-muted rounded-md px-2 py-1 font-mono text-xs">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        }
      >
        <div
          className="absolute inset-0 p-[5px]"
          style={{
            background: `linear-gradient(150deg, color-mix(in oklab, ${frame} 85%, white), ${frame} 40%, color-mix(in oklab, ${frame} 55%, black))`,
          }}
        >
          <div className="bg-brand-ink relative flex h-full flex-col overflow-hidden rounded-[22px]">
            <div className="relative h-[62%] overflow-hidden">
              {src ? (
                <img src={src} alt="" className="size-full object-cover" />
              ) : (
                <div className="brand-gradient grid size-full place-items-center">
                  <span className="text-7xl font-semibold tracking-[-0.05em] text-white/90">
                    {initials(user.name)}
                  </span>
                </div>
              )}
              <span className="absolute top-3 left-3 rounded-full bg-black/35 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur">
                {ROLE_LABEL[user.role]}
                {user.gradYear ? ` · ’${String(user.gradYear).slice(2)}` : ''}
              </span>
            </div>
            <div className="flex flex-1 flex-col px-5 pt-4 pb-5 text-brand-frost">
              <p className="truncate text-2xl font-semibold tracking-[-0.03em]">
                {user.name}
              </p>
              <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-white/12 pt-3">
                {[
                  { n: stats.allTime.toLocaleString('en-US'), l: 'Points' },
                  { n: stats.rank ? `#${stats.rank}` : 'None', l: 'Rank' },
                  { n: String(stats.solved), l: 'Solves' },
                ].map((s) => (
                  <div key={s.l}>
                    <dt className="text-[11px] text-brand-frost/60">{s.l}</dt>
                    <dd className="font-mono text-lg font-medium tabular-nums">{s.n}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </TiltedCard>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="text-ink/60 hover:text-ink inline-flex items-center gap-1.5 rounded-md text-sm transition-colors"
      >
        <RotateCw className="size-3.5" aria-hidden="true" />
        {flipped ? 'Show the front' : 'Flip the card'}
      </button>
    </div>
  )
}

/** The member's GitHub handle as a pill for the profile hero. */
export function GithubLink({ user }: { user: MemberProfile['user'] }) {
  if (!user.githubUsername) return null
  return (
    <a
      href={`https://github.com/${user.githubUsername}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-ink/8 px-4 py-2 font-mono text-sm text-ink ring-1 ring-ink/12 transition-colors hover:bg-ink/14"
    >
      <Github className="size-4" aria-hidden="true" />
      {user.githubUsername}
      <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
    </a>
  )
}
