import { createIcon } from './create-icon'
import { BOB } from './moves'

export const Library = /* @__PURE__ */ createIcon('Library', [
  [
    'path',
    { d: 'm16 6 4 14' },
    {
      animate: { rotate: [0, -8, 3, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.16,
      },
    },
    [20, 20],
  ],
  [
    'path',
    { d: 'M12 6v14' },
    {
      animate: { y: [0, -1.5, 0.5, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.16,
      },
    },
  ],
  [
    'path',
    { d: 'M8 8v12' },
    {
      animate: { y: [0, -1.5, 0.5, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.08,
      },
    },
  ],
  ['path', { d: 'M4 4v16' }, BOB],
])
