import type { ReactNode } from 'react'
import type { IconComponent } from '#/components/icons/create-icon'

export interface LegalSection {
  id: string
  title: string
  /**
   * One plain line that restates the section, never adds to it. The full
   * text is what counts; this is for skimming.
   */
  short: string
  body: ReactNode
}

export interface LegalDoc {
  kind: 'privacy' | 'terms'
  title: string
  description: string
  updated: string
  updatedIso: string
  /** Reading time for the full text. */
  minutes: number
  /** Four highlights, each a restatement of something the sections already say. */
  glance: { icon: IconComponent; title: string; text: string }[]
  sections: LegalSection[]
}

export const DOC_TABS = [
  { kind: 'privacy', label: 'Privacy', to: '/privacy' },
  { kind: 'terms', label: 'Terms of use', to: '/terms' },
] as const
