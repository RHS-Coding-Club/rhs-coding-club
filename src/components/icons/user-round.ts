import { createIcon } from './create-icon'
import { BOB } from './moves'

export const UserRound = /* @__PURE__ */ createIcon('UserRound', [
  ['circle', { cx: 12, cy: 8, r: 5 }, BOB],
  [
    'path',
    { d: 'M20 21a8 8 0 0 0-16 0' },
    {
      animate: { scaleY: [1, 0.88, 1.04, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 21],
  ],
])
