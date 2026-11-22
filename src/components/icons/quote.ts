import { createIcon } from './create-icon'

export const Quote = /* @__PURE__ */ createIcon('Quote', [
  [
    'path',
    {
      d: 'M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
    },
    {
      animate: { scale: [1, 1.2, 1] },
      transition: { duration: 0.45, ease: 'easeInOut' },
    },
    [6.5, 12],
  ],
  [
    'path',
    {
      d: 'M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
    },
    {
      animate: { scale: [1, 1.2, 1] },
      transition: { duration: 0.45, delay: 0.15, ease: 'easeInOut' },
    },
    [17.5, 12],
  ],
])
