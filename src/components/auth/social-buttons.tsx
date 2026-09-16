import { signIn } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

export function SocialButtons({ callbackURL }: { callbackURL: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn.social({ provider: 'google', callbackURL })}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn.social({ provider: 'github', callbackURL })}
        >
          GitHub
        </Button>
      </div>
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        or with email
        <span className="bg-border h-px flex-1" />
      </div>
    </div>
  )
}
