import { createIcon } from './create-icon'

export const ArrowUp = /* @__PURE__ */ createIcon('ArrowUp', [
  [
    'g',
    [
      ['path', { d: 'm5 12 7-7 7 7' }],
      ['path', { d: 'M12 19V5' }],
    ],
    {
      animate: { y: [0, 2, -4, 0] },
      transition: { duration: 0.6, times: [0, 0.2, 0.6, 1], ease: 'easeInOut' },
    },
  ],
])
