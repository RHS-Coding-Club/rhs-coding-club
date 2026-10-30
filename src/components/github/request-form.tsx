import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Github } from 'lucide-react'
import { githubRequestSchema } from '#/lib/schemas/github'
import { fieldErrors, serverErrorMessage } from '#/lib/schemas/community'
import type { FieldErrors } from '#/lib/schemas/community'
import { requestGithubInvite } from '#/server/github'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

/**
 * Asks for an invite. The server checks the username exists on GitHub before
 * filing it, so a typo comes back as an inline error.
 */
export function GithubRequestForm({
  prefill,
  again,
}: {
  prefill: string
  again?: boolean
}) {
  const router = useRouter()
  const request = useServerFn(requestGithubInvite)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const parsed = githubRequestSchema.safeParse({
      githubUsername: String(f.get('githubUsername') ?? ''),
      note: String(f.get('note') ?? ''),
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setPending(true)
    try {
      await request({ data: parsed.data })
      toast.success('Request sent. An officer will review it soon.')
      await router.invalidate()
    } catch (err) {
      setErrors({ githubUsername: serverErrorMessage(err) })
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.025em]">
          {again ? 'Try again' : 'Request an invite'}
        </h2>
        <p className="text-muted-foreground mt-1.5">
          Use your own GitHub account. No account yet?{' '}
          <a
            href="https://github.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground decoration-brand-sky underline decoration-2 underline-offset-4"
          >
            Make one free
          </a>
          , then come back.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gh-username">GitHub username</Label>
        <div className="relative">
          <Github
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="gh-username"
            name="githubUsername"
            defaultValue={prefill}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="octocat"
            className="h-11 rounded-xl pl-10 font-mono"
            aria-invalid={errors.githubUsername ? true : undefined}
            aria-describedby={errors.githubUsername ? 'gh-username-error' : undefined}
            required
          />
        </div>
        {errors.githubUsername && (
          <p id="gh-username-error" role="alert" className="text-destructive text-sm">
            {errors.githubUsername}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gh-note">
          What will you work on?{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="gh-note"
          name="note"
          rows={3}
          maxLength={500}
          placeholder="Our H2O team repo, the club website, RAP lesson code…"
          aria-invalid={errors.note ? true : undefined}
        />
        {errors.note && (
          <p role="alert" className="text-destructive text-sm">
            {errors.note}
          </p>
        )}
      </div>
      <div>
        <RaisedButton
          type="submit"
          size="lg"
          loading={pending}
          loadingText="Checking GitHub…"
        >
          Request invite
        </RaisedButton>
      </div>
    </form>
  )
}
