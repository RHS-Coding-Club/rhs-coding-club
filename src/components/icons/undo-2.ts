import { createIcon } from './create-icon'

export const Undo2 = /* @__PURE__ */ createIcon('Undo2', [
  [
    'g',
    [
      ['path', { d: 'M9 14 4 9l5-5' }],
      ['path', { d: 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11' }],
    ],
    {
      animate: { x: [0, -2, 0.6, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
])
