import { createIcon } from './create-icon'

export const FlaskConical = /* @__PURE__ */ createIcon('FlaskConical', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2',
        },
      ],
      [
        'path',
        { d: 'M6.453 15h11.094' },
        {
          animate: { rotate: [0, 9, -7, 4, 0] },
          transition: { duration: 0.9, ease: 'easeInOut', delay: 0.05 },
        },
        [12, 15],
      ],
      ['path', { d: 'M8.5 2h7' }],
    ],
    {
      animate: { rotate: [0, -10, 8, -5, 0] },
      transition: { duration: 0.9, ease: 'easeInOut' },
    },
    [12, 22],
  ],
])
