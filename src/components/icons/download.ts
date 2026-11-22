import { createIcon } from './create-icon'

export const Download = /* @__PURE__ */ createIcon('Download', [
  [
    'g',
    [
      ['path', { d: 'M12 15V3' }],
      ['path', { d: 'm7 10 5 5 5-5' }],
    ],
    {
      animate: { y: [0, 4, -4, 0], opacity: [1, 0, 0, 1] },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 0.5, 1] },
    },
  ],
  [
    'path',
    { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    {
      animate: { y: [0, 0, 1, 0] },
      transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.75, 0.9, 1] },
    },
  ],
])
