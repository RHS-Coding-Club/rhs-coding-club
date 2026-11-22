import { createIcon } from './create-icon'

export const Trash2 = /* @__PURE__ */ createIcon('Trash2', [
  [
    'path',
    { d: 'M10 11v6' },
    {
      animate: { y: [0, 5, 5, 0], opacity: [1, 0, 0, 1] },
      transition: { duration: 0.9, times: [0, 0.35, 0.6, 1], ease: 'easeInOut' },
    },
  ],
  [
    'path',
    { d: 'M14 11v6' },
    {
      animate: { y: [0, 5, 5, 0], opacity: [1, 0, 0, 1] },
      transition: { duration: 0.9, times: [0, 0.35, 0.6, 1], ease: 'easeInOut' },
    },
  ],
  [
    'path',
    { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' },
    {
      animate: { y: [0, 0, 1, 0], scaleY: [1, 1, 0.94, 1] },
      transition: { duration: 0.9, times: [0, 0.55, 0.75, 1], ease: 'easeOut' },
    },
    [12, 22],
  ],
  [
    'g',
    [
      ['path', { d: 'M3 6h18' }],
      ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }],
    ],
    {
      animate: { rotate: [0, -24, -24, 0] },
      transition: { duration: 0.9, times: [0, 0.2, 0.55, 1], ease: 'easeInOut' },
    },
    [3, 6],
  ],
])
