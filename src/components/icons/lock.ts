import { createIcon } from './create-icon'

export const Lock = /* @__PURE__ */ createIcon('Lock', [
  [
    'g',
    [
      ['rect', { width: 18, height: 11, x: 3, y: 11, rx: 2, ry: 2 }],
      ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }],
    ],
    {
      animate: { x: [0, -3, 3, -3, 0], rotate: [0, -2, 2, -2, 0] },
      transition: { duration: 0.55 },
    },
    [12, 12],
  ],
])
