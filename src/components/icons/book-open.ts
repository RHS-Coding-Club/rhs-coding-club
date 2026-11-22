import { createIcon } from './create-icon'

export const BookOpen = /* @__PURE__ */ createIcon('BookOpen', [
  ['path', { d: 'M12 7v14' }],
  [
    'path',
    {
      d: 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
    },
    {
      animate: { scaleX: [1, 0.8, 1.05, 1] },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.3, 0.72, 1] },
    },
    [12, 12],
  ],
])
