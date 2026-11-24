import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import SpotlightCard from '#/components/bits/SpotlightCard'
import { ArrowRight } from '#/components/icons/arrow-right'
import { ArrowUpRight } from '#/components/icons/arrow-up-right'
import { CalendarDays } from '#/components/icons/calendar-days'
import { Clock } from '#/components/icons/clock'
import { Rocket } from '#/components/icons/rocket'
import { Users } from '#/components/icons/users'
import type { IconComponent } from '#/components/icons/create-icon'
import { ThreadsBackground } from '#/components/join/threads-bg'
import { FadeUp } from '#/components/motion'
import { PageHero } from '#/components/page-hero'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { fileUrl } from '#/lib/files'
import { initials } from '#/lib/format'
import { shortUrl, socialLinks } from './social-links'
import { TopicContactForm } from './topic-form'
import type { TopicId } from './topic-form'
import type { ContactPageData } from '#/services/contact'

const DOOR_LINK =
  'group/door text-primary focus-visible:ring-ring/50 inline-flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium outline-none focus-visible:ring-3 [&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-150 hover:[&_svg]:translate-x-0.5'

const SPOT = {
  '--spotlight-card-surface': 'var(--bits-surface)',
  '--spotlight-card-border': 'var(--bits-edge)',
} as CSSProperties

/**
 * /contact as a help desk: three doors first (join, get involved, show up),
 * because most visitors never need to write. Below them, the questions people
 * ask most beside the message form, and the club's channels at the foot.
 */
export function ContactHelpDesk({
  data,
  dark,
  defaults,
}: {
  data: ContactPageData
  dark: boolean
  defaults?: { name?: string; email?: string }
}) {
  const { club, social, officers } = data
  const [topic, setTopic] = useState<TopicId | null>(null)
  const links = socialLinks(social)

  function writeAbout(t: TopicId) {
    setTopic(t)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .getElementById('message')
      ?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
  }

  const faq = [
    {
      q: 'Do I need to email you to join?',
      a: 'No. Make an account, answer four short questions on the join page, and an officer approves you, usually within a week.',
    },
    {
      q: 'Can I come to a meeting before joining?',
      a: `Yes. ${club.meetingSchedule} in ${club.meetingLocation}. Anyone at RHS can drop in.`,
    },
    {
      q: 'Do members get volunteer hours?',
      a: 'Yes. Teaching at the Ripon Afterschool Program and helping run events count as community service. Officers sign off on hours after each session.',
    },
    {
      q: 'Can my company sponsor or judge H2O?',
      a: 'Please do. Pick “H2O hackathon” in the form and tell us what you have in mind. We reply with dates and what sponsors get.',
    },
    {
      q: 'How fast will I hear back?',
      a: 'Usually within a few school days. Replies come from the club’s Gmail, so check your spam folder if you don’t see one.',
    },
  ]

  return (
    <>
      <PageHero
        size="md"
        background={<ThreadsBackground initialDark={dark} />}
        title="How can we help?"
        description="Most answers are one click away. For everything else, write to the officers and a person replies."
      />

      <section
        aria-label="Common reasons to get in touch"
        className="mx-auto max-w-6xl px-(--gutter) pt-14 sm:pt-20"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          <Door
            index={0}
            dark={dark}
            icon={Rocket}
            title="I want to join"
            body="No email needed. Make an account, answer four questions, and an officer brings you in."
            action={
              <Link to="/join" className={DOOR_LINK}>
                Start your application
                <ArrowRight aria-hidden="true" />
              </Link>
            }
          />
          <Door
            index={1}
            dark={dark}
            icon={Users}
            title="Volunteer, sponsor, or judge"
            body="Teach at RAP, sponsor H2O, or judge a round. Tell us what you have in mind."
            action={
              <button
                type="button"
                className={DOOR_LINK}
                onClick={() => writeAbout('rap')}
              >
                Write to the officers
                <ArrowRight aria-hidden="true" />
              </button>
            }
          />
          <Door
            index={2}
            dark={dark}
            icon={CalendarDays}
            title="Come to a meeting"
            body={`${club.meetingSchedule} in ${club.meetingLocation}. Just show up.`}
            action={
              <Link to="/events" className={DOOR_LINK}>
                See what’s next
                <ArrowRight aria-hidden="true" />
              </Link>
            }
          />
        </ul>
      </section>

      <section
        id="message"
        aria-labelledby="message-title"
        className="mx-auto grid max-w-6xl scroll-mt-(--header-offset) gap-12 px-(--gutter) py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16"
      >
        <FadeUp>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Before you write
          </h2>
          <p className="text-muted-foreground mt-3 max-w-sm text-pretty">
            The questions we get most, answered.
          </p>
          <Accordion type="single" collapsible className="border-border mt-8 border-t">
            {faq.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-border">
                <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-[15px] leading-relaxed text-pretty">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {links.length > 0 && (
            <div className="mt-12">
              <h2 className="text-muted-foreground text-sm font-medium">Follow along</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {links.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-card ring-border/70 hover:ring-brand-sky/50 focus-visible:ring-ring/50 flex items-center gap-3 rounded-2xl p-3.5 ring-1 transition-shadow duration-150 outline-none focus-visible:ring-3"
                    >
                      <span className="bg-muted grid size-9 shrink-0 place-items-center rounded-xl">
                        <s.icon className="size-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{s.label}</span>
                        <span className="text-muted-foreground block truncate font-mono text-xs">
                          {shortUrl(s.href)}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="text-muted-foreground ml-auto size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="bg-card ring-border/70 rounded-3xl p-6 ring-1 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="message-title"
                  className="text-2xl font-semibold tracking-[-0.025em]"
                >
                  Message the officers
                </h2>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                  <Clock className="size-4" aria-hidden="true" />
                  Replies in a few school days
                </p>
              </div>
              {officers.length > 0 && (
                <ul
                  className="flex -space-x-2"
                  aria-label={`Read by ${officers.map((o) => o.name).join(', ')}`}
                >
                  {officers.slice(0, 4).map((o) => (
                    <li key={o.id}>
                      <Avatar className="ring-card size-9 ring-2">
                        <AvatarImage src={fileUrl(o.imageKey, 64)} alt="" />
                        <AvatarFallback className="text-[11px]">
                          {initials(o.name)}
                        </AvatarFallback>
                      </Avatar>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-border/70 my-6 border-t" />
            <TopicContactForm
              defaults={defaults}
              topic={topic}
              onTopicChange={setTopic}
              footnote="Officers read every message. We never share your email."
            />
          </div>
        </FadeUp>
      </section>
    </>
  )
}

function Door({
  index,
  dark,
  icon: Icon,
  title,
  body,
  action,
}: {
  index: number
  dark: boolean
  icon: IconComponent
  title: string
  body: string
  action: ReactNode
}) {
  return (
    <li>
      <FadeUp delay={index * 0.06} distance={16} className="h-full">
        <SpotlightCard
          theme={dark ? 'dark' : 'light'}
          spotlightColor="color-mix(in srgb, var(--brand-sky) 90%, transparent)"
          intensity={0.16}
          className="flex h-full flex-col rounded-3xl! p-6"
          style={SPOT}
        >
          <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-xl">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{title}</h2>
          <p className="text-muted-foreground mt-2 flex-1 text-[15px] text-pretty">
            {body}
          </p>
          <div className="mt-6">{action}</div>
        </SpotlightCard>
      </FadeUp>
    </li>
  )
}
