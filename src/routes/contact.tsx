import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarDays,
  Github,
  Instagram,
  Link2,
  MapPin,
  MessageCircle,
  Youtube,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { ContactForm } from '#/components/contact/contact-form'
import { ContactTitle } from '#/components/contact/contact-title'
import { getContactInfo } from '#/server/contact'

export const Route = createFileRoute('/contact')({
  loader: () => getContactInfo(),
  head: () => ({
    meta: [
      { title: 'Contact · RHS Coding Club' },
      {
        name: 'description',
        content:
          'Questions about joining, the Ripon Afterschool Program, or the H2O hackathon? Send the RHS Coding Club officers a message.',
      },
      { property: 'og:title', content: 'Contact · RHS Coding Club' },
      {
        property: 'og:description',
        content: 'Send the RHS Coding Club officers a message.',
      },
    ],
  }),
  component: ContactPage,
})

function ContactPage() {
  const { club, social } = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()

  const socials: { label: string; href: string; icon: LucideIcon }[] = [
    social.instagram && { label: 'Instagram', href: social.instagram, icon: Instagram },
    social.github && { label: 'GitHub', href: social.github, icon: Github },
    social.discord && { label: 'Discord', href: social.discord, icon: MessageCircle },
    social.youtube && { label: 'YouTube', href: social.youtube, icon: Youtube },
    ...social.customLinks.map((l) => ({ label: l.label, href: l.url, icon: Link2 })),
  ].filter((s): s is { label: string; href: string; icon: LucideIcon } => Boolean(s))

  return (
    <>
      <PageHero
        size="sm"
        background={
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_100%,rgba(95,178,238,0.35)_0%,transparent_70%)] dark:bg-[radial-gradient(60%_80%_at_85%_100%,rgba(31,79,138,0.55)_0%,transparent_70%)]" />
        }
        title={<span className="sr-only">Contact the RHS Coding Club</span>}
      >
        <ContactTitle initialDark={theme === 'dark'} />
        <p className="mt-4 max-w-2xl text-lg text-balance text-[#101826]/70 sm:text-xl dark:text-white/75">
          Parents, teachers, sponsors, future members: the officers read every message.
        </p>
      </PageHero>

      <section className="mx-auto grid max-w-6xl gap-10 px-(--gutter) py-16 sm:py-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
        <FadeUp>
          <ContactForm
            defaults={user ? { name: user.name, email: user.email } : undefined}
          />
        </FadeUp>

        <FadeUp delay={0.1} className="flex flex-col gap-10 lg:pt-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.025em]">
              Or find us at lunch
            </h2>
            <dl className="mt-5 flex flex-col gap-5">
              <Fact icon={CalendarDays} term="When" value={club.meetingSchedule} />
              <Fact icon={MapPin} term="Where" value={club.meetingLocation} />
            </dl>
          </div>

          {socials.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">Follow along</h2>
              <ul className="mt-4 flex flex-col">
                {socials.map((s) => (
                  <li key={s.href} className="border-border border-b first:border-t">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group hover:text-brand-sky focus-visible:ring-ring/50 flex items-center gap-3 rounded-md py-3.5 text-base outline-none focus-visible:ring-3"
                    >
                      <s.icon
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                      />
                      <span className="font-medium">{s.label}</span>
                      <span className="text-muted-foreground ml-auto truncate font-mono text-xs">
                        {s.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to="/"
            hash="faq"
            className="group bg-card ring-border/70 hover:ring-brand-sky/60 focus-visible:ring-ring/50 rounded-3xl p-6 ring-1 transition-shadow outline-none focus-visible:ring-3"
          >
            <p className="text-lg font-semibold tracking-[-0.02em]">
              Questions, answered
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Do you need experience, what to bring, volunteer hours, and how points work.
            </p>
            <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
              Read the FAQ
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        </FadeUp>
      </section>
    </>
  )
}

function Fact({
  icon: Icon,
  term,
  value,
}: {
  icon: LucideIcon
  term: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="text-brand-sky mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <dt className="text-muted-foreground text-sm">{term}</dt>
        <dd className="mt-0.5 text-lg font-medium">{value}</dd>
      </div>
    </div>
  )
}
