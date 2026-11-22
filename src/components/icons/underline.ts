import { createIcon } from './create-icon'
import { BOB } from './moves'

export const Underline = /* @__PURE__ */ createIcon('Underline', [
  ['path', { d: 'M6 4v6a6 6 0 0 0 12 0V4' }, BOB],
  [
    'line',
    { x1: 4, x2: 20, y1: 20, y2: 20 },
    {
      animate: { scaleX: [1, 0.45, 1] },
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.4, 1], delay: 0.1 },
    },
    [4, 20],
  ],
])
