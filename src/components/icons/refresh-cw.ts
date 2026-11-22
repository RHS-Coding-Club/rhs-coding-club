import { createIcon } from './create-icon'

export const RefreshCw = /* @__PURE__ */ createIcon('RefreshCw', [
  [
    'g',
    [
      ['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }],
      ['path', { d: 'M21 3v5h-5' }],
      ['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }],
      ['path', { d: 'M8 16H3v5' }],
    ],
    {
      animate: { rotate: [0, 180], scale: [1, 0.92, 1] },
      transition: { duration: 0.9, ease: 'easeInOut' },
    },
    [12, 12],
  ],
])
