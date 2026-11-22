import { createIcon } from './create-icon'

export const Bookmark = /* @__PURE__ */ createIcon('Bookmark', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z',
        },
      ],
    ],
    {
      animate: { y: [0, -4, 0], scaleY: [1, 1.1, 0.95, 1], scaleX: [1, 0.97, 1.02, 1] },
      transition: { duration: 0.55, ease: 'easeOut' },
    },
    [12, 12],
  ],
])
