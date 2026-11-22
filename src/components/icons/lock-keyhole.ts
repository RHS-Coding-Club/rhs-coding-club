import { createIcon } from './create-icon'

export const LockKeyhole = /* @__PURE__ */ createIcon('LockKeyhole', [
  [
    'g',
    [
      [
        'circle',
        { cx: 12, cy: 16, r: 1 },
        {
          animate: { scale: [1, 1.5, 1] },
          transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
        },
        [12, 16],
      ],
      ['rect', { x: 3, y: 10, width: 18, height: 12, rx: 2 }],
      ['path', { d: 'M7 10V7a5 5 0 0 1 10 0v3' }],
    ],
    {
      animate: { x: [0, -3, 3, -3, 0], rotate: [0, -2, 2, -2, 0] },
      transition: { duration: 0.55, ease: 'easeInOut' },
    },
    [12, 12],
  ],
])
