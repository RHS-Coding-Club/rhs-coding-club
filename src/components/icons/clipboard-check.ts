import { createIcon } from './create-icon'
import { TICK } from './moves'

export const ClipboardCheck = /* @__PURE__ */ createIcon('ClipboardCheck', [
  [
    'rect',
    { width: 8, height: 4, x: 8, y: 2, rx: 1, ry: 1 },
    {
      animate: { y: [0, -1, 0.4, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
  ],
  ['path', { d: 'm9 14 2 2 4-4' }, TICK, [12, 14]],
])
