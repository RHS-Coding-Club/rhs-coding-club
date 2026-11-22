import { createIcon } from './create-icon'

export const LogOut = /* @__PURE__ */ createIcon('LogOut', [
  [
    'g',
    [
      ['path', { d: 'm16 17 5-5-5-5' }],
      ['path', { d: 'M21 12H9' }],
    ],
    {
      animate: { x: [0, -1, 1.6, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.25, 0.65, 1] },
    },
  ],
  ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }],
])
