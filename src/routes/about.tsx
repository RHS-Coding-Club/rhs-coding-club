import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarDays, Github, Instagram, MapPin } from 'lucide-react'
import { getAbout } from '#/server/public'
import { initials } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

export const Route = createFileRoute('/about')({
  loader: () => getAbout(),
  head: () => ({ meta: [{ title: 'About · RHS Coding Club' }] }),
  component: AboutPage,
})

function AboutPage() {
  const { club, social, officers } = Route.useLoaderData()

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
        <p className="eyebrow">Who we are</p>
        <h1 className="font-display mt-3 max-w-3xl text-6xl leading-[0.95] sm:text-7xl">
          {club.tagline}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg">{club.description}</p>

        <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
          <div className="flex gap-3">
            <CalendarDays className="text-primary mt-1 size-5 shrink-0" />
            <div>
              <dt className="eyebrow">When we meet</dt>
              <dd className="mt-1">{club.meetingSchedule}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="text-primary mt-1 size-5 shrink-0" />
            <div>
              <dt className="eyebrow">Where</dt>
              <dd className="mt-1">{club.meetingLocation}</dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="border-border border-y">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <p className="eyebrow">Mission</p>
          <p className="font-display text-3xl leading-snug sm:text-4xl">
            {club.missionStatement}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Officers</p>
            <h2 className="font-display mt-1 text-4xl">The people running it</h2>
          </div>
          <div className="flex gap-2">
            {social.instagram && (
              <Button asChild variant="outline" size="sm">
                <a href={social.instagram} target="_blank" rel="noreferrer">
                  <Instagram className="size-4" />
                  Instagram
                </a>
              </Button>
            )}
            {social.github && (
              <Button asChild variant="outline" size="sm">
                <a href={social.github} target="_blank" rel="noreferrer">
                  <Github className="size-4" />
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </div>

        {officers.length === 0 ? (
          <p className="text-muted-foreground border-border rounded-lg border border-dashed px-5 py-8 text-center text-sm">
            Officer profiles are on their way.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {officers.map((o) => (
              <li key={o.id} className="border-border flex gap-4 rounded-lg border p-5">
                <Avatar className="size-14">
                  <AvatarImage
                    src={o.imageKey ? `/files/${o.imageKey}` : undefined}
                    alt=""
                  />
                  <AvatarFallback>{initials(o.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl leading-tight">{o.name}</h3>
                  <p className="eyebrow mt-0.5">{o.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">{o.bio}</p>
                  {o.githubUrl && (
                    <a
                      href={o.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary mt-2 inline-flex items-center gap-1 font-mono text-xs hover:underline"
                    >
                      <Github className="size-3.5" />
                      {o.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="brand-gradient flex flex-wrap items-center justify-between gap-6 rounded-lg px-6 py-8 sm:px-10">
          <div>
            <p className="eyebrow text-brand-frost/80">Open to all RHS students</p>
            <p className="font-display text-brand-frost mt-1 text-3xl sm:text-4xl">
              No experience required. Bring curiosity.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-brand-frost text-brand-navy hover:bg-white"
          >
            <Link to="/join">How to join</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
