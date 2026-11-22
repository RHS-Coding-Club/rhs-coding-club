import { createIcon } from './create-icon'

export const Instagram = /* @__PURE__ */ createIcon('Instagram', [
  ['rect', { width: 20, height: 20, x: 2, y: 2, rx: 5, ry: 5 }],
  [
    'path',
    { d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' },
    {
      animate: { scale: [1, 1.15, 0.93, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  [
    'line',
    { x1: 17.5, x2: 17.51, y1: 6.5, y2: 6.5 },
    {
      animate: { scale: [1, 1.8, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.2 },
    },
    [17.5, 6.5],
  ],
])
