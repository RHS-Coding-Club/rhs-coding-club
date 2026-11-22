import { createIcon } from './create-icon'

export const NotebookPen = /* @__PURE__ */ createIcon('NotebookPen', [
  ['path', { d: 'M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4' }],
  [
    'path',
    { d: 'M2 6h4' },
    {
      animate: { scaleX: [1, 0.3, 1] },
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    [4, 6],
  ],
  [
    'path',
    { d: 'M2 10h4' },
    {
      animate: { scaleX: [1, 0.3, 1] },
      transition: { duration: 0.3, ease: 'easeInOut', delay: 0.08 },
    },
    [4, 10],
  ],
  [
    'path',
    { d: 'M2 14h4' },
    {
      animate: { scaleX: [1, 0.3, 1] },
      transition: { duration: 0.3, ease: 'easeInOut', delay: 0.16 },
    },
    [4, 14],
  ],
  [
    'path',
    { d: 'M2 18h4' },
    {
      animate: { scaleX: [1, 0.3, 1] },
      transition: { duration: 0.3, ease: 'easeInOut', delay: 0.24 },
    },
    [4, 18],
  ],
  [
    'path',
    {
      d: 'M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z',
    },
    {
      animate: {
        x: [0, -1.5, 1, -1, 0],
        y: [0, 1, -0.5, 0.8, 0],
        rotate: [0, -8, 4, -4, 0],
      },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    [13, 11],
  ],
])
