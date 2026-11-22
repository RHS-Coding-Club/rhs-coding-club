import { createIcon } from './create-icon'

export const Ellipsis = /* @__PURE__ */ createIcon('Ellipsis', [
  [
    'circle',
    { cx: 5, cy: 12, r: 1 },
    { animate: { y: [0, -3, 0] }, transition: { duration: 0.55, ease: 'easeInOut' } },
  ],
  [
    'circle',
    { cx: 12, cy: 12, r: 1 },
    {
      animate: { y: [0, -3, 0] },
      transition: { duration: 0.55, delay: 0.12, ease: 'easeInOut' },
    },
  ],
  [
    'circle',
    { cx: 19, cy: 12, r: 1 },
    {
      animate: { y: [0, -3, 0] },
      transition: { duration: 0.55, delay: 0.24, ease: 'easeInOut' },
    },
  ],
])
