import { createIcon } from './create-icon'

export const Italic = /* @__PURE__ */ createIcon('Italic', [
  [
    'g',
    [
      ['line', { x1: 19, x2: 10, y1: 4, y2: 4 }],
      ['line', { x1: 14, x2: 5, y1: 20, y2: 20 }],
      ['line', { x1: 15, x2: 9, y1: 4, y2: 20 }],
    ],
    {
      animate: { skewX: [0, -14, 4, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
    [12, 12],
  ],
])
