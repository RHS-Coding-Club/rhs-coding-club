import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight } from '#/components/icons/arrow-right'
import { CircleCheck } from '#/components/icons/circle-check'
import { Send } from '#/components/icons/send'
import { EASE } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { Turnstile } from '#/components/turnstile'
import type { TurnstileHandle } from '#/components/turnstile'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { fieldErrors, serverErrorMessage } from '#/lib/schemas/community'
import type { FieldErrors } from '#/lib/schemas/community'
import { MESSAGE_MAX, contactSchema } from '#/lib/schemas/contact'
import { TURNSTILE_ACTIONS } from '#/lib/turnstile'
import { cn } from '#/lib/utils'
import { sendContactMessage } from '#/server/contact'

export const TOPICS = [
  {
    id: 'join',
    label: 'Joining',
    subject: 'Joining the club',
    tip: (
      <>
        You don’t need to email us to join. Make an account and apply in about two
        minutes.{' '}
        <Link
          to="/join"
          className="text-foreground font-medium underline underline-offset-4"
        >
          Start your application
        </Link>
      </>
    ),
  },
  {
    id: 'rap',
    label: 'Volunteering at RAP',
    subject: 'Volunteering at RAP',
    tip: 'Members teach coding at the Ripon Afterschool Program. Tell us when you’re free and what you’d like to teach.',
  },
  {
    id: 'h2o',
    label: 'H2O hackathon',
    subject: 'The H2O hackathon',
    tip: 'Ask about dates, teams, or judging. Sponsors and judges are always welcome.',
  },
  {
    id: 'school',
    label: 'Parents and teachers',
    subject: 'A question from a parent or teacher',
    tip: 'Ask about meetings, volunteer hours, or bringing the club into your class.',
  },
  { id: 'other', label: 'Something else', subject: '', tip: null },
] as const satisfies readonly {
  id: string
  label: string
  subject: string
  tip: ReactNode
}[]

export type TopicId = (typeof TOPICS)[number]['id']

/**
 * The contact form with a topic picker on top. Picking a topic fills the
 * subject (unless you typed your own) and shows the fastest answer for it.
 * Validation, the honeypot, Turnstile, and the server function are the live
 * form's, unchanged.
 */
export function TopicContactForm({
  defaults,
  topic,
  onTopicChange,
  footnote,
  className,
}: {
  defaults?: { name?: string; email?: string }
  topic: TopicId | null
  onTopicChange: (t: TopicId) => void
  footnote?: ReactNode
  className?: string
}) {
  const send = useServerFn(sendContactMessage)
  const turnstile = useRef<TurnstileHandle>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [subject, setSubject] = useState<string>(
    TOPICS.find((t) => t.id === topic)?.subject ?? '',
  )
  const [length, setLength] = useState(0)
  const current = TOPICS.find((t) => t.id === topic)

  function pick(id: TopicId) {
    const next = TOPICS.find((t) => t.id === id)
    // Replace the subject only if it's empty or still a topic's preset.
    if (!subject || TOPICS.some((t) => t.subject === subject))
      setSubject(next?.subject ?? '')
    onTopicChange(id)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const parsed = contactSchema.safeParse({
      name: String(f.get('name') ?? ''),
      email: String(f.get('email') ?? ''),
      subject: String(f.get('subject') ?? ''),
      message: String(f.get('message') ?? ''),
      website: String(f.get('website') ?? ''),
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      const first = parsed.error.issues[0]?.path[0]
      if (typeof first === 'string')
        form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setErrors({})
    setPending(true)
    try {
      const turnstileToken = await turnstile.current?.getToken()
      await send({ data: { ...parsed.data, turnstileToken } })
      setSentTo(parsed.data.email)
      form.reset()
      setSubject('')
      setLength(0)
    } catch (err) {
      setErrors({
        _: serverErrorMessage(err, 'Unable to send that. Try again in a moment.'),
      })
      turnstile.current?.reset()
    } finally {
      setPending(false)
    }
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`tc-${name}-error`} className="text-destructive text-sm">
        {errors[name]}
      </p>
    ) : null
  const aria = (name: string) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `tc-${name}-error` : undefined,
  })
  const swap = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: EASE } },
    transition: { duration: 0.3, ease: EASE },
  }

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {sentTo ? (
          <motion.div
            key="sent"
            {...swap}
            role="status"
            className="flex min-h-[26rem] flex-col items-start justify-center"
          >
            <CircleCheck className="text-brand-sky size-10" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em]">
              Message sent
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md text-lg text-pretty">
              An officer will reply to{' '}
              <span className="text-foreground font-medium">{sentTo}</span>, usually
              within a few school days.
            </p>
            <RaisedButton
              variant="outline"
              className="mt-8"
              onClick={() => setSentTo(null)}
            >
              Send another message
            </RaisedButton>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            {...swap}
            onSubmit={onSubmit}
            noValidate
            aria-label="Message the officers"
            className="flex flex-col gap-5"
          >
            <fieldset>
              <legend className="text-sm font-medium">What’s it about?</legend>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <label key={t.id} className="relative">
                    <input
                      type="radio"
                      name="topic"
                      value={t.id}
                      checked={topic === t.id}
                      onChange={() => pick(t.id)}
                      className="peer sr-only"
                    />
                    <span className="text-foreground/85 ring-border peer-checked:bg-brand-sky peer-checked:text-on-sky peer-checked:ring-brand-sky peer-focus-visible:outline-ring hover:ring-foreground/30 flex h-9 cursor-pointer items-center rounded-full px-3.5 text-sm font-medium ring-1 transition-[background-color,color,box-shadow,scale] duration-150 ring-inset select-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 active:scale-[0.97]">
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
              <div aria-live="polite">
                <AnimatePresence initial={false} mode="popLayout">
                  {current?.tip && (
                    <motion.p
                      key={current.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="bg-accent/60 text-accent-foreground mt-3 flex gap-2 rounded-xl px-3.5 py-3 text-sm text-pretty"
                    >
                      <ArrowRight className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span>{current.tip}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tc-name">Your name</Label>
                <Input
                  id="tc-name"
                  name="name"
                  autoComplete="name"
                  defaultValue={defaults?.name}
                  maxLength={80}
                  required
                  {...aria('name')}
                />
                {err('name')}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tc-email">Email</Label>
                <Input
                  id="tc-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  defaultValue={defaults?.email}
                  required
                  {...aria('email')}
                />
                {err('email')}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tc-subject">Subject</Label>
              <Input
                id="tc-subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                placeholder="Volunteer hours for RAP"
                required
                {...aria('subject')}
              />
              {err('subject')}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="tc-message">Message</Label>
                <span
                  className={cn(
                    'font-mono text-xs tabular-nums',
                    length > MESSAGE_MAX ? 'text-destructive' : 'text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {length}/{MESSAGE_MAX}
                </span>
              </div>
              <Textarea
                id="tc-message"
                name="message"
                rows={6}
                required
                onChange={(e) => setLength(e.target.value.trim().length)}
                className="max-h-[50vh] min-h-36 resize-y"
                {...aria('message')}
              />
              {err('message')}
            </div>

            {/* Honeypot: off-screen, out of the tab order, hidden from assistive tech. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label htmlFor="tc-website">Website</label>
              <input
                id="tc-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            <Turnstile ref={turnstile} action={TURNSTILE_ACTIONS.contact} />
            {errors._ && (
              <p role="alert" className="text-destructive text-sm">
                {errors._}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <p className="text-muted-foreground max-w-xs text-sm">
                {footnote ?? 'We never share your email.'}
              </p>
              <RaisedButton
                type="submit"
                size="lg"
                loading={pending}
                loadingText="Sending…"
              >
                <Send aria-hidden="true" />
                Send message
              </RaisedButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
