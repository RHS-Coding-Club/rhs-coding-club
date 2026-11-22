import { createIcon } from './create-icon'

export const Info = /* @__PURE__ */ createIcon('Info', [
  [
    'circle',
    { cx: 12, cy: 12, r: 10 },
    {
      animate: { scale: [1, 1.08, 0.97, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  ['path', { d: 'M12 16v-4' }],
  [
    'path',
    { d: 'M12 8h.01' },
    {
      animate: { y: [0, -2, 0.6, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.08,
      },
    },
  ],
])
