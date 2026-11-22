import { createIcon } from './create-icon'

export const GitPullRequest = /* @__PURE__ */ createIcon('GitPullRequest', [
  [
    'circle',
    { cx: 18, cy: 18, r: 3 },
    {
      animate: { y: [0, -1.8, 0.5, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.12,
      },
    },
  ],
  [
    'circle',
    { cx: 6, cy: 6, r: 3 },
    {
      animate: { y: [0, -1.8, 0.5, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'M13 6h3a2 2 0 0 1 2 2v7' },
    {
      dash: '14 30',
      animate: { strokeDashoffset: [14, 0] },
      transition: { duration: 0.45, ease: 'easeOut', delay: 0.1 },
    },
  ],
  ['line', { x1: 6, x2: 6, y1: 9, y2: 21 }],
])
