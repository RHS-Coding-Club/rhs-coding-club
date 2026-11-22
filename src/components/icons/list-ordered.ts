import { createIcon } from './create-icon'

export const ListOrdered = /* @__PURE__ */ createIcon('ListOrdered', [
  [
    'path',
    { d: 'M11 5h10' },
    {
      animate: { scaleX: [1, 0.55, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.05 },
    },
    [11, 5],
  ],
  [
    'path',
    { d: 'M11 12h10' },
    {
      animate: { scaleX: [1, 0.55, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.17 },
    },
    [11, 12],
  ],
  [
    'path',
    { d: 'M11 19h10' },
    {
      animate: { scaleX: [1, 0.55, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.29 },
    },
    [11, 19],
  ],
  [
    'g',
    [
      ['path', { d: 'M4 4h1v5' }],
      ['path', { d: 'M4 9h2' }],
    ],
    {
      animate: { scale: [1, 1.25, 1] },
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
    [4.5, 6.5],
  ],
  [
    'path',
    { d: 'M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02' },
    {
      animate: { scale: [1, 1.25, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.24 },
    },
    [4.7, 17.5],
  ],
])
