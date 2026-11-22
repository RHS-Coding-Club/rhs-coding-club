import { createIcon } from './create-icon'

export const TriangleAlert = /* @__PURE__ */ createIcon('TriangleAlert', [
  [
    'path',
    { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' },
    {
      animate: { scale: [1, 1.07, 0.97, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 13],
  ],
  [
    'g',
    [
      ['path', { d: 'M12 9v4' }],
      ['path', { d: 'M12 17h.01' }],
    ],
    {
      animate: { rotate: [0, -14, 12, -6, 0] },
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
    [12, 13],
  ],
])
