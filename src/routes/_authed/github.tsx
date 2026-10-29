import { lazy, useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { ArrowUpRight, FolderGit2, GitPullRequest, Github, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHero } from '#/components/page-hero'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { SplitButton } from '#/components/split-button'
import { GithubRequestForm } from '#/components/github/request-form'
import { RequestTimeline } from '#/components/github/request-timeline'
import { hasRole } from '#/lib/roles'
import { fmtDate } from '#/lib/format'
import { STATUS_LABEL } from '#/lib/schemas/github'
import { serverErrorMessage } from '#/lib/schemas/community'
import { getMyGithubRequest, withdrawGithubRequest } from '#/server/github'

const GithubHeroBackground = lazy(() =>
  import('#/components/github/github-hero-bg').then((m) => ({
    default: m.GithubHeroBackground,
  })),
)

export const Route = createFileRoute('/_authed/github')({
  loader: () => getMyGithubRequest(),
  head: () => ({
    meta: [
      { title: 'GitHub org · RHS Coding Club' },
      {
        name: 'description',
        content: 'Request an invite to the RHS Coding Club organization on GitHub.',
      },
    ],
  }),
  component: GithubPage,
})

const PERKS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FolderGit2,
    title: 'Push to club repos',
    body: 'The website, H2O hackathon starters, and the code we teach with at RAP.',
  },
  {
    icon: GitPullRequest,
    title: 'Get your code reviewed',
    body: 'Open pull requests and get feedback from officers and older members.',
  },
  {
    icon: Users,
    title: 'Show it on your profile',
    body: 'The org badge shows up on your GitHub profile for colleges and internships.',
  },
]

function GithubPage() {
  const data = Route.useLoaderData()
  const { user, theme } = Route.useRouteContext()
  const isMember = hasRole(user.role, 'member')
  const r = data.request

  return (
    <>
      <PageHero
        background={<GithubHeroBackground initialDark={theme === 'dark'} />}
        title="Join the club on GitHub"
        description={
          <>
            Members get an invite to the{' '}
            <span className="font-mono text-[0.9em]">{data.org}</span> organization. Ask
            once, an officer approves it, and GitHub emails you the invite.
          </>
        }
        actions={
          <RaisedButton asChild size="lg" variant="outline">
            <a href={data.orgUrl} target="_blank" rel="noopener noreferrer">
              <Github aria-hidden="true" />
              See the org
              <ArrowUpRight aria-hidden="true" />
            </a>
          </RaisedButton>
        }
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-(--gutter) py-16 sm:py-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
        <FadeUp>
          <div className="bg-card ring-border/70 rounded-3xl p-6 ring-1 sm:p-8">
            {!isMember ? (
              <GuestCard />
            ) : r && r.status !== 'denied' ? (
              <StatusCard request={r} data={data} />
            ) : (
              <div className="flex flex-col gap-8">
                {r && (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.025em]">
                      Your last request
                    </h2>
                    <div className="mt-6">
                      <RequestTimeline request={r} />
                    </div>
                  </div>
                )}
                <div className={r ? 'border-border border-t pt-8' : undefined}>
                  <GithubRequestForm prefill={data.prefill} again={Boolean(r)} />
                </div>
              </div>
            )}
          </div>
        </FadeUp>

        <FadeUp delay={0.1} className="lg:pt-4">
          <h2 className="text-2xl font-semibold tracking-[-0.025em]">What you get</h2>
          <ul className="mt-6 flex flex-col gap-6">
            {PERKS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="bg-brand-sky/12 text-brand-sky grid size-10 shrink-0 place-items-center rounded-xl">
                  <p.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground border-border mt-8 border-t pt-6 text-sm">
            Officers approve requests from club members. Leaving the club? Ask an officer
            to remove you, or leave the org from your GitHub settings.
          </p>
        </FadeUp>
      </section>
    </>
  )
}

type PageData = Awaited<ReturnType<typeof getMyGithubRequest>>
type RequestData = NonNullable<PageData['request']>

function StatusCard({ request: r, data }: { request: RequestData; data: PageData }) {
  const router = useRouter()
  const withdraw = useServerFn(withdrawGithubRequest)
  const [pending, setPending] = useState(false)
  const invited = r.status === 'invite-sent' || r.status === 'already-invited'
  const inOrg = r.status === 'joined' || r.status === 'already-member'
  const expires =
    r.inviteSentAt &&
    new Date(r.inviteSentAt.getTime() + data.inviteExpiryDays * 86_400_000)

  const hint =
    r.status === 'pending'
      ? 'Officers review requests a few times a week.'
      : r.status === 'approved'
        ? 'An officer is sending the invite on GitHub. Watch your email.'
        : invited
          ? 'Accept the invite from your email or the link below.'
          : undefined

  async function onWithdraw() {
    setPending(true)
    try {
      await withdraw({ data: { id: r.id } })
      toast.success('Request withdrawn.')
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em]">
            {inOrg ? 'You’re in the org' : 'Your request'}
          </h2>
          <p className="text-muted-foreground mt-1.5">
            For <span className="text-foreground font-mono">@{r.githubUsername}</span>
          </p>
        </div>
        <span className="bg-brand-sky/12 text-foreground rounded-full px-3 py-1 text-sm font-medium">
          {STATUS_LABEL[r.status]}
        </span>
      </div>

      <RequestTimeline request={r} currentHint={hint} />

      {(invited || inOrg) && (
        <div className="bg-brand-navy rounded-2xl p-6 text-[#e6edf5]">
          <p className="text-sm text-[#e6edf5]/70">From the officers</p>
          <p className="mt-2 text-lg leading-relaxed">{data.welcomeMessage}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {invited ? (
              <RaisedButton asChild variant="primary">
                <a
                  href={`https://github.com/orgs/${data.org}/invitation`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Accept the invite
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </RaisedButton>
            ) : (
              <RaisedButton asChild variant="primary">
                <a href={data.orgUrl} target="_blank" rel="noopener noreferrer">
                  Open the org
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </RaisedButton>
            )}
            {invited && expires && (
              <span className="text-sm text-[#e6edf5]/70">
                GitHub invites expire {fmtDate(expires, 'date')}.
              </span>
            )}
          </div>
        </div>
      )}

      {r.status === 'pending' && (
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          <p className="text-muted-foreground text-sm">
            Wrong username? Withdraw and ask again.
          </p>
          <RaisedButton variant="ghost" size="sm" loading={pending} onClick={onWithdraw}>
            Withdraw request
          </RaisedButton>
        </div>
      )}
    </div>
  )
}

function GuestCard() {
  return (
    <div className="flex flex-col items-start gap-5">
      <h2 className="text-2xl font-semibold tracking-[-0.025em]">For club members</h2>
      <p className="text-muted-foreground text-lg">
        The GitHub org is for members. Apply to join the club first; once an officer
        approves you, come back here to request your invite.
      </p>
      <SplitButton to="/join" size="lg">
        Apply to join
      </SplitButton>
      <p className="text-muted-foreground text-sm">
        Already applied?{' '}
        <Link to="/dashboard" className="text-foreground underline underline-offset-4">
          Check your dashboard
        </Link>
        .
      </p>
    </div>
  )
}
