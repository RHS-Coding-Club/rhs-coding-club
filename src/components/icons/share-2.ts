import { createIcon } from './create-icon'

export const Share2 = /* @__PURE__ */ createIcon('Share2', [
  [
    'circle',
    { cx: 18, cy: 5, r: 3 },
    {
      animate: { scale: [1, 1.2, 0.95, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.28,
      },
    },
    [18, 5],
  ],
  [
    'circle',
    { cx: 6, cy: 12, r: 3 },
    {
      animate: { scale: [1, 1.2, 0.95, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [6, 12],
  ],
  [
    'circle',
    { cx: 18, cy: 19, r: 3 },
    {
      animate: { scale: [1, 1.2, 0.95, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.28,
      },
    },
    [18, 19],
  ],
  [
    'line',
    { x1: 8.59, x2: 15.42, y1: 13.51, y2: 17.49 },
    {
      dash: '8',
      animate: { strokeDashoffset: [8, 0] },
      transition: { duration: 0.35, ease: 'easeOut', delay: 0.12 },
    },
  ],
  [
    'line',
    { x1: 15.41, x2: 8.59, y1: 6.51, y2: 10.49 },
    {
      dash: '8',
      animate: { strokeDashoffset: [-8, 0] },
      transition: { duration: 0.35, ease: 'easeOut', delay: 0.12 },
    },
  ],
])
