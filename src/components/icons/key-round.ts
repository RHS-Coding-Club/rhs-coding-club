import { createIcon } from './create-icon'

export const KeyRound = /* @__PURE__ */ createIcon('KeyRound', [
  [
    'g',
    [
      [
        'path',
        {
          d: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z',
        },
      ],
      ['circle', { cx: 16.5, cy: 7.5, r: 0.5, fill: 'currentColor' }],
    ],
    {
      animate: { rotate: [0, -8, 3, 0] },
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
    [16.5, 7.5],
  ],
])
