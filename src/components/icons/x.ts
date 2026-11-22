import { createIcon } from './create-icon'
import { QUARTER_TURN } from './moves'

export const X = /* @__PURE__ */ createIcon('X', [
  [
    'g',
    [
      ['path', { d: 'M18 6 6 18' }],
      ['path', { d: 'm6 6 12 12' }],
    ],
    QUARTER_TURN,
    [12, 12],
  ],
])
