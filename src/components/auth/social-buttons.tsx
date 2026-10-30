import { useState } from 'react'
import { signIn } from '#/lib/auth-client'
import { RaisedButton } from '#/components/raised-button'
import { GithubIcon, GoogleIcon } from './brand-icons'

type Provider = 'google' | 'github'

/** "Continue with Google / GitHub", stacked full width, each with its logo. */
export function SocialButtons({ callbackURL }: { callbackURL: string }) {
  const [pending, setPending] = useState<Provider | null>(null)

  const go = (provider: Provider) => {
    setPending(provider)
    void signIn.social({ provider, callbackURL }).catch(() => setPending(null))
  }

  return (
    <div className="grid gap-2.5">
      <RaisedButton
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        loading={pending === 'google'}
        loadingText="Opening Google…"
        disabled={pending !== null}
        onClick={() => go('google')}
      >
        <GoogleIcon />
        Continue with Google
      </RaisedButton>
      <RaisedButton
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        loading={pending === 'github'}
        loadingText="Opening GitHub…"
        disabled={pending !== null}
        onClick={() => go('github')}
      >
        <GithubIcon />
        Continue with GitHub
      </RaisedButton>
    </div>
  )
}
