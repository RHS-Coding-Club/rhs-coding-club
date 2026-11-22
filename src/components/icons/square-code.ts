import { createIcon } from './create-icon'

export const SquareCode = /* @__PURE__ */ createIcon('SquareCode', [
  [
    'path',
    { d: 'm10 9-3 3 3 3' },
    {
      animate: { x: [0, -1.2, 0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'm14 15 3-3-3-3' },
    {
      animate: { x: [0, 1.2, -0.3, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'rect',
    { x: 3, y: 3, width: 18, height: 18, rx: 2 },
    {
      animate: { scale: [1, 1.06, 0.97, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
])
