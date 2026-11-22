import { createIcon } from './create-icon'

export const Heading3 = /* @__PURE__ */ createIcon('Heading3', [
  [
    'path',
    { d: 'M4 12h8' },
    {
      animate: { y: [0, -2.5, 0.8, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  ['path', { d: 'M4 18V6' }],
  ['path', { d: 'M12 18V6' }],
  [
    'g',
    [
      ['path', { d: 'M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2' }],
      ['path', { d: 'M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2' }],
    ],
    {
      animate: { y: [0, -2, 0.8, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.12,
      },
    },
  ],
])
