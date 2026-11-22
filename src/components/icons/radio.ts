import { createIcon } from './create-icon'

export const Radio = /* @__PURE__ */ createIcon('Radio', [
  [
    'g',
    [
      ['path', { d: 'M16.247 7.761a6 6 0 0 1 0 8.478' }],
      ['path', { d: 'M7.753 16.239a6 6 0 0 1 0-8.478' }],
    ],
    {
      animate: { scale: [1, 1.15, 0.97, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.4, 0.75, 1],
        delay: 0.1,
      },
    },
    [12, 12],
  ],
  [
    'g',
    [
      ['path', { d: 'M19.075 4.933a10 10 0 0 1 0 14.134' }],
      ['path', { d: 'M4.925 19.067a10 10 0 0 1 0-14.134' }],
    ],
    {
      animate: { scale: [1, 1.08, 0.97, 1] },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.4, 0.75, 1],
        delay: 0.2,
      },
    },
    [12, 12],
  ],
  [
    'circle',
    { cx: 12, cy: 12, r: 2 },
    {
      animate: { scale: [1, 1.3, 0.97, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
    [12, 12],
  ],
])
