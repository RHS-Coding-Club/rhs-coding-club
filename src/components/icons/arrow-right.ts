import { createIcon } from './create-icon'

export const ArrowRight = /* @__PURE__ */ createIcon('ArrowRight', [
  [
    'g',
    [
      ['path', { d: 'M5 12h14' }],
      ['path', { d: 'm12 5 7 7-7 7' }],
    ],
    {
      animate: { x: [0, -2, 4, 0] },
      transition: { duration: 0.6, times: [0, 0.2, 0.6, 1], ease: 'easeInOut' },
    },
  ],
])
