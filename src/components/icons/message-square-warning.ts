import { createIcon } from './create-icon'

export const MessageSquareWarning = /* @__PURE__ */ createIcon('MessageSquareWarning', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
        },
      ],
      [
        'g',
        [
          ['path', { d: 'M12 15h.01' }],
          ['path', { d: 'M12 7v4' }],
        ],
        {
          animate: { rotate: [0, -14, 10, -5, 0] },
          transition: { duration: 0.6, ease: 'easeInOut' },
        },
        [12, 11],
      ],
    ],
    {
      animate: { scale: [1, 0.7, 1.05, 1] },
      transition: { duration: 0.65, ease: 'easeInOut', times: [0, 0.35, 0.75, 1] },
    },
    [4, 20],
  ],
])
