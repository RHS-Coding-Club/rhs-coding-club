'use client'
/*
  React Bits "Card Nav" (https://www.reactbits.dev/components/card-nav),
  installed from the registry. One addition: an `actions` slot that replaces
  the single CTA on the right of the bar, so the site can show "Sign in" +
  "Join" or the account menu there at every width.
*/

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'

export interface CardNavLink {
  label: string
  href?: string
  ariaLabel?: string
}

export interface CardNavItem {
  label: string
  description?: string
  bgColor?: string
  textColor?: string
  links?: CardNavLink[]
}

export interface CardNavCta {
  label: string
  href?: string
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
}

export interface CardNavProps {
  logo?: string | ReactNode
  logoAlt?: string
  logoHref?: string
  items?: CardNavItem[]
  cta?: CardNavCta
  /** Rendered in the CTA position at every width; overrides `cta`. */
  actions?: ReactNode
  theme?: 'dark' | 'light'
  surface?: 'glass' | 'solid'
  openOn?: 'click' | 'hover'
  // RHS: the menu now opens with a CSS clip-path reveal (cards rise 8px and
  // fade, 30ms apart), so these four are accepted for compatibility and ignored.
  cardEffect?: 'rise' | 'unfold' | 'fade'
  stagger?: number
  bounce?: number
  speed?: number
  cardHeight?: number
  maxWidth?: number
  accentColor?: string
  menuLabel?: boolean
  intro?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  linkComponent?: ElementType
  onLinkClick?: (
    link: CardNavLink,
    item: CardNavItem,
    event: ReactMouseEvent<HTMLElement>,
  ) => void
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

interface AnchorProps {
  className: string
  'aria-label'?: string
  tabIndex?: number
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
}

// RHS: the menu toggle's icon and label swap and the link arrows run at
// 250ms and 200ms (were 500ms and 450ms); it's the site's main navigation.
const THEMES: Record<string, Record<string, string>> = {
  dark: {
    '--cn-panel': 'rgba(38, 35, 46, 0.72)',
    '--cn-solid': '#26232e',
    '--cn-edge': 'rgba(255, 255, 255, 0.08)',
    '--cn-highlight': 'rgba(255, 255, 255, 0.07)',
    '--cn-shadow':
      '0 24px 48px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--cn-text': '#f4f4f5',
    '--cn-muted': 'rgba(244, 244, 245, 0.56)',
    '--cn-hover': 'rgba(255, 255, 255, 0.06)',
    '--cn-ring': 'rgba(244, 244, 245, 0.55)',
    '--cn-tile': 'linear-gradient(180deg, #34303d 0%, #27242f 100%)',
    '--cn-tile-rim':
      'inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 10px -4px rgba(0, 0, 0, 0.6)',
    '--cn-cta': 'linear-gradient(180deg, #ffffff 0%, #ebebf0 100%)',
    '--cn-cta-ink': '#121016',
    '--cn-cta-shadow':
      'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 16px -6px rgba(0, 0, 0, 0.6)',
    '--cn-cta-hover': 'brightness(0.94)',
  },
  light: {
    '--cn-panel': 'rgba(244, 244, 246, 0.84)',
    '--cn-solid': '#f4f4f6',
    '--cn-edge': 'rgba(24, 24, 27, 0.07)',
    '--cn-highlight': 'rgba(255, 255, 255, 0.95)',
    '--cn-shadow':
      '0 24px 48px -24px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--cn-text': '#18181b',
    '--cn-muted': 'rgba(24, 24, 27, 0.56)',
    '--cn-hover': 'rgba(24, 24, 27, 0.05)',
    '--cn-ring': 'rgba(24, 24, 27, 0.45)',
    '--cn-tile': 'linear-gradient(180deg, #ffffff 0%, #f8f8fa 100%)',
    '--cn-tile-rim':
      'inset 0 0 0 1px rgba(24, 24, 27, 0.07), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.22)',
    '--cn-cta': 'linear-gradient(180deg, #2c2c31 0%, #18181b 100%)',
    '--cn-cta-ink': '#ffffff',
    '--cn-cta-shadow':
      'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 6px 14px -6px rgba(24, 24, 27, 0.45)',
    '--cn-cta-hover': 'brightness(1.25)',
  },
}

const ROOT =
  'group/cn relative mx-auto h-[var(--cn-bar)] w-full max-w-[var(--cn-max)] text-[14px] leading-[1.4] [-webkit-tap-highlight-color:transparent]'
// RHS: the panel opens with a clip-path reveal at its open height instead of a
// per-frame JS height spring (250ms open, 200ms close, all on the compositor).
// While shown it is full height and clipped to the bar; revealed unclips it
// (stacked variants, so the revealed clip outranks the shown one).
// Its drop shadow lives on SHADOW, because a clip-path would cut it off.
const PANEL =
  'absolute inset-x-0 top-0 z-10 h-[var(--cn-bar)] overflow-hidden rounded-[var(--cn-radius)] [background:var(--cn-panel)] [-webkit-backdrop-filter:var(--cn-blur)] [backdrop-filter:var(--cn-blur)] transition-[clip-path] duration-200 ease-out group-data-[shown]/cn:h-[calc(var(--cn-bar)+var(--cn-open,0px))] group-data-[shown]/cn:[clip-path:inset(0_0_calc(100%_-_var(--cn-bar))_0_round_var(--cn-radius))] group-data-[shown]/cn:group-data-[revealed]/cn:[clip-path:inset(0_0_0_0_round_var(--cn-radius))] group-data-[revealed]/cn:duration-250 group-data-[instant]/cn:transition-none motion-reduce:transition-none'
// RHS: a bar-sized layer that carries the panel's shadow and slides down with
// the panel's bottom edge as it opens.
const SHADOW =
  'pointer-events-none absolute inset-x-0 top-0 z-[9] h-[var(--cn-bar)] rounded-[var(--cn-radius)] [box-shadow:var(--cn-shadow)] transition-[translate] duration-200 ease-out group-data-[revealed]/cn:translate-y-[var(--cn-open,0px)] group-data-[revealed]/cn:duration-250 group-data-[instant]/cn:transition-none motion-reduce:transition-none'
const RIM =
  'pointer-events-none absolute inset-0 z-[3] rounded-[inherit] [box-shadow:inset_0_0_0_1px_var(--cn-edge),inset_0_1px_0_var(--cn-highlight)]'
const BAR =
  'relative z-[2] box-border grid h-[var(--cn-bar)] grid-cols-[1fr_auto_1fr] items-center px-[var(--cn-inset)] group-data-[narrow]/cn:grid-cols-[auto_1fr_auto]'
const MENU =
  'inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] cursor-pointer items-center gap-[10px] justify-self-start rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 pl-[16px] pr-[14px] [background:none] [font-family:inherit] [font-size:inherit] font-medium text-[var(--cn-text)] outline-none transition-[background-color] duration-200 ease-[ease] hover:[background:var(--cn-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)] data-[icon-only]:w-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] data-[icon-only]:justify-center data-[icon-only]:p-0 group-data-[narrow]/cn:col-[3] group-data-[narrow]/cn:row-[1] group-data-[narrow]/cn:justify-self-end'
const BURGER = 'relative h-[12px] w-[18px]'
const LINE_TOP =
  'absolute left-0 top-[2.25px] h-[1.5px] w-full rounded-[2px] bg-current transition-[translate,rotate] duration-250 ease-out group-data-[open]/cn:translate-y-[3px] group-data-[open]/cn:rotate-45 motion-reduce:transition-none'
const LINE_BOTTOM =
  'absolute left-0 top-[8.25px] h-[1.5px] w-full rounded-[2px] bg-current transition-[translate,rotate] duration-250 ease-out group-data-[open]/cn:-translate-y-[3px] group-data-[open]/cn:-rotate-45 motion-reduce:transition-none'
const MENU_LABEL = 'relative inline-grid overflow-hidden'
const WORD_OPEN =
  '[grid-area:1/1] transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:-translate-y-[110%] motion-reduce:transition-none'
const WORD_CLOSE =
  '[grid-area:1/1] translate-y-[110%] transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[open]/cn:translate-y-0 motion-reduce:transition-none'
const LOGO =
  'inline-flex h-[var(--cn-logo)] items-center justify-self-center text-[var(--cn-text)] no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)] [&_img]:block [&_img]:h-full [&_img]:w-auto [&_svg]:block [&_svg]:h-full [&_svg]:w-auto group-data-[narrow]/cn:col-[1] group-data-[narrow]/cn:row-[1] group-data-[narrow]/cn:justify-self-start group-data-[narrow]/cn:pl-[14px]'
const CTA =
  'inline-flex h-[calc(var(--cn-bar)_-_var(--cn-inset)*2)] justify-self-end cursor-pointer items-center justify-center whitespace-nowrap rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 px-[16px] [background:var(--cn-cta)] [box-shadow:var(--cn-cta-shadow)] [font-family:inherit] [font-size:inherit] font-semibold text-[var(--cn-cta-ink)] no-underline outline-none transition-[filter] duration-200 ease-[ease] hover:[filter:var(--cn-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]'
const CTA_WIDE =
  'flex h-[44px] w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] border-0 px-[16px] [background:var(--cn-cta)] [box-shadow:var(--cn-cta-shadow)] [font-family:inherit] [font-size:inherit] font-semibold text-[var(--cn-cta-ink)] no-underline outline-none transition-[filter] duration-200 ease-[ease] hover:[filter:var(--cn-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]'
const CONTENT =
  'pointer-events-none invisible absolute inset-x-0 top-[var(--cn-bar)] box-border flex flex-col gap-[var(--cn-gap)] px-[var(--cn-inset)] pb-[var(--cn-inset)] group-data-[shown]/cn:visible group-data-[revealed]/cn:pointer-events-auto'
// RHS: each card (and the phone CTA) rises 8px and fades in, 30ms apart by
// --i; on close they all leave together, faster.
const REVEAL =
  'opacity-0 translate-y-2 transition-[opacity,translate] duration-150 ease-out group-data-[revealed]/cn:translate-y-0 group-data-[revealed]/cn:opacity-100 group-data-[revealed]/cn:duration-200 group-data-[revealed]/cn:[transition-delay:calc(var(--i,0)*30ms)] group-data-[instant]/cn:transition-none motion-reduce:translate-y-0'
const CARDS = 'flex gap-[var(--cn-gap)] group-data-[narrow]/cn:flex-col'
const CARD =
  'group/card relative box-border flex min-h-[var(--cn-card)] min-w-0 flex-[1_1_0] origin-top flex-col gap-[18px] rounded-[calc(var(--cn-radius)_-_var(--cn-inset))] px-[16px] pb-[14px] pt-[16px] [background:var(--cn-tile)] [box-shadow:var(--cn-tile-rim)] text-[var(--cn-text)] data-[tinted]:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.16),0_4px_10px_-4px_rgba(0,0,0,0.45)] group-data-[narrow]/cn:min-h-0 group-data-[narrow]/cn:flex-none group-data-[narrow]/cn:gap-[10px] group-data-[narrow]/cn:px-[14px] group-data-[narrow]/cn:pb-[12px] group-data-[narrow]/cn:pt-[14px]'
const CARD_HEAD = 'flex flex-col gap-[4px]'
const LABEL = 'text-[17px] font-semibold tracking-[-0.015em]'
const DESCRIPTION =
  'm-0 text-[13px] leading-[1.45] text-[var(--cn-muted)] group-data-[tinted]/card:text-inherit group-data-[tinted]/card:opacity-70'
const LINKS =
  'm-0 mt-auto flex list-none flex-col gap-[2px] p-0 group-data-[narrow]/cn:flex-row group-data-[narrow]/cn:flex-wrap group-data-[narrow]/cn:gap-x-[16px] group-data-[narrow]/cn:gap-y-[2px]'
const LINK =
  'group/link inline-flex cursor-pointer items-center gap-[8px] rounded-[6px] border-0 px-0 py-[3px] [background:none] [font-family:inherit] text-[14px] font-medium text-inherit no-underline opacity-[0.82] outline-none transition-opacity duration-200 ease-[ease] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cn-ring)]'
const ARROW = 'relative inline-block h-[14px] w-[14px] flex-none overflow-hidden'
const ARROW_OUT =
  'absolute inset-0 h-full w-full transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-[110%] group-hover/link:-translate-y-[110%] group-focus-visible/link:translate-x-[110%] group-focus-visible/link:-translate-y-[110%] motion-reduce:transition-none'
const ARROW_IN =
  'absolute inset-0 h-full w-full -translate-x-[110%] translate-y-[110%] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-0 group-hover/link:translate-y-0 group-focus-visible/link:translate-x-0 group-focus-visible/link:translate-y-0 motion-reduce:transition-none'

const DEFAULT_ITEMS: CardNavItem[] = [
  {
    label: 'About',
    description: 'The people and the story behind the studio.',
    links: [
      { label: 'Company', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    label: 'Projects',
    description: 'Selected work from the last few years.',
    links: [
      { label: 'Featured', href: '#' },
      { label: 'Case studies', href: '#' },
    ],
  },
  {
    label: 'Contact',
    description: 'Say hello, we read everything.',
    links: [
      { label: 'Email', href: '#' },
      { label: 'X', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
]

const NARROW = 560
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'

const contrastInk = (color?: string): string | null => {
  const hex = String(color || '')
    .trim()
    .replace('#', '')
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex
  const channel = (index: number) => {
    const value = parseInt(full.slice(index, index + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  return luminance > 0.36 ? '#121016' : '#ffffff'
}

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  logoHref = '#',
  items = DEFAULT_ITEMS,
  cta,
  actions,
  theme = 'dark',
  surface = 'glass',
  openOn = 'click',
  cardHeight = 176,
  maxWidth = 800,
  accentColor,
  menuLabel = true,
  intro = true,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  linkComponent: LinkComponent = 'a',
  onLinkClick,
  ariaLabel = 'Main',
  className = '',
  style,
}: CardNavProps) => {
  const contentId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const leaveRef = useRef(0)
  const barRef = useRef<HTMLDivElement>(null)
  const introRef = useRef(intro)
  const [openState, setOpenState] = useState(defaultOpen)
  const [narrow, setNarrow] = useState(false)
  const [shown, setShown] = useState(defaultOpen)
  const [revealed, setRevealed] = useState(defaultOpen)
  const [instant, setInstant] = useState(false)
  const hideRef = useRef(0)

  const controlled = openProp !== undefined
  const hasCta = Boolean(cta)
  const open = controlled ? openProp : openState

  const palette = THEMES[theme] ?? THEMES.dark
  const vars: Record<string, string> = {
    ...palette,
    '--cn-max': `${maxWidth}px`,
    '--cn-bar': '60px',
    '--cn-inset': '8px',
    '--cn-gap': '8px',
    '--cn-radius': '18px',
    '--cn-logo': '24px',
    '--cn-card': `${cardHeight}px`,
  }
  if (surface === 'glass') vars['--cn-blur'] = 'blur(20px) saturate(1.6)'
  if (surface === 'solid') {
    vars['--cn-panel'] = palette['--cn-solid']
    vars['--cn-blur'] = 'none'
  }
  if (accentColor) {
    vars['--cn-cta'] = accentColor
    vars['--cn-cta-ink'] = contrastInk(accentColor) || '#ffffff'
    vars['--cn-cta-shadow'] =
      'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px -6px rgba(0, 0, 0, 0.45)'
    vars['--cn-cta-hover'] = 'brightness(1.08)'
  }

  const setOpen = (next: boolean) => {
    if (next === open) return
    if (!controlled) setOpenState(next)
    onOpenChange?.(next)
  }
  const setOpenRef = useRef(setOpen)
  setOpenRef.current = setOpen

  // RHS: the open height is measured into --cn-open; CSS does the motion.
  useLayoutEffect(() => {
    const root = rootRef.current
    const content = contentRef.current
    if (!root || !content) return undefined
    const measure = () => root.style.setProperty('--cn-open', `${content.offsetHeight}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [items.length, hasCta, narrow])

  useLayoutEffect(() => {
    window.clearTimeout(hideRef.current)
    if (open) {
      setShown(true)
      // Unclip a frame after the panel is shown at the bar's height, so the
      // reveal starts from the bar.
      let second = 0
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setRevealed(true))
      })
      return () => {
        cancelAnimationFrame(first)
        cancelAnimationFrame(second)
      }
    }
    setRevealed(false)
    if (instant) {
      setShown(false)
      const frame = requestAnimationFrame(() => setInstant(false))
      return () => cancelAnimationFrame(frame)
    }
    // Collapse once the 200ms close has played.
    hideRef.current = window.setTimeout(() => setShown(false), 220)
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const measure = () => setNarrow(root.offsetWidth < NARROW)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      setOpenRef.current(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenRef.current(false)
      menuRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(
    () => () => {
      window.clearTimeout(leaveRef.current)
      window.clearTimeout(hideRef.current)
    },
    [],
  )

  useLayoutEffect(() => {
    const panel = panelRef.current
    const bar = barRef.current
    if (!panel || !bar || !introRef.current) return
    introRef.current = false
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const width = panel.offsetWidth
    const height = panel.offsetHeight
    const radius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 18
    panel.animate(
      [
        {
          clipPath: `inset(0px ${Math.max(0, (width - height) / 2)}px round ${height / 2}px)`,
          opacity: 0,
        },
        { clipPath: `inset(0px 0px round ${radius}px)`, opacity: 1 },
      ],
      { duration: 820, easing: EASE_OUT, fill: 'backwards' },
    )
    Array.from(bar.children).forEach((child, index) => {
      child.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 560, delay: 220 + index * 70, easing: EASE_OUT, fill: 'backwards' },
      )
    })
  }, [])

  const hover = openOn === 'hover'

  const onPointerEnter = (event: ReactPointerEvent) => {
    if (!hover || event.pointerType === 'touch') return
    window.clearTimeout(leaveRef.current)
    setOpen(true)
  }

  const onPointerLeave = (event: ReactPointerEvent) => {
    if (!hover || event.pointerType === 'touch') return
    window.clearTimeout(leaveRef.current)
    leaveRef.current = window.setTimeout(() => setOpenRef.current(false), 160)
  }

  const anchor = (
    target: CardNavLink | CardNavCta,
    props: AnchorProps,
    children: ReactNode,
  ) => {
    if (!target.href) {
      return (
        <button type="button" {...props}>
          {children}
        </button>
      )
    }
    return (
      <LinkComponent href={target.href} {...props}>
        {children}
      </LinkComponent>
    )
  }

  const ctaButton = (target: CardNavCta, wide: boolean) =>
    anchor(
      target,
      {
        className: wide ? CTA_WIDE : CTA,
        tabIndex: wide && !open ? -1 : undefined,
        onClick: (event) => {
          target.onClick?.(event)
          if (wide) setOpen(false)
        },
      },
      target.label,
    )

  return (
    <div
      ref={rootRef}
      className={[ROOT, className].filter(Boolean).join(' ')}
      data-open={open ? '' : undefined}
      data-shown={shown || open ? '' : undefined}
      data-revealed={revealed && open ? '' : undefined}
      data-instant={instant ? '' : undefined}
      data-narrow={narrow ? '' : undefined}
      style={{ ...vars, ...style } as CSSProperties}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <span className={SHADOW} aria-hidden="true" />
      <nav ref={panelRef} className={PANEL} aria-label={ariaLabel}>
        <div ref={barRef} className={BAR}>
          <button
            ref={menuRef}
            type="button"
            className={MENU}
            data-icon-only={menuLabel ? undefined : ''}
            aria-expanded={open}
            aria-controls={contentId}
            aria-label={menuLabel ? undefined : open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            <span className={BURGER} aria-hidden="true">
              <span className={LINE_TOP} />
              <span className={LINE_BOTTOM} />
            </span>
            {menuLabel && (
              <span className={MENU_LABEL}>
                <span className={WORD_OPEN} aria-hidden={open}>
                  Menu
                </span>
                <span className={WORD_CLOSE} aria-hidden={!open}>
                  Close
                </span>
              </span>
            )}
          </button>

          {logo && (
            <LinkComponent href={logoHref} className={LOGO} aria-label={logoAlt}>
              {typeof logo === 'string' ? (
                <img src={logo} alt="" draggable={false} />
              ) : (
                logo
              )}
            </LinkComponent>
          )}

          {actions ? (
            <div className="flex items-center gap-2 justify-self-end">{actions}</div>
          ) : (
            cta && !narrow && ctaButton(cta, false)
          )}
        </div>

        <div ref={contentRef} id={contentId} className={CONTENT} aria-hidden={!open}>
          <div className={CARDS}>
            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={`${CARD} ${REVEAL}`}
                data-tinted={item.bgColor ? '' : undefined}
                style={
                  {
                    '--i': index,
                    ...(item.bgColor
                      ? { background: item.bgColor, color: item.textColor }
                      : {}),
                  } as CSSProperties
                }
              >
                <div className={CARD_HEAD}>
                  <span className={LABEL}>{item.label}</span>
                  {item.description && <p className={DESCRIPTION}>{item.description}</p>}
                </div>
                <ul className={LINKS}>
                  {(item.links ?? []).map((link, linkIndex) => (
                    <li key={`${link.label}-${linkIndex}`}>
                      {anchor(
                        link,
                        {
                          className: LINK,
                          'aria-label': link.ariaLabel,
                          tabIndex: open ? undefined : -1,
                          onClick: (event) => {
                            onLinkClick?.(link, item, event)
                            // RHS: following a link closes the menu at once.
                            setInstant(true)
                            setOpen(false)
                          },
                        },
                        <>
                          <span className={ARROW} aria-hidden="true">
                            <HugeiconsIcon
                              className={ARROW_OUT}
                              icon={ArrowUpRight01Icon}
                              size={14}
                              strokeWidth={2}
                            />
                            <HugeiconsIcon
                              className={ARROW_IN}
                              icon={ArrowUpRight01Icon}
                              size={14}
                              strokeWidth={2}
                            />
                          </span>
                          {link.label}
                        </>,
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {!actions && cta && narrow && (
            <div className={REVEAL} style={{ '--i': items.length } as CSSProperties}>
              {ctaButton(cta, true)}
            </div>
          )}
        </div>
        <span className={RIM} />
      </nav>
    </div>
  )
}

export default CardNav
