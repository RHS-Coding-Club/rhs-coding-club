import { createIcon } from './create-icon'

export const Trophy = /* @__PURE__ */ createIcon('Trophy', [
  [
    'g',
    [
      ['path', { d: 'M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978' }],
      ['path', { d: 'M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978' }],
      ['path', { d: 'M18 9h1.5a1 1 0 0 0 0-5H18' }],
      ['path', { d: 'M4 22h16' }],
      ['path', { d: 'M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z' }],
      ['path', { d: 'M6 9H4.5a1 1 0 0 1 0-5H6' }],
    ],
    {
      animate: { y: [0, -2, 0, -1, 0], rotate: [0, -8, 6, -3, 0] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    [12, 22],
  ],
])
