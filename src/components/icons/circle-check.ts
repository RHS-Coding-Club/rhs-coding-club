import { createIcon } from './create-icon'
import { TICK } from './moves'

export const CircleCheck = /* @__PURE__ */ createIcon('CircleCheck', [
  [
    'circle',
    { cx: 12, cy: 12, r: 10 },
    {
      animate: { scale: [1, 1.08, 0.96, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  ['path', { d: 'm9 12 2 2 4-4' }, TICK, [12, 12]],
])
