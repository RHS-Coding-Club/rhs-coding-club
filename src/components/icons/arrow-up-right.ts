import { createIcon } from './create-icon'

export const ArrowUpRight = /* @__PURE__ */ createIcon('ArrowUpRight', [
  [
    'g',
    [
      ['path', { d: 'M7 7h10v10' }],
      ['path', { d: 'M7 17 17 7' }],
    ],
    {
      animate: { x: [0, -1.5, 3, 0], y: [0, 1.5, -3, 0] },
      transition: { duration: 0.6, times: [0, 0.2, 0.6, 1], ease: 'easeInOut' },
    },
  ],
])
