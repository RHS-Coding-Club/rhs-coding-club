import { createIcon } from './create-icon'
import { RING, TICK } from './moves'

export const CalendarCheck2 = /* @__PURE__ */ createIcon('CalendarCheck2', [
  ['path', { d: 'M8 2v4' }, RING],
  ['path', { d: 'M16 2v4' }, RING],
  ['path', { d: 'M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8' }],
  ['path', { d: 'M3 10h18' }],
  ['path', { d: 'm16 20 2 2 4-4' }, TICK, [19, 20]],
])
