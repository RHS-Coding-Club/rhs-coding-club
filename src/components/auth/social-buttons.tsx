import { signIn } from '#/lib/auth-client'
import { RaisedButton } from '#/components/raised-button'

export function SocialButtons({ callbackURL }: { callbackURL: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <RaisedButton
          type="button"
          variant="outline"
          size="lg"
          onClick={() => signIn.social({ provider: 'google', callbackURL })}
        >
          Google
        </RaisedButton>
        <RaisedButton
          type="button"
          variant="outline"
          size="lg"
          onClick={() => signIn.social({ provider: 'github', callbackURL })}
        >
          GitHub
        </RaisedButton>
      </div>
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        or with email
        <span className="bg-border h-px flex-1" />
      </div>
    </div>
  )
}
