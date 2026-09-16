import { Link } from '@tanstack/react-router'
import { FadeUp } from '#/components/motion'
import type { HomeData } from '#/services/home'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'

/** Template FAQ: centered heading, two pill buttons, accordion of bordered cards. */
export function Faq({
  club,
  points,
}: {
  club: HomeData['club']
  points: HomeData['points']
}) {
  const items = [
    {
      q: 'Do I need experience?',
      a: 'No. Most members start from zero. Challenges are tiered easy to hard, and officers and older members help during meetings.',
    },
    {
      q: 'When and where do you meet?',
      a: `${club.meetingSchedule}, in ${club.meetingLocation}. Events and hackathon dates are posted on the events page and go out by email.`,
    },
    {
      q: 'What do I need to bring?',
      a: 'A laptop if you have one (school Chromebooks work for most challenges) and a GitHub account. We will help you set one up at your first meeting.',
    },
    {
      q: 'Do I get volunteer hours?',
      a: 'Yes. Teaching at the Ripon Afterschool Program and helping run events count as community service; officers sign off on hours after each session.',
    },
    {
      q: 'How do points work?',
      a: `Every solved challenge adds points to a ledger: ${points.easy} for easy, ${points.medium} for medium, ${points.hard} for hard. An approved project is worth ${points.project} and each meeting you attend adds ${points.attendance}. The leaderboard sums the ledger for the current semester.`,
    },
  ]

  return (
    <section
      className="mx-auto max-w-3xl px-(--gutter) py-24 sm:py-28"
      aria-labelledby="faq-heading"
    >
      <FadeUp className="text-center">
        <p className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">
          Frequently asked questions
        </p>
        <h2
          id="faq-heading"
          className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          Everything you need to know
        </h2>
        <p className="text-muted-foreground mt-3 text-base">
          Still curious about something? Reach out and an officer will answer.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/signup"
            className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-[background-color,transform] outline-none focus-visible:ring-2 active:scale-[0.98]"
          >
            Join the club
          </Link>
          <Link
            to="/contact"
            className="bg-card text-card-foreground ring-border/70 hover:bg-muted focus-visible:ring-ring inline-flex h-10 items-center rounded-full px-5 text-sm font-medium ring-1 transition-[background-color,transform] outline-none focus-visible:ring-2 active:scale-[0.98]"
          >
            Contact us
          </Link>
        </div>
      </FadeUp>

      <Accordion type="single" collapsible className="mt-12 space-y-3">
        {items.map((item, i) => (
          <FadeUp key={item.q} delay={i * 0.05} distance={20}>
            <AccordionItem
              value={item.q}
              className="bg-card ring-border/60 rounded-2xl border-b-0 px-5 ring-1"
            >
              <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          </FadeUp>
        ))}
      </Accordion>
    </section>
  )
}
