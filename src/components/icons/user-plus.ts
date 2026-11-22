import { createIcon } from './create-icon'
import { BOB, QUARTER_TURN } from './moves'

export const UserPlus = /* @__PURE__ */ createIcon('UserPlus', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
  ['circle', { cx: 9, cy: 7, r: 4 }, BOB],
  [
    'g',
    [
      ['line', { x1: 19, x2: 19, y1: 8, y2: 14 }],
      ['line', { x1: 22, x2: 16, y1: 11, y2: 11 }],
    ],
    QUARTER_TURN,
    [19, 11],
  ],
])
