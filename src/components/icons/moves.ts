import type { Move } from './create-icon'

// Moves several icons share. Icons list their other moves themselves.

/** A check mark draws itself and settles. */
export const TICK: Move = {
  dash: '10',
  animate: { strokeDashoffset: [10, 0], opacity: [0, 1], scale: [0.8, 1.12, 1] },
  transition: {
    strokeDashoffset: { duration: 0.45, ease: 'easeOut', delay: 0.15 },
    opacity: { duration: 0.25, delay: 0.15 },
    scale: { duration: 0.45, delay: 0.19, times: [0, 0.6, 1], ease: 'easeInOut' },
  },
}

/** A plus or cross makes a quarter turn. */
export const QUARTER_TURN: Move = {
  animate: { rotate: [0, 90], scale: [1, 1.2, 1] },
  transition: { duration: 0.5, ease: 'easeInOut' },
}

export const FULL_TURN: Move = {
  animate: { rotate: [0, 360] },
  transition: { duration: 0.9, ease: 'easeInOut' },
}

/** A person's head bobs. */
export const BOB: Move = {
  animate: { y: [0, -1.5, 0.5, 0] },
  transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
}

/** A calendar's rings press into the page. */
export const RING: Move = {
  animate: { y: [0, 1.6, -0.3, 0] },
  transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
}

/** An envelope's flap opens and closes. */
export const FLAP: Move = {
  animate: { scaleY: [1, -0.8, -0.8, 1] },
  transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.65, 1] },
}
