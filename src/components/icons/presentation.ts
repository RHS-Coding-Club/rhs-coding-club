import { createIcon } from './create-icon'

export const Presentation = /* @__PURE__ */ createIcon('Presentation', [
  [
    'g',
    [
      ['path', { d: 'M2 3h20' }],
      ['path', { d: 'M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3' }],
    ],
    {
      animate: { rotate: [0, -3, 2.5, -1, 0] },
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
    [12, 16],
  ],
  [
    'path',
    { d: 'm7 21 5-5 5 5' },
    {
      animate: { scaleX: [1, 1.15, 0.97, 1] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.05,
      },
    },
    [12, 16],
  ],
])
