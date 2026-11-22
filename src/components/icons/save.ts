import { createIcon } from './create-icon'

export const Save = /* @__PURE__ */ createIcon('Save', [
  [
    'path',
    {
      d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    },
  ],
  [
    'path',
    { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' },
    {
      animate: { y: [0, -1, -0.2, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
  [
    'path',
    { d: 'M7 3v4a1 1 0 0 0 1 1h7' },
    {
      animate: { x: [0, 2, -0.4, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] },
    },
  ],
])
