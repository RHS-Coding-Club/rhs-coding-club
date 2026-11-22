import { createIcon } from './create-icon'

export const Award = /* @__PURE__ */ createIcon('Award', [
  [
    'path',
    {
      d: 'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
    },
    {
      animate: { rotate: [0, -8, 6, -3, 0] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    [12, 8],
  ],
  [
    'circle',
    { cx: 12, cy: 8, r: 6 },
    {
      animate: { scale: [1, 1.1, 0.96, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 8],
  ],
])
