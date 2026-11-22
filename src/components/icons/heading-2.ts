import { createIcon } from './create-icon'

export const Heading2 = /* @__PURE__ */ createIcon('Heading2', [
  [
    'path',
    { d: 'M4 12h8' },
    {
      animate: { y: [0, -2.5, 0.8, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  ['path', { d: 'M4 18V6' }],
  ['path', { d: 'M12 18V6' }],
  [
    'path',
    { d: 'M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1' },
    {
      animate: { y: [0, -2, 0.8, 0] },
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.35, 0.7, 1],
        delay: 0.12,
      },
    },
  ],
])
