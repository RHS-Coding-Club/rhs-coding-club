import { createIcon } from './create-icon'

export const Pencil = /* @__PURE__ */ createIcon('Pencil', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
        },
      ],
      ['path', { d: 'm15 5 4 4' }],
    ],
    {
      animate: { rotate: [0, -4.5, 4, -2, 0] },
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
    [3, 21],
  ],
])
