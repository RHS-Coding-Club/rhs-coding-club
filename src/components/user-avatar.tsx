import { avatarUrl } from '#/lib/files'
import { initials } from '#/lib/format'
import { cn } from '#/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

/** A member's avatar: uploaded image, then the OAuth image, then initials. */
export function UserAvatar({
  user,
  className,
}: {
  user: { name: string; avatarKey?: string | null; image?: string | null }
  className?: string
}) {
  return (
    <Avatar className={cn('size-9', className)}>
      <AvatarImage src={avatarUrl(user)} alt="" />
      <AvatarFallback className="text-[0.7em] font-medium">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}
