import { createIcon } from './create-icon'

export const ArrowLeft = /* @__PURE__ */ createIcon('ArrowLeft', [
  [
    'g',
    [
      ['path', { d: 'm12 19-7-7 7-7' }],
      ['path', { d: 'M19 12H5' }],
    ],
    {
      animate: { x: [0, 2, -4, 0] },
      transition: { duration: 0.6, times: [0, 0.2, 0.6, 1], ease: 'easeInOut' },
    },
  ],
])
