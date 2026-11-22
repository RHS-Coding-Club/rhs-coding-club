import { createIcon } from './create-icon'
import { RING, TICK } from './moves'

export const CalendarCheck = /* @__PURE__ */ createIcon('CalendarCheck', [
  ['path', { d: 'M8 2v4' }, RING],
  ['path', { d: 'M16 2v4' }, RING],
  ['rect', { width: 18, height: 18, x: 3, y: 4, rx: 2 }],
  ['path', { d: 'M3 10h18' }],
  ['path', { d: 'm9 16 2 2 4-4' }, TICK, [12, 16]],
])
