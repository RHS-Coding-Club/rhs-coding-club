import { RichText } from '#/components/rich-text/rich-text'

/**
 * Roughly what subscribers see: the email layout's light card with the club
 * name above and the unsubscribe line below. Always light, like the email.
 */
export function IssuePreview({ subject, content }: { subject: string; content: string }) {
  return (
    <div className="rounded-2xl bg-[#eef2f7] p-4 sm:p-6">
      <p className="px-1 pb-3 text-sm font-semibold text-[#1f4f8a]">RHS Coding Club</p>
      <div className="rounded-[20px] bg-white px-6 py-7 text-[#101826] sm:px-7">
        <h2 className="mb-5 text-2xl leading-tight font-semibold tracking-[-0.02em]">
          {subject || 'Untitled issue'}
        </h2>
        {/* The prose style follows the theme; pin it to the email's ink colors. */}
        <RichText
          value={content}
          className="text-[16px] text-[#101826] [--foreground:#101826] [--muted-foreground:#5b6676]"
        />
      </div>
      <p className="px-1 pt-4 text-xs text-[#5b6676]">
        You get this because you subscribed to the RHS Coding Club newsletter.{' '}
        <span className="underline">Unsubscribe</span>
      </p>
    </div>
  )
}
