import { createIcon } from './create-icon'

export const Crown = /* @__PURE__ */ createIcon('Crown', [
  [
    'path',
    {
      d: 'M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z',
    },
    {
      animate: { y: [0, -5, 0.8, 0], rotate: [0, -8, 4, 0], opacity: [1, 0, 1, 1] },
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1],
        opacity: { duration: 0.8, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] },
      },
    },
    [12, 17],
  ],
  [
    'path',
    { d: 'M5 21h14' },
    {
      animate: { scaleX: [1, 1, 0.8, 1.06, 1] },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.6, 0.72, 0.86, 1] },
    },
    [12, 21],
  ],
])
