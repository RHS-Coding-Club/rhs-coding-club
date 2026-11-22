import { createIcon } from './create-icon'

export const Rss = /* @__PURE__ */ createIcon('Rss', [
  [
    'circle',
    { cx: 5, cy: 19, r: 1 },
    { animate: { scale: [1, 1.6, 1] }, transition: { duration: 0.5, ease: 'easeInOut' } },
    [5, 19],
  ],
  [
    'path',
    { d: 'M4 11a9 9 0 0 1 9 9' },
    {
      animate: { scale: [1, 1.15, 0.97, 1] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        delay: 0.1,
        times: [0, 0.35, 0.7, 1],
      },
    },
    [4, 20],
  ],
  [
    'path',
    { d: 'M4 4a16 16 0 0 1 16 16' },
    {
      animate: { scale: [1, 1.07, 0.97, 1] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        delay: 0.22,
        times: [0, 0.35, 0.7, 1],
      },
    },
    [4, 20],
  ],
])
