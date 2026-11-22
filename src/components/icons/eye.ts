import { createIcon } from './create-icon'

export const Eye = /* @__PURE__ */ createIcon('Eye', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
        },
      ],
      [
        'circle',
        { cx: 12, cy: 12, r: 3 },
        {
          animate: { x: [0, -2.5, 2.5, 0] },
          transition: { duration: 0.45, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] },
        },
      ],
    ],
    {
      animate: { scaleY: [1, 1, 0.2, 1] },
      transition: { duration: 0.9, ease: 'easeInOut', times: [0, 0.45, 0.72, 1] },
    },
    [12, 12],
  ],
])
