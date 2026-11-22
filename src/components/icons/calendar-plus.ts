import { createIcon } from './create-icon'
import { QUARTER_TURN, RING } from './moves'

export const CalendarPlus = /* @__PURE__ */ createIcon('CalendarPlus', [
  ['path', { d: 'M8 2v4' }, RING],
  ['path', { d: 'M16 2v4' }, RING],
  ['path', { d: 'M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5' }],
  ['path', { d: 'M3 10h18' }],
  [
    'g',
    [
      ['path', { d: 'M16 19h6' }],
      ['path', { d: 'M19 16v6' }],
    ],
    QUARTER_TURN,
    [19, 19],
  ],
])
