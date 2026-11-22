import { createIcon } from './create-icon'
import { QUARTER_TURN } from './moves'

export const SearchX = /* @__PURE__ */ createIcon('SearchX', [
  [
    'g',
    [
      ['circle', { cx: 11, cy: 11, r: 8 }],
      ['path', { d: 'm21 21-4.3-4.3' }],
      [
        'g',
        [
          ['path', { d: 'm13.5 8.5-5 5' }],
          ['path', { d: 'm8.5 8.5 5 5' }],
        ],
        QUARTER_TURN,
        [11, 11],
      ],
    ],
    {
      animate: { scale: [1, 1.06, 0.97, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [11, 11],
  ],
])
