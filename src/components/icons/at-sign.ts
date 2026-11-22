import { createIcon } from './create-icon'

export const AtSign = /* @__PURE__ */ createIcon('AtSign', [
  [
    'circle',
    { cx: 12, cy: 12, r: 4 },
    {
      animate: { scale: [1, 0.8, 1] },
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.2 },
    },
    [12, 12],
  ],
  [
    'path',
    { d: 'M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8' },
    {
      animate: { rotate: [0, 24, -8, 0] },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
    [12, 12],
  ],
])
