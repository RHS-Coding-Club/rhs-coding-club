import { createIcon } from './create-icon'
import { BOB } from './moves'

export const UserMinus = /* @__PURE__ */ createIcon('UserMinus', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
  ['circle', { cx: 9, cy: 7, r: 4 }, BOB],
  [
    'line',
    { x1: 22, x2: 16, y1: 11, y2: 11 },
    {
      animate: { rotate: [0, 180], scale: [1, 0.7, 1] },
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    [19, 11],
  ],
])
