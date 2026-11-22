import { createIcon } from './create-icon'

export const ShieldAlert = /* @__PURE__ */ createIcon('ShieldAlert', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
        },
      ],
      [
        'g',
        [
          ['path', { d: 'M12 8v4' }],
          ['path', { d: 'M12 16h.01' }],
        ],
        {
          animate: { rotate: [0, -14, 10, -5, 0] },
          transition: { duration: 0.6, ease: 'easeInOut' },
        },
        [12, 12],
      ],
    ],
    {
      animate: { rotate: [0, -7, 4, -1.5, 0], x: [0, -0.6, 0.25, -0.1, 0] },
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.2, 0.5, 0.78, 1] },
    },
    [12, 22],
  ],
])
