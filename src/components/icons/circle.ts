import { createIcon } from './create-icon'

export const Circle = /* @__PURE__ */ createIcon('Circle', [
  [
    'circle',
    { cx: 12, cy: 12, r: 10 },
    {
      animate: {
        y: [0, -1.5, 0, -0.5, 0],
        scaleX: [1, 0.9, 1.08, 0.98, 1],
        scaleY: [1, 0.96, 0.88, 1, 1],
      },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.3, 0.55, 0.75, 1] },
    },
    [12, 22],
  ],
])
