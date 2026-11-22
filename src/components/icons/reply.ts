import { createIcon } from './create-icon'

export const Reply = /* @__PURE__ */ createIcon('Reply', [
  [
    'g',
    [
      ['path', { d: 'M20 18v-2a4 4 0 0 0-4-4H4' }],
      ['path', { d: 'm9 17-5-5 5-5' }],
    ],
    {
      animate: { x: [0, -2, 0.6, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
])
