import { createIcon } from './create-icon'
import { QUARTER_TURN } from './moves'

export const CircleX = /* @__PURE__ */ createIcon('CircleX', [
  [
    'circle',
    { cx: 12, cy: 12, r: 10 },
    {
      animate: { scale: [1, 1.1, 0.96, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  [
    'g',
    [
      ['path', { d: 'm15 9-6 6' }],
      ['path', { d: 'm9 9 6 6' }],
    ],
    QUARTER_TURN,
    [12, 12],
  ],
])
