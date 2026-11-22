import { createIcon } from './create-icon'

export const Inbox = /* @__PURE__ */ createIcon('Inbox', [
  [
    'polyline',
    { points: '22 12 16 12 14 15 10 15 8 12 2 12' },
    {
      animate: { scaleY: [1, 1.7, 0.9, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  [
    'path',
    {
      d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    },
  ],
])
