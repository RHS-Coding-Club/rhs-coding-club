import { createIcon } from './create-icon'
import { QUARTER_TURN } from './moves'

export const Plus = /* @__PURE__ */ createIcon('Plus', [
  [
    'g',
    [
      ['path', { d: 'M5 12h14' }],
      ['path', { d: 'M12 5v14' }],
    ],
    QUARTER_TURN,
    [12, 12],
  ],
])
