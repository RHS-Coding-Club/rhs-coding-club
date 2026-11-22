import { createIcon } from './create-icon'

export const ArrowDownRight = /* @__PURE__ */ createIcon('ArrowDownRight', [
  [
    'g',
    [
      ['path', { d: 'm7 7 10 10' }],
      ['path', { d: 'M17 7v10H7' }],
    ],
    {
      animate: { x: [0, -1.5, 3, 0], y: [0, -1.5, 3, 0] },
      transition: { duration: 0.6, times: [0, 0.2, 0.6, 1], ease: 'easeInOut' },
    },
  ],
])
