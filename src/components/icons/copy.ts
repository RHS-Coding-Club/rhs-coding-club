import { createIcon } from './create-icon'

export const Copy = /* @__PURE__ */ createIcon('Copy', [
  [
    'rect',
    { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 },
    {
      animate: { x: [0, -3, 0], y: [0, -3, 0], rotate: [0, 360] },
      transition: { duration: 0.9, ease: 'easeInOut' },
    },
    [15, 15],
  ],
  [
    'path',
    { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' },
    {
      animate: { x: [0, 3, 0], y: [0, 3, 0] },
      transition: { duration: 0.9, ease: 'easeInOut' },
    },
  ],
])
