import { createIcon } from './create-icon'

export const RotateCcw = /* @__PURE__ */ createIcon('RotateCcw', [
  [
    'g',
    [
      ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
      ['path', { d: 'M3 3v5h5' }],
    ],
    {
      animate: { rotate: [0, -360], scale: [1, 0.9, 1] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    [12, 12],
  ],
])
