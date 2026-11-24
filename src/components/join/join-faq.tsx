import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { cn } from '#/lib/utils'

const FAQ = [
  {
    q: 'Do I need to know how to code?',
    a: 'No. Plenty of members started from zero. The beginner challenges and the resources page are built for that.',
  },
  {
    q: 'How long does approval take?',
    a: 'Usually less than a week. An officer reads every application, and you get an email with the decision.',
  },
  {
    q: 'Does it cost anything?',
    a: 'No. The club, the site, and the events are free.',
  },
  {
    q: 'What can I do before I’m approved?',
    a: 'Browse the challenges, events, projects, and blog. Submitting, RSVPs, and points unlock when you’re a member.',
  },
]

/** The questions people ask before applying. */
export function JoinFaq({ className }: { className?: string }) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn('border-border border-t', className)}
    >
      {FAQ.map((f) => (
        <AccordionItem key={f.q} value={f.q} className="border-border">
          <AccordionTrigger className="py-5 text-base">{f.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-5 text-[15px] leading-relaxed">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
