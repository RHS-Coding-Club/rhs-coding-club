import { createIcon } from './create-icon'
import { RING } from './moves'

export const Calendar = /* @__PURE__ */ createIcon('Calendar', [
  ['path', { d: 'M8 2v4' }, RING],
  ['path', { d: 'M16 2v4' }, RING],
  [
    'g',
    [
      ['rect', { width: 18, height: 18, x: 3, y: 4, rx: 2 }],
      ['path', { d: 'M3 10h18' }],
    ],
    {
      animate: { scaleY: [1, 1, 0.96, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 0.65, 1] },
    },
    [12, 22],
  ],
])
