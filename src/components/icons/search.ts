import { createIcon } from './create-icon'

export const Search = /* @__PURE__ */ createIcon('Search', [
  [
    'g',
    [
      ['path', { d: 'm21 21-4.34-4.34' }],
      ['circle', { cx: 11, cy: 11, r: 8 }],
    ],
    {
      animate: { x: [0, 2, -2, 1, 0], y: [0, -1, 2, -1, 0], rotate: [0, 6, -6, 4, 0] },
      transition: { duration: 1, ease: 'easeInOut' },
    },
    [12, 12],
  ],
])
