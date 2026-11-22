import { createIcon } from './create-icon'

export const RotateCw = /* @__PURE__ */ createIcon('RotateCw', [
  [
    'g',
    [
      ['path', { d: 'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8' }],
      ['path', { d: 'M21 3v5h-5' }],
    ],
    {
      animate: { rotate: [0, 360], scale: [1, 0.9, 1] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    [12, 12],
  ],
])
