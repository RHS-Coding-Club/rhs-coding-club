import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, Send } from 'lucide-react'
import { MESSAGE_MAX, MESSAGE_MIN, contactSchema } from '#/lib/schemas/contact'
import { fieldErrors, serverErrorMessage } from '#/lib/schemas/community'
import type { FieldErrors } from '#/lib/schemas/community'
import { sendContactMessage } from '#/server/contact'
import { EASE } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'

/**
 * The public contact form. Validates with the shared schema before sending;
 * a hidden "website" field catches bots (the server drops anything that
 * fills it but answers the same, so they never know).
 */
export function ContactForm({
  defaults,
}: {
  defaults?: { name?: string; email?: string }
}) {
  const send = useServerFn(sendContactMessage)
  const reduced = useReducedMotion()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [length, setLength] = useState(0)

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
      await send({ data: parsed.data })
      setSentTo(parsed.data.email)
      form.reset()
      setLength(0)
    } catch (err) {
      setErrors({
        _: serverErrorMessage(err, 'Could not send that. Try again in a moment.'),
      })
    } finally {
      setPending(false)
    }
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`contact-${name}-error`} role="alert" className="text-destructive text-sm">
        {errors[name]}
      </p>
    ) : null
  const aria = (name: string) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  })
  const fade = {
    initial: { opacity: 0, y: 12, filter: reduced ? 'blur(0px)' : 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -8, filter: reduced ? 'blur(0px)' : 'blur(4px)' },
    transition: { duration: 0.35, ease: EASE },
  }

  return (
    <div className="bg-card ring-border/70 relative rounded-3xl p-6 ring-1 sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {sentTo ? (
          <motion.div
            key="sent"
            {...fade}
            role="status"
            className="flex min-h-[28rem] flex-col items-start justify-center"
          >
            <CheckCircle2 className="text-brand-sky size-10" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em]">
              Message sent.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md text-lg">
              Thanks for reaching out. An officer will reply to{' '}
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
            {...fade}
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-5"
            aria-label="Contact the officers"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact-name">Your name</Label>
                <Input
                  id="contact-name"
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
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={defaults?.email}
                  required
                  {...aria('email')}
                />
                {err('email')}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-subject">Subject</Label>
              <Input
                id="contact-subject"
                name="subject"
                maxLength={120}
                placeholder="Joining, RAP volunteering, H2O sponsorship…"
                required
                {...aria('subject')}
              />
              {err('subject')}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="contact-message">Message</Label>
                <span
                  className={cn(
                    'tabular font-mono text-xs',
                    length > MESSAGE_MAX ? 'text-destructive' : 'text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {length}/{MESSAGE_MAX}
                </span>
              </div>
              <Textarea
                id="contact-message"
                name="message"
                rows={7}
                required
                minLength={MESSAGE_MIN}
                onChange={(e) => setLength(e.target.value.trim().length)}
                className="min-h-40 resize-y"
                {...aria('message')}
              />
              {err('message')}
            </div>

            {/* Honeypot: off-screen, out of the tab order, hidden from assistive tech. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            {errors._ && (
              <p role="alert" className="text-destructive text-sm">
                {errors._}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <p className="text-muted-foreground max-w-xs text-sm">
                Officers read every message. We never share your email.
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
