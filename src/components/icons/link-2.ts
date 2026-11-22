import { createIcon } from './create-icon'

export const Link2 = /* @__PURE__ */ createIcon('Link2', [
  [
    'path',
    { d: 'M9 17H7A5 5 0 0 1 7 7h2' },
    {
      animate: { x: [0, -1.2, 0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'M15 7h2a5 5 0 1 1 0 10h-2' },
    {
      animate: { x: [0, 1.2, -0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'line',
    { x1: 8, x2: 16, y1: 12, y2: 12 },
    {
      animate: { scaleX: [1, 0.7, 1.06, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
])
