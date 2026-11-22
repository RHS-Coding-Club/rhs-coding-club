import { createIcon } from './create-icon'

export const PartyPopper = /* @__PURE__ */ createIcon('PartyPopper', [
  [
    'g',
    [
      ['path', { d: 'M5.8 11.3 2 22l10.7-3.79' }],
      [
        'path',
        {
          d: 'M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z',
        },
      ],
    ],
    {
      animate: { rotate: [0, -7, 3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.3, 0.65, 1] },
    },
    [2, 22],
  ],
  [
    'path',
    {
      d: 'm22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10',
    },
    {
      animate: { scale: [1, 0.88, 1.06, 1] },
      transition: {
        duration: 0.55,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1],
        delay: 0.1,
      },
    },
    [10, 15],
  ],
  [
    'path',
    { d: 'm22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17' },
    {
      animate: { scale: [1, 0.88, 1.06, 1] },
      transition: {
        duration: 0.55,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1],
        delay: 0.16,
      },
    },
    [10, 15],
  ],
  [
    'path',
    { d: 'm11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7' },
    {
      animate: { scale: [1, 0.88, 1.06, 1] },
      transition: {
        duration: 0.55,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1],
        delay: 0.13,
      },
    },
    [10, 15],
  ],
  [
    'path',
    { d: 'M4 3h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.25 },
    },
    [4, 3],
  ],
  [
    'path',
    { d: 'M15 2h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
    },
    [15, 2],
  ],
  [
    'path',
    { d: 'M22 8h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.35 },
    },
    [22, 8],
  ],
  [
    'path',
    { d: 'M22 20h.01' },
    {
      animate: { scale: [1, 1.7, 1] },
      transition: { duration: 0.4, ease: 'easeInOut', delay: 0.4 },
    },
    [22, 20],
  ],
])
