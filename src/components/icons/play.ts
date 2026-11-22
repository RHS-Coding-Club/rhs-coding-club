/**
 * Plays an icon when the control around it is hovered or gets keyboard focus. One pair of
 * document listeners serves every icon on the page, and exists only while there are icons.
 */

/** An icon answers to the nearest of these, or to itself when it isn't inside one. */
const HOST = [
  'a',
  'button',
  'summary',
  'label',
  ...['button', 'link', 'menuitem', 'option', 'switch', 'tab'].map((r) => `[role=${r}]`),
].join()

const DISABLED = ':disabled, [aria-disabled=true], [data-disabled]'

/** Icons that show a control's state, and toasts, never move. */
const CALM =
  '[data-slot$=indicator], [data-slot^=select-], [role=menuitemcheckbox], [role=menuitemradio], [data-sonner-toast]'

const icons = new Map<Element, () => void>()
let hovered: Element | null = null

/** Calls `play` when the icon should animate, until the returned function is called. */
export function watchIcon(svg: SVGSVGElement, play: () => void): () => void {
  if (icons.size === 0) {
    document.addEventListener('pointerover', onPointerOver, { passive: true })
    document.addEventListener('focusin', onFocusIn)
  }
  icons.set(svg, play)
  return () => {
    icons.delete(svg)
    if (icons.size > 0) return
    document.removeEventListener('pointerover', onPointerOver)
    document.removeEventListener('focusin', onFocusIn)
    hovered = null
  }
}

function onPointerOver(event: PointerEvent) {
  // A finger has no hover: it would play the icon on every tap and scroll.
  if (event.pointerType === 'touch' || !(event.target instanceof Element)) return
  const host = event.target.closest(HOST) ?? event.target.closest('svg')
  if (host === hovered) return
  hovered = host
  if (host) playIcons(host)
}

function onFocusIn({ target }: FocusEvent) {
  if (
    target instanceof Element &&
    target.matches(HOST) &&
    target.matches(':focus-visible')
  )
    playIcons(target)
}

function playIcons(host: Element) {
  if (host.matches(DISABLED)) return
  // Motion's reducedMotion setting still plays fades and line drawing.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const svgs = host.matches('svg') ? [host] : host.querySelectorAll('svg')
  for (const svg of svgs) {
    const play = icons.get(svg)
    if (!play || svg.closest(CALM)) continue
    // Leave icons inside a nested control to that control.
    if (host === svg || svg.closest(HOST) === host) play()
  }
}
