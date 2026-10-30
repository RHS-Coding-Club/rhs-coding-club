import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'

/**
 * Uses the native share sheet where there is one (phones), otherwise copies
 * the link and confirms with a toast.
 */
export function ShareButton({ title, summary }: { title: string; summary: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href.split('#')[0]
    const canShare =
      typeof navigator.share === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    if (canShare) {
      try {
        await navigator.share({ title, text: summary, url })
        return
      } catch {
        // Dismissed the sheet; fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy the link. Copy it from the address bar.')
    }
  }

  return (
    <RaisedButton variant="outline" onClick={() => void share()} aria-live="polite">
      {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
      {copied ? 'Link copied' : 'Share'}
    </RaisedButton>
  )
}
