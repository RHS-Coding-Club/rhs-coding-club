import { createIcon } from './create-icon'

export const Expand = /* @__PURE__ */ createIcon('Expand', [
  [
    'g',
    [
      ['path', { d: 'M3 8V3h5' }],
      ['path', { d: 'M9 9 3 3' }],
    ],
    {
      animate: { x: [0, 1.5, -1.5, 0], y: [0, 1.5, -1.5, 0] },
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] },
    },
  ],
  [
    'g',
    [
      ['path', { d: 'M21 8V3h-5' }],
      ['path', { d: 'm15 9 6-6' }],
    ],
    {
      animate: { x: [0, -1.5, 1.5, 0], y: [0, 1.5, -1.5, 0] },
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] },
    },
  ],
  [
    'g',
    [
      ['path', { d: 'M3 16v5h5' }],
      ['path', { d: 'm3 21 6-6' }],
    ],
    {
      animate: { x: [0, 1.5, -1.5, 0], y: [0, -1.5, 1.5, 0] },
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] },
    },
  ],
  [
    'g',
    [
      ['path', { d: 'M21 16v5h-5' }],
      ['path', { d: 'm15 15 6 6' }],
    ],
    {
      animate: { x: [0, -1.5, 1.5, 0], y: [0, -1.5, 1.5, 0] },
      transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] },
    },
  ],
])
