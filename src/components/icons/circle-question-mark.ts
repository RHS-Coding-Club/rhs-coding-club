import { createIcon } from './create-icon'

export const CircleQuestionMark = /* @__PURE__ */ createIcon('CircleQuestionMark', [
  [
    'circle',
    { cx: 12, cy: 12, r: 10 },
    {
      animate: { scale: [1, 1.1, 0.96, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  [
    'path',
    { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' },
    {
      animate: { rotate: [0, -12, 10, -4, 0] },
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
    [12, 13],
  ],
  [
    'path',
    { d: 'M12 17h.01' },
    {
      animate: { y: [0, -1.5, 0.44999999999999996, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.1,
      },
    },
  ],
])
