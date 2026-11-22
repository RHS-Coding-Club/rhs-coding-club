import { createIcon } from './create-icon'

export const Code = /* @__PURE__ */ createIcon('Code', [
  [
    'g',
    [
      [
        'path',
        { d: 'm8 6-6 6 6 6' },
        {
          animate: { x: [0, 3, 0], opacity: [1, 0.6, 1] },
          transition: { duration: 0.55, ease: 'easeOut' },
        },
      ],
      [
        'path',
        { d: 'm16 18 6-6-6-6' },
        {
          animate: { x: [0, -3, 0], opacity: [1, 0.6, 1] },
          transition: { duration: 0.55, delay: 0.09, ease: 'easeOut' },
        },
      ],
    ],
    {
      animate: { scaleX: [1, 0.75, 1] },
      transition: { duration: 0.48, ease: 'easeOut' },
    },
    [12, 12],
  ],
])
