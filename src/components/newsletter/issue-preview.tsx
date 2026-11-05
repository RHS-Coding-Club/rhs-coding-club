import { RichText } from '#/components/rich-text/rich-text'
import { BRAND, EMAIL } from '#/lib/static-palette'

/**
 * Roughly what subscribers see: the email layout's light card with the club
 * name above and the unsubscribe line below. Always light, like the email, so
 * it uses the email's palette instead of the theme tokens.
 */
export function IssuePreview({ subject, content }: { subject: string; content: string }) {
  return (
    <div className="rounded-2xl p-4 sm:p-6" style={{ background: EMAIL.ground }}>
      <p className="px-1 pb-3 text-sm font-semibold" style={{ color: BRAND.navy }}>
        RHS Coding Club
      </p>
      <div
        className="rounded-[20px] px-6 py-7 sm:px-7"
        style={{ background: EMAIL.card, color: BRAND.ink }}
      >
        <h2 className="mb-5 text-2xl leading-tight font-semibold tracking-[-0.02em]">
          {subject || 'Untitled issue'}
        </h2>
        {/* The prose style follows the theme; pin it to the email's ink colors. */}
        <div
          style={
            {
              '--foreground': BRAND.ink,
              '--muted-foreground': EMAIL.muted,
            } as React.CSSProperties
          }
        >
          <RichText value={content} className="text-[16px]" />
        </div>
      </div>
      <p className="px-1 pt-4 text-xs" style={{ color: EMAIL.muted }}>
        You get this because you subscribed to the RHS Coding Club newsletter.{' '}
        <span className="underline">Unsubscribe</span>
      </p>
    </div>
  )
}
