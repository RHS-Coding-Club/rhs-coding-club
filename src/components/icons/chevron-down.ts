import { createIcon } from './create-icon'

export const ChevronDown = /* @__PURE__ */ createIcon('ChevronDown', [
  [
    'path',
    { d: 'm6 9 6 6 6-6' },
    {
      animate: { y: [0, 2.5, -0.625, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
  ],
])
