import { createIcon } from './create-icon'

export const ArrowDown = /* @__PURE__ */ createIcon('ArrowDown', [
  [
    'g',
    [
      ['path', { d: 'M12 5v14' }],
      ['path', { d: 'm19 12-7 7-7-7' }],
    ],
    {
      animate: { y: [0, -2, 4, 0] },
      transition: { duration: 0.6, times: [0, 0.2, 0.6, 1], ease: 'easeInOut' },
    },
  ],
])
