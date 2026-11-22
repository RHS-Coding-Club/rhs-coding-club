import { createIcon } from './create-icon'

export const ChevronLeft = /* @__PURE__ */ createIcon('ChevronLeft', [
  [
    'path',
    { d: 'm15 18-6-6 6-6' },
    {
      animate: { x: [0, -2.5, 0.625, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
  ],
])
