import { createIcon } from './create-icon'
import { QUARTER_TURN } from './moves'

export const OctagonX = /* @__PURE__ */ createIcon('OctagonX', [
  [
    'path',
    {
      d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z',
    },
    {
      animate: { scale: [1, 1.08, 0.96, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  [
    'g',
    [
      ['path', { d: 'm15 9-6 6' }],
      ['path', { d: 'm9 9 6 6' }],
    ],
    QUARTER_TURN,
    [12, 12],
  ],
])
