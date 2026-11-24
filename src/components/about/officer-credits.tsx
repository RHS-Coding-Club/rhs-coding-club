import type { AboutData } from '#/services/home'
import { Github } from '#/components/icons/github'
import { Instagram } from '#/components/icons/instagram'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { fileUrl } from '#/lib/files'
import { initials } from '#/lib/format'
import { safeHref } from '#/lib/rich-text'

/**
 * The officers as credits, after Efferd's team blocks: role, name, what they
 * do, one row each between full-width rules.
 */
export function OfficerCredits({
  officers,
  social,
}: {
  officers: AboutData['officers']
  social: AboutData['social']
}) {
  return (
    <section
      id="people"
      aria-labelledby="people-heading"
      className="mx-auto max-w-6xl scroll-mt-28 px-(--gutter) pb-20 sm:pb-28"
    >
      <FadeUp className="flex flex-wrap items-end justify-between gap-6">
        <h2
          id="people-heading"
          className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
        >
          The people running it
        </h2>
        <div className="flex gap-2">
          {social.instagram && (
            <RaisedButton asChild variant="outline">
              <a href={social.instagram} target="_blank" rel="noreferrer">
                <Instagram aria-hidden="true" />
                Instagram
              </a>
            </RaisedButton>
          )}
          {social.github && (
            <RaisedButton asChild variant="outline">
              <a href={social.github} target="_blank" rel="noreferrer">
                <Github aria-hidden="true" />
                GitHub
              </a>
            </RaisedButton>
          )}
        </div>
      </FadeUp>
      {officers.length === 0 ? (
        <p className="text-muted-foreground border-border mt-10 rounded-3xl border border-dashed px-5 py-14 text-center text-sm">
          Officer profiles are on their way.
        </p>
      ) : (
        <ul className="border-border mt-10 border-t">
          {officers.map((o, i) => (
            <li key={o.id} className="border-border border-b">
              <FadeUp
                delay={i * 0.05}
                distance={12}
                className="grid gap-4 py-8 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center lg:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10"
              >
                <p className="text-primary font-mono text-xs">{o.title}</p>
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar className="size-14 shrink-0">
                    <AvatarImage src={fileUrl(o.imageKey, 128)} alt="" />
                    <AvatarFallback>{initials(o.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                      {o.name}
                    </h3>
                    {o.githubUrl && (
                      <a
                        href={safeHref(o.githubUrl) ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground mt-1 inline-flex max-w-full items-center gap-1.5 font-mono text-xs transition-colors"
                      >
                        <Github className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {o.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
                {o.bio && (
                  <p className="text-muted-foreground text-[15px] leading-relaxed text-pretty sm:col-start-2 lg:col-start-auto">
                    {o.bio}
                  </p>
                )}
              </FadeUp>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
