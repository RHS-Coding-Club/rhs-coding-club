import { Link } from '@tanstack/react-router'
import { FadeUp } from '#/components/motion'
import type { HomeData } from '#/services/home'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'

/** Heading and contact link on the left, accordion of questions on the right. */
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
      className="mx-auto grid max-w-6xl gap-12 px-(--gutter) py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
      aria-labelledby="faq-heading"
    >
      <FadeUp className="max-w-sm">
        <h2
          id="faq-heading"
          className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
        >
          Questions, answered
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Anything else, ask an officer.{' '}
          <Link
            to="/contact"
            className="text-foreground decoration-brand-sky underline decoration-2 underline-offset-4"
          >
            Send us a message
          </Link>
          .
        </p>
      </FadeUp>

      <Accordion type="single" collapsible className="border-border border-t">
        {items.map((item, i) => (
          <FadeUp key={item.q} delay={i * 0.05} distance={16}>
            <AccordionItem value={item.q} className="border-border">
              <AccordionTrigger className="py-5 text-lg font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          </FadeUp>
        ))}
      </Accordion>
    </section>
  )
}
