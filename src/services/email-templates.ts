import { env } from 'cloudflare:workers'

// One email layout for every message: the club name, a heading, a few
// paragraphs, an optional button, and a footer line. Domains build their
// messages with `renderEmail` instead of hand-writing HTML. Inline styles
// only; email clients ignore stylesheets.

export interface EmailContent {
  /** Hidden preview line shown next to the subject in inboxes. */
  preheader?: string
  heading: string
  /** Plain-text paragraphs; escaped before rendering. */
  paragraphs: string[]
  /** Pre-rendered, trusted HTML inserted after the paragraphs (e.g. a newsletter body). */
  bodyHtml?: string
  bodyText?: string
  cta?: { label: string; href: string }
  /** Small print under the card, e.g. why they got it and how to opt out. */
  footer?: string
  footerLink?: { label: string; href: string }
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Absolute URL on the site, for links inside emails. */
export function siteUrl(path = '/') {
  return new URL(path, env.APP_URL).toString()
}

const NAVY = '#1f4f8a'
const SKY = '#5fb2ee'
const INK = '#101826'
const MUTED = '#5b6676'

export function renderEmail(c: EmailContent): { html: string; text: string } {
  const paragraphs = c.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK}">${escapeHtml(p)}</p>`,
    )
    .join('')
  const cta = c.cta
    ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(c.cta.href)}" style="display:inline-block;background:${SKY};color:#0b0f15;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:12px">${escapeHtml(c.cta.label)}</a></p>`
    : ''
  const footerLink = c.footerLink
    ? ` <a href="${escapeHtml(c.footerLink.href)}" style="color:${MUTED}">${escapeHtml(c.footerLink.label)}</a>`
    : ''
  const footer =
    c.footer || c.footerLink
      ? `<p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:${MUTED}">${escapeHtml(c.footer ?? '')}${footerLink}</p>`
      : ''

  const html = `<!doctype html><html><body style="margin:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(c.preheader ?? '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 16px;font-size:14px;font-weight:600;color:${NAVY}">RHS Coding Club</td></tr>
<tr><td style="background:#ffffff;border-radius:20px;padding:32px 28px">
<h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;letter-spacing:-0.02em;color:${INK}">${escapeHtml(c.heading)}</h1>
${paragraphs}${c.bodyHtml ?? ''}${cta}
</td></tr>
<tr><td style="padding:0 4px">${footer}</td></tr>
</table></td></tr></table></body></html>`

  const text = [
    c.heading,
    '',
    ...c.paragraphs.flatMap((p) => [p, '']),
    ...(c.bodyText ? [c.bodyText, ''] : []),
    ...(c.cta ? [`${c.cta.label}: ${c.cta.href}`, ''] : []),
    ...(c.footer ? [c.footer] : []),
    ...(c.footerLink ? [`${c.footerLink.label}: ${c.footerLink.href}`] : []),
  ].join('\n')

  return { html, text }
}

/** Standard footer for member notifications: points at account settings. */
export function prefsFooter() {
  return {
    footer: 'You get this because you are a member of RHS Coding Club.',
    footerLink: { label: 'Email preferences', href: siteUrl('/account') },
  }
}
