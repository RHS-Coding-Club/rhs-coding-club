import { createIcon } from './create-icon'

export const Bot = /* @__PURE__ */ createIcon('Bot', [
  [
    'g',
    [
      [
        'path',
        { d: 'M12 8V4H8' },
        {
          animate: { rotate: [0, -16, 12, -6, 0] },
          transition: { duration: 0.8, ease: 'easeInOut' },
        },
        [12, 8],
      ],
      ['rect', { width: 16, height: 12, x: 4, y: 8, rx: 2 }],
      ['path', { d: 'M2 14h2' }],
      ['path', { d: 'M20 14h2' }],
      [
        'path',
        { d: 'M15 13v2' },
        {
          animate: { scaleY: [1, 0.1, 0.1, 1] },
          transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.33, 0.67, 1] },
        },
        [15, 14],
      ],
      [
        'path',
        { d: 'M9 13v2' },
        {
          animate: { scaleY: [1, 0.1, 0.1, 1] },
          transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.33, 0.67, 1] },
        },
        [9, 14],
      ],
    ],
    {
      animate: { y: [0, -1.5, 0, -0.75, 0] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
  ],
])
