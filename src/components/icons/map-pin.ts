import { createIcon } from './create-icon'

export const MapPin = /* @__PURE__ */ createIcon('MapPin', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
        },
      ],
      ['circle', { cx: 12, cy: 10, r: 3 }],
    ],
    {
      animate: { y: [0, 1, 0.3, 0], rotate: [0, -9, 7, -3, 0] },
      transition: {
        y: { duration: 0.5, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] },
        rotate: { duration: 0.7, ease: 'easeInOut' },
      },
    },
    [12, 22],
  ],
])
