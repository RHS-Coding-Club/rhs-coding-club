import { createIcon } from './create-icon'

export const Bold = /* @__PURE__ */ createIcon('Bold', [
  [
    'path',
    { d: 'M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8' },
    {
      dash: '68',
      animate: { strokeDashoffset: [68, 0], opacity: [0, 1], strokeWidth: [2, 3.4, 2] },
      transition: {
        strokeDashoffset: { duration: 0.5, ease: 'easeOut' },
        opacity: { duration: 0.25, ease: 'easeOut' },
        strokeWidth: { duration: 0.5, delay: 0.4, ease: 'easeInOut' },
      },
    },
  ],
])
