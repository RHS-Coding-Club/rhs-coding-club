import { Github } from '#/components/icons/github'
import { Instagram } from '#/components/icons/instagram'
import { Link2 } from '#/components/icons/link-2'
import { MessageCircle } from '#/components/icons/message-circle'
import { Youtube } from '#/components/icons/youtube'
import type { IconComponent } from '#/components/icons/create-icon'
import type { ContactPageData } from '#/services/contact'

export interface SocialLink {
  label: string
  href: string
  icon: IconComponent
}

/** The club's configured channels, in a fixed order, custom links last. */
export function socialLinks(social: ContactPageData['social']): SocialLink[] {
  return [
    social.instagram && { label: 'Instagram', href: social.instagram, icon: Instagram },
    social.github && { label: 'GitHub', href: social.github, icon: Github },
    social.discord && { label: 'Discord', href: social.discord, icon: MessageCircle },
    social.youtube && { label: 'YouTube', href: social.youtube, icon: Youtube },
    ...social.customLinks.map((l) => ({ label: l.label, href: l.url, icon: Link2 })),
  ].filter((s): s is SocialLink => Boolean(s))
}

/** `https://www.instagram.com/rhs/` -> `instagram.com/rhs` */
export function shortUrl(href: string) {
  return href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}
