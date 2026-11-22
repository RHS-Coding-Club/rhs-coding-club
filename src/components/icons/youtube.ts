import { createIcon } from './create-icon'

export const Youtube = /* @__PURE__ */ createIcon('Youtube', [
  [
    'path',
    {
      d: 'M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17',
    },
    {
      animate: { scale: [1, 1.05, 0.98, 1] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
    [12, 12],
  ],
  [
    'path',
    { d: 'm10 15 5-3-5-3z' },
    {
      animate: { scale: [1, 1.25, 0.92, 1] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.08,
      },
    },
    [12.5, 12],
  ],
])
