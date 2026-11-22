import { createIcon } from './create-icon'

export const Minus = /* @__PURE__ */ createIcon('Minus', [
  [
    'path',
    { d: 'M5 12h14' },
    {
      animate: { rotate: [0, 180], scale: [1, 0.7, 1] },
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    [12, 12],
  ],
])
