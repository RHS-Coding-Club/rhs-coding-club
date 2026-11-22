import { createIcon } from './create-icon'

export const Strikethrough = /* @__PURE__ */ createIcon('Strikethrough', [
  [
    'g',
    [
      ['path', { d: 'M16 4H9a3 3 0 0 0-2.83 4' }],
      ['path', { d: 'M14 12a4 4 0 0 1 0 8H6' }],
    ],
    {
      animate: { opacity: [1, 0.45, 1] },
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
  ],
  [
    'line',
    { x1: 4, x2: 20, y1: 12, y2: 12 },
    {
      dash: '16',
      animate: { strokeDashoffset: [16, 0] },
      transition: { duration: 0.45, ease: 'easeInOut', delay: 0.1 },
    },
  ],
])
