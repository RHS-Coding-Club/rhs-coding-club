import { createIcon } from './create-icon'

export const ExternalLink = /* @__PURE__ */ createIcon('ExternalLink', [
  [
    'g',
    [
      ['path', { d: 'M15 3h6v6' }],
      ['path', { d: 'M10 14 21 3' }],
    ],
    {
      animate: { x: [0, 1.5, -0.4, 0], y: [0, -1.5, 0.4, 0] },
      transition: { duration: 0.6, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
    },
  ],
  ['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }],
])
