import { createIcon } from './create-icon'

export const Sparkles = /* @__PURE__ */ createIcon('Sparkles', [
  [
    'path',
    {
      d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
    },
    {
      animate: { rotate: [0, 14, -8, 0], scale: [1, 1.1, 0.95, 1] },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  [
    'g',
    [
      ['path', { d: 'M20 2v4' }],
      ['path', { d: 'M22 4h-4' }],
    ],
    {
      animate: { rotate: [0, 45, 0], scale: [1, 1.3, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', delay: 0.12 },
    },
    [20, 4],
  ],
  [
    'circle',
    { cx: 4, cy: 20, r: 2 },
    {
      animate: { scale: [1, 1.4, 0.9, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        delay: 0.25,
        times: [0, 0.35, 0.7, 1],
      },
    },
    [4, 20],
  ],
])
