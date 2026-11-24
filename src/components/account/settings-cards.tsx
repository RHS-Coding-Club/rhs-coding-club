import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from '#/components/icons/arrow-up-right'
import { Check } from '#/components/icons/check'
import { EmailPrefs } from './email-prefs'
import { SignInMethods } from './sign-in-methods'
import { SkillsInput } from './skills-input'
import { DotGridBackground } from '#/components/members/dot-grid-bg'
import { ImageUpload } from '#/components/image-upload'
import { EASE } from '#/components/motion'
import { PageHero } from '#/components/page-hero'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { BIO_MAX, SKILLS_MAX, expandPrefs, gradYearRange } from '#/lib/schemas/account'
import { ROLE_LABEL } from '#/lib/schemas/users'
import { fmtDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import type { getMyAccount } from '#/server/account'
import { DeleteAccountDialog } from './delete-account'
import { persistProfile, toDraft } from './profile-draft'
import type { ProfileDraft } from './profile-draft'

type AccountData = Awaited<ReturnType<typeof getMyAccount>>

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'notifications', label: 'Email' },
  { value: 'sign-in', label: 'Sign-in' },
  { value: 'account', label: 'Account' },
] as const
type Tab = (typeof TABS)[number]['value']

/**
 * /account: a short hero with tabs, then one card per setting. Each card
 * saves on its own, says so in its footer, and only lights its Save button
 * once that one value has changed.
 */
export function AccountSettings({ data, dark }: { data: AccountData; dark: boolean }) {
  const { user, accounts, providers } = data
  const router = useRouter()
  const [saved, setSaved] = useState(() => toDraft(user))
  const [tab, setTab] = useState<Tab>('profile')
  const hasPassword = accounts.some((a) => a.providerId === 'credential')

  // Deep links: /account#notifications opens that tab.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (TABS.some((t) => t.value === hash)) setTab(hash as Tab)
  }, [])

  /** Saves one field on top of the last saved profile. */
  async function saveField<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    const result = await persistProfile({ ...saved, [key]: value })
    if ('errors' in result) {
      const errs: Partial<Record<string, string>> = result.errors
      return errs[key] ?? errs._ ?? 'Unable to save. Try again.'
    }
    setSaved(result.saved)
    await router.invalidate({ sync: true })
    return null
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        setTab(v as Tab)
        history.replaceState(null, '', `#${v}`)
      }}
    >
      <PageHero
        size="sm"
        background={<DotGridBackground initialDark={dark} />}
        title="Settings"
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <UserAvatar
              user={{ name: saved.name, avatarKey: saved.avatarKey, image: user.image }}
              className="size-8 text-[11px]"
            />
            <span className="text-ink">{saved.name}</span>
            <span className="text-ink/60 text-base">
              {ROLE_LABEL[user.role]} since {fmtDate(user.createdAt, 'date')}
            </span>
          </span>
        }
      >
        <TabsList
          aria-label="Settings"
          className="bg-card/70 ring-border/70 h-11 w-full justify-start gap-1 overflow-x-auto rounded-xl p-1 ring-1 backdrop-blur-md [scrollbar-width:none] sm:w-auto"
        >
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="data-[state=active]:bg-background h-9 flex-1 rounded-lg px-3 text-sm select-none sm:flex-none sm:px-4"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </PageHero>

      <div className="mx-auto w-full max-w-6xl px-(--gutter) py-12 sm:py-16">
        <TabsContent value="profile" className="flex flex-col gap-14">
          <Group
            title="Identity"
            description="How you show up on the leaderboard, your profile, and projects."
          >
            <PhotoCard
              initial={saved.avatarKey}
              image={user.image}
              onSave={(v) => saveField('avatarKey', v)}
            />
            <TextCard
              id="b-name"
              title="Name"
              description="How you appear on the leaderboard, your profile, and projects."
              hint="Use the name people know you by at school."
              initial={saved.name}
              autoComplete="name"
              onSave={(v) => saveField('name', v)}
            />
            <GradYearCard
              initial={saved.gradYear}
              onSave={(v) => saveField('gradYear', v)}
            />
          </Group>
          <Group
            title="About you"
            description="The details that make your profile yours."
          >
            <BioCard initial={saved.bio} onSave={(v) => saveField('bio', v)} />
            <SkillsCard initial={saved.skills} onSave={(v) => saveField('skills', v)} />
            <TextCard
              id="b-github"
              title="GitHub username"
              description="Links your profile to GitHub and is used for the club org invite."
              hint={
                <>
                  Need the org?{' '}
                  <Link
                    to="/github"
                    className="text-foreground underline underline-offset-4"
                  >
                    Request an invite
                  </Link>
                </>
              }
              prefix="github.com/"
              placeholder="octocat"
              mono
              initial={saved.githubUsername}
              onSave={(v) => saveField('githubUsername', v)}
            />
          </Group>
        </TabsContent>

        <TabsContent value="notifications" className="lg:pl-[16.5rem] lg:pr-[8%]">
          <Card
            title="Email notifications"
            description="Each switch saves right away."
            footer={
              <span>
                The newsletter has its own unsubscribe link at the bottom of every issue.
              </span>
            }
          >
            <EmailPrefs initial={expandPrefs(user.emailPrefs)} />
          </Card>
        </TabsContent>

        <TabsContent value="sign-in" className="lg:pl-[16.5rem] lg:pr-[8%]">
          <Card
            title="Sign-in methods"
            description="Link Google or GitHub to sign in with one tap."
            footer={<span>You always need at least one way to sign in.</span>}
          >
            <SignInMethods accounts={accounts} providers={providers} email={user.email} />
          </Card>
        </TabsContent>

        <TabsContent
          value="account"
          className="flex flex-col gap-6 lg:pl-[16.5rem] lg:pr-[8%]"
        >
          <Card
            title="Account"
            description="Set by how you signed up. Only an admin can change your role."
          >
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Fact term="Email" value={user.email} />
              <Fact term="Role" value={ROLE_LABEL[user.role]} />
              <Fact term="Joined" value={fmtDate(user.createdAt, 'date')} />
            </dl>
            <RaisedButton variant="outline" size="sm" asChild className="mt-6">
              <Link to="/members/$id" params={{ id: user.id }}>
                View public profile
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </RaisedButton>
          </Card>
          <Card
            danger
            title="Delete account"
            description="Permanently removes your profile, points, badges, submissions, RSVPs, and the projects you authored."
            footer={
              <>
                <span>This can’t be undone.</span>
                <DeleteAccountDialog
                  email={user.email}
                  hasPassword={hasPassword}
                  trigger={
                    <RaisedButton
                      size="sm"
                      className="text-white [--raise-fill:var(--destructive)]"
                    >
                      Delete account
                    </RaisedButton>
                  }
                />
              </>
            }
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}

/** A group of cards with its heading in a left column on wide screens. */
function Group({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="text-base font-semibold tracking-[-0.01em]">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm text-pretty">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-5 lg:pr-[8%]">{children}</div>
    </section>
  )
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{term}</dt>
      <dd className="mt-1 truncate text-sm font-medium" title={value}>
        {value}
      </dd>
    </div>
  )
}

/** Title and description, the control, then a tinted footer for the hint and actions. */
function Card({
  title,
  description,
  footer,
  danger,
  children,
  as: As = 'section',
  onSubmit,
}: {
  title: string
  description?: string
  footer?: ReactNode
  danger?: boolean
  children?: ReactNode
  as?: 'section' | 'form'
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  const id = `card-${title.toLowerCase().replace(/\W+/g, '-')}`
  return (
    <As
      aria-labelledby={id}
      onSubmit={onSubmit}
      noValidate={As === 'form' ? true : undefined}
      className={cn(
        'bg-card overflow-hidden rounded-2xl ring-1',
        danger ? 'ring-destructive/35' : 'ring-border/70',
      )}
    >
      <div className="p-5 sm:p-6">
        <h2
          id={id}
          className={cn(
            'text-lg font-semibold tracking-[-0.015em]',
            danger && 'text-destructive',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-1 max-w-xl text-sm text-pretty">
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
      {footer && (
        <div
          className={cn(
            'text-muted-foreground flex min-h-14 flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-[13px] sm:px-6',
            danger
              ? 'border-destructive/25 bg-destructive/5'
              : 'border-border/70 bg-muted/40',
          )}
        >
          {footer}
        </div>
      )}
    </As>
  )
}

/** Footer actions for one setting: the hint, a "Saved" receipt, and Save. */
function useFieldSave<T>(initial: T, equal: (a: T, b: T) => boolean = Object.is) {
  const [value, setValue] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [savedAt, setSavedAt] = useState(0)
  const changed = !equal(value, initial)

  useEffect(() => {
    if (!savedAt) return
    const t = setTimeout(() => setSavedAt(0), 2000)
    return () => clearTimeout(t)
  }, [savedAt])

  async function submit(onSave: (v: T) => Promise<string | null>) {
    setPending(true)
    const err = await onSave(value)
    setPending(false)
    setError(err)
    if (!err) setSavedAt(Date.now())
  }

  return {
    value,
    setValue,
    error,
    setError,
    pending,
    changed,
    justSaved: savedAt > 0,
    submit,
  }
}

function SaveFooter({
  hint,
  changed,
  pending,
  justSaved,
}: {
  hint?: ReactNode
  changed: boolean
  pending: boolean
  justSaved: boolean
}) {
  return (
    <>
      <span className="min-w-0">{hint}</span>
      <span className="ml-auto flex items-center gap-3">
        <span
          role="status"
          className="text-success flex items-center gap-1.5 text-[13px] font-medium"
        >
          <AnimatePresence>
            {justSaved && (
              <motion.span
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="flex items-center gap-1.5"
              >
                <Check className="size-3.5" aria-hidden="true" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <RaisedButton
          type="submit"
          size="sm"
          variant={changed ? 'primary' : 'outline'}
          disabled={!changed}
          loading={pending}
          loadingText="Saving…"
        >
          Save
        </RaisedButton>
      </span>
    </>
  )
}

function TextCard({
  id,
  title,
  description,
  hint,
  initial,
  onSave,
  prefix,
  placeholder,
  mono,
  autoComplete,
}: {
  id: string
  title: string
  description: string
  hint?: ReactNode
  initial: string
  onSave: (v: string) => Promise<string | null>
  prefix?: string
  placeholder?: string
  mono?: boolean
  autoComplete?: string
}) {
  const f = useFieldSave(initial)
  return (
    <Card
      as="form"
      title={title}
      description={description}
      onSubmit={(e) => {
        e.preventDefault()
        void f.submit(onSave)
      }}
      footer={
        <SaveFooter
          hint={hint}
          changed={f.changed}
          pending={f.pending}
          justSaved={f.justSaved}
        />
      }
    >
      <div className="relative max-w-sm">
        {prefix && (
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          aria-label={title}
          value={f.value}
          onChange={(e) => {
            f.setValue(e.target.value)
            f.setError(null)
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={mono ? 'none' : undefined}
          autoCorrect={mono ? 'off' : undefined}
          spellCheck={mono ? false : undefined}
          aria-invalid={f.error ? true : undefined}
          aria-describedby={f.error ? `${id}-error` : undefined}
          className={cn(mono && 'font-mono', prefix && 'pl-[6.4rem]')}
        />
      </div>
      {f.error && (
        <p id={`${id}-error`} className="text-destructive mt-2 text-sm">
          {f.error}
        </p>
      )}
    </Card>
  )
}

function BioCard({
  initial,
  onSave,
}: {
  initial: string
  onSave: (v: string) => Promise<string | null>
}) {
  const f = useFieldSave(initial)
  return (
    <Card
      as="form"
      title="Bio"
      description="A line or two on your profile: what you build, what you’re learning, what you teach at RAP."
      onSubmit={(e) => {
        e.preventDefault()
        void f.submit(onSave)
      }}
      footer={
        <SaveFooter
          hint={
            <span
              className={cn(
                'font-mono tabular-nums',
                f.value.length > BIO_MAX && 'text-destructive',
              )}
            >
              {f.value.length}/{BIO_MAX}
            </span>
          }
          changed={f.changed}
          pending={f.pending}
          justSaved={f.justSaved}
        />
      }
    >
      <Textarea
        id="b-bio"
        aria-label="Bio"
        value={f.value}
        onChange={(e) => {
          f.setValue(e.target.value)
          f.setError(null)
        }}
        rows={3}
        placeholder="Building a water tracker for the school. Learning React one bug at a time."
        aria-invalid={f.error ? true : undefined}
        aria-describedby={f.error ? 'b-bio-error' : undefined}
      />
      {f.error && (
        <p id="b-bio-error" className="text-destructive mt-2 text-sm">
          {f.error}
        </p>
      )}
    </Card>
  )
}

function SkillsCard({
  initial,
  onSave,
}: {
  initial: string[]
  onSave: (v: string[]) => Promise<string | null>
}) {
  const f = useFieldSave(initial, (a, b) => a.join('\u0000') === b.join('\u0000'))
  return (
    <Card
      as="form"
      title="Skills"
      description="Languages and tools you use. They show as tags on your profile."
      onSubmit={(e) => {
        e.preventDefault()
        void f.submit(onSave)
      }}
      footer={
        <SaveFooter
          hint={
            <span>
              Press Enter or a comma to add one ·{' '}
              <span className="font-mono tabular-nums">
                {f.value.length}/{SKILLS_MAX}
              </span>
            </span>
          }
          changed={f.changed}
          pending={f.pending}
          justSaved={f.justSaved}
        />
      }
    >
      <SkillsInput id="b-skills" value={f.value} onChange={f.setValue} />
      {f.error && <p className="text-destructive mt-2 text-sm">{f.error}</p>}
    </Card>
  )
}

function GradYearCard({
  initial,
  onSave,
}: {
  initial: number | null
  onSave: (v: number | null) => Promise<string | null>
}) {
  const f = useFieldSave(initial)
  const { min, max } = gradYearRange()
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i)
  if (f.value && !years.includes(f.value)) years.push(f.value)
  return (
    <Card
      as="form"
      title="Graduation year"
      description="Shown next to your name as your class."
      onSubmit={(e) => {
        e.preventDefault()
        void f.submit(onSave)
      }}
      footer={
        <SaveFooter changed={f.changed} pending={f.pending} justSaved={f.justSaved} />
      }
    >
      <Select
        value={f.value ? String(f.value) : 'none'}
        onValueChange={(v) => f.setValue(v === 'none' ? null : Number(v))}
      >
        <SelectTrigger aria-label="Graduation year" className="w-full max-w-sm">
          <SelectValue placeholder="Pick a year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not set</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              Class of {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {f.error && <p className="text-destructive mt-2 text-sm">{f.error}</p>}
    </Card>
  )
}

function PhotoCard({
  initial,
  image,
  onSave,
}: {
  initial: string | null
  image: string | null
  onSave: (v: string | null) => Promise<string | null>
}) {
  const f = useFieldSave(initial)
  return (
    <Card
      as="form"
      title="Photo"
      description="Click the circle to upload one. A square photo works best."
      onSubmit={(e) => {
        e.preventDefault()
        void f.submit(onSave)
      }}
      footer={
        <SaveFooter
          hint={`Without one, you get ${image ? 'your Google or GitHub photo' : 'your initials'}.`}
          changed={f.changed}
          pending={f.pending}
          justSaved={f.justSaved}
        />
      }
    >
      <div className="flex items-center gap-5">
        <ImageUpload
          value={f.value}
          onChange={f.setValue}
          purpose="avatar"
          label="Upload"
          aspect="aspect-square"
          className="size-20 shrink-0 [&>button]:rounded-full [&>button:first-child]:text-xs"
        />
        <p className="text-muted-foreground max-w-xs text-sm text-pretty">
          Shown on your profile, the leaderboard, and next to your projects.
        </p>
      </div>
      {f.error && <p className="text-destructive mt-2 text-sm">{f.error}</p>}
    </Card>
  )
}
